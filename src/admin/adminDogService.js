import { supabase } from '../lib/supabase';

export async function getAdminDogs() {
  const result = await supabase.rpc('admin_list_dogs');

  if (result.error) {
    return result;
  }

  const hydrated = await Promise.all(
    (result.data ?? []).map(async (dog) => {
      if (!dog.photo_path) {
        return { ...dog, photo_url: null };
      }

      const signed = await supabase.storage
        .from('corso-photos')
        .createSignedUrl(dog.photo_path, 3600);

      return {
        ...dog,
        photo_url: signed.data?.signedUrl ?? null,
      };
    })
  );

  return { data: hydrated, error: null };
}

export async function getAdminDogDetails(dogId) {
  const result = await supabase.rpc('admin_get_dog_details', {
    target_dog_id: dogId,
  });

  if (result.error) {
    return result;
  }

  const dog = Array.isArray(result.data) ? result.data[0] : result.data;

  if (!dog) {
    return { data: null, error: null };
  }

  if (!dog.photo_path) {
    return { data: { ...dog, photo_url: null }, error: null };
  }

  const signed = await supabase.storage
    .from('corso-photos')
    .createSignedUrl(dog.photo_path, 3600);

  return {
    data: {
      ...dog,
      photo_url: signed.data?.signedUrl ?? null,
    },
    error: signed.error,
  };
}

export async function updateAdminDog(dogId, values) {
  return supabase.rpc('admin_update_dog', {
    target_dog_id: dogId,
    dog_name: values.name.trim(),
    dog_sex: values.sex.trim(),
    dog_color: values.color.trim() || null,
    dog_birth_date: values.birthDate.trim() || null,
    dog_country: values.country.trim() || null,
    dog_city: values.city.trim() || null,
    dog_kennel: values.kennel.trim() || null,
    dog_breeder: values.breeder.trim() || null,
    dog_registration_number: values.registrationNumber.trim() || null,
    dog_description: values.description.trim() || null,
    dog_community_visible: Boolean(values.communityVisible),
  });
}

export async function deleteAdminDogPhoto(dogId) {
  const result = await supabase.rpc('admin_remove_dog_photo', {
    target_dog_id: dogId,
  });

  if (result.error) {
    return result;
  }

  const storagePath = result.data;

  if (storagePath) {
    const storageResult = await supabase.storage
      .from('corso-photos')
      .remove([storagePath]);

    if (storageResult.error) {
      return { data: storagePath, error: storageResult.error };
    }
  }

  return { data: storagePath, error: null };
}

export async function deleteAdminDog(dogId) {
  const result = await supabase.rpc('admin_delete_dog', {
    target_dog_id: dogId,
  });

  if (result.error) {
    return result;
  }

  const storagePath = result.data;

  if (storagePath) {
    const storageResult = await supabase.storage
      .from('corso-photos')
      .remove([storagePath]);

    if (storageResult.error) {
      return { data: storagePath, error: storageResult.error };
    }
  }

  return { data: storagePath, error: null };
}
