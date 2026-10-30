const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function getComponent(components, types) {
  const item = components.find((component) =>
    types.some((type) => component.types.includes(type))
  );

  return item?.long_name ?? '';
}

function toRadians(value) {
  return (value * Math.PI) / 180;
}

function distanceMeters(
  latitude,
  longitude,
  resultLatitude,
  resultLongitude
) {
  const earthRadius = 6371000;
  const dLat = toRadians(resultLatitude - latitude);
  const dLon = toRadians(resultLongitude - longitude);
  const lat1 = toRadians(latitude);
  const lat2 = toRadians(resultLatitude);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function resultScore(result, latitude, longitude) {
  const types = Array.isArray(result.types) ? result.types : [];
  const locationType = result.geometry?.location_type ?? '';
  const resultLatitude = Number(result.geometry?.location?.lat);
  const resultLongitude = Number(result.geometry?.location?.lng);

  let score = 0;

  if (types.includes('street_address')) score += 500;
  if (types.includes('premise')) score += 420;
  if (types.includes('subpremise')) score += 410;
  if (types.includes('establishment')) score += 330;
  if (types.includes('point_of_interest')) score += 320;
  if (types.includes('park')) score += 300;
  if (types.includes('route')) score += 220;

  if (locationType === 'ROOFTOP') score += 260;
  if (locationType === 'RANGE_INTERPOLATED') score += 150;
  if (locationType === 'GEOMETRIC_CENTER') score += 80;
  if (locationType === 'APPROXIMATE') score += 20;

  if (Number.isFinite(resultLatitude) && Number.isFinite(resultLongitude)) {
    const distance = distanceMeters(
      latitude,
      longitude,
      resultLatitude,
      resultLongitude
    );

    score += Math.max(0, 220 - Math.min(distance, 220));
  }

  return score;
}

function routeNameFromResult(result) {
  const components = Array.isArray(result?.address_components)
    ? result.address_components
    : [];

  return getComponent(components, ['route']);
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  const apiKey = Deno.env.get('GOOGLE_MAPS_GEOCODING_API_KEY');

  if (!apiKey) {
    return json({ error: 'Geocoding service is not configured' }, 503);
  }

  let body;

  try {
    body = await request.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const latitude = Number(body.latitude);
  const longitude = Number(body.longitude);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return json({ error: 'Invalid coordinates' }, 400);
  }

  const language =
    typeof body.language === 'string' && body.language.trim()
      ? body.language.trim().slice(0, 10)
      : 'en';

  const params = new URLSearchParams({
    latlng: `${latitude},${longitude}`,
    key: apiKey,
    language,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?${params.toString()}`
  );

  if (!response.ok) {
    return json({ error: 'Google Geocoding request failed' }, 502);
  }

  const payload = await response.json();

  if (payload.status !== 'OK' || !Array.isArray(payload.results)) {
    return json({
      source: 'google',
      status: payload.status ?? 'UNKNOWN_ERROR',
      result: null,
    });
  }

  const ranked = [...payload.results].sort(
    (a, b) =>
      resultScore(b, latitude, longitude) -
      resultScore(a, latitude, longitude)
  );

  const postal = ranked[0];

  if (!postal) {
    return json({
      source: 'google',
      status: 'ZERO_RESULTS',
      result: null,
    });
  }

  const routeResult = payload.results.find(
    (result) =>
      Array.isArray(result.types) &&
      result.types.includes('route') &&
      routeNameFromResult(result)
  );

  const postalComponents = Array.isArray(postal.address_components)
    ? postal.address_components
    : [];

  const streetNumber = getComponent(postalComponents, ['street_number']);
  const postalRoute = getComponent(postalComponents, ['route']);
  const premise = getComponent(postalComponents, ['premise']);
  const subpremise = getComponent(postalComponents, ['subpremise']);

  const postalAddressParts = [
    streetNumber,
    postalRoute,
    premise,
    subpremise,
  ].filter(Boolean);

  const city =
    getComponent(postalComponents, ['locality']) ||
    getComponent(postalComponents, ['postal_town']) ||
    getComponent(postalComponents, ['administrative_area_level_3']) ||
    getComponent(postalComponents, ['administrative_area_level_2']);

  const country = getComponent(postalComponents, ['country']);
  const locationType = postal.geometry?.location_type ?? 'UNKNOWN';
  const nearestStreet = routeNameFromResult(routeResult);

  return json({
    source: 'google',
    status: payload.status,
    result: {
      nearestStreet,
      postalAddress:
        postalAddressParts.join(', ') ||
        postal.formatted_address ||
        '',
      formattedAddress: postal.formatted_address ?? '',
      address:
        nearestStreet ||
        postalAddressParts.join(', ') ||
        postal.formatted_address ||
        '',
      city,
      country,
      placeId: postal.place_id ?? '',
      locationType,
      types: Array.isArray(postal.types) ? postal.types : [],
      precise: locationType === 'ROOFTOP',
    },
  });
});
