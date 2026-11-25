import { supabase } from '../lib/supabase';

export async function searchPlaceAddress(query, language = 'en') {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const params = new URLSearchParams({
    q: normalizedQuery,
    limit: '6',
    lang: ['bg', 'en', 'it'].includes(language) ? language : 'en',
  });
  const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`Place search failed: ${response.status}`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload.features)) {
    throw new Error('Place search returned an invalid response.');
  }

  return payload.features
    .map((feature) => {
      const [longitude, latitude] = feature.geometry?.coordinates ?? [];
      const properties = feature.properties ?? {};
      const label = [
        properties.name,
        properties.street && properties.housenumber
          ? `${properties.street} ${properties.housenumber}`
          : properties.street,
        properties.postcode,
        properties.city || properties.town || properties.village,
        properties.state,
        properties.country,
      ]
        .filter(Boolean)
        .filter((part, index, parts) => parts.indexOf(part) === index)
        .join(', ');

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude) ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180 ||
        !label
      ) {
        return null;
      }

      return {
        latitude,
        longitude,
        label,
        type: properties.type ?? properties.osm_value ?? '',
      };
    })
    .filter(Boolean);
}

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
