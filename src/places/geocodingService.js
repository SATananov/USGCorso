import { supabase } from '../lib/supabase';

export async function reverseGeocodePlace({ latitude, longitude, language }) {
  const { data, error } = await supabase.functions.invoke('reverse-geocode', {
    body: {
      latitude,
      longitude,
      language,
    },
  });

  if (error) {
    throw error;
  }

  return data;
}
