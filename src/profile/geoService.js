const API_BASE = 'https://countriesnow.space/api/v0.1';

export async function getCountries() {
  const response = await fetch(`${API_BASE}/countries`);

  if (!response.ok) {
    throw new Error(`Countries request failed: ${response.status}`);
  }

  const payload = await response.json();

  if (payload.error || !Array.isArray(payload.data)) {
    throw new Error(payload.msg || 'Countries could not be loaded.');
  }

  return payload.data
    .map((item) => item.country)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
}

export async function getCities(country) {
  const response = await fetch(`${API_BASE}/countries/cities`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ country }),
  });

  if (!response.ok) {
    throw new Error(`Cities request failed: ${response.status}`);
  }

  const payload = await response.json();

  if (payload.error || !Array.isArray(payload.data)) {
    throw new Error(payload.msg || 'Cities could not be loaded.');
  }

  return [...new Set(payload.data.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}


export async function getCountryPosition(country) {
  if (!country) {
    return null;
  }

  const response = await fetch(`${API_BASE}/countries/positions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ country }),
  });

  if (!response.ok) {
    throw new Error(`Country position request failed: ${response.status}`);
  }

  const payload = await response.json();

  if (
    payload.error ||
    !payload.data ||
    typeof payload.data.lat !== 'number' ||
    typeof payload.data.long !== 'number'
  ) {
    throw new Error(payload.msg || 'Country position could not be loaded.');
  }

  return {
    latitude: payload.data.lat,
    longitude: payload.data.long,
  };
}
