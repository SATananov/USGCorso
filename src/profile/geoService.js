const API_BASE = 'https://countriesnow.space/api/v0.1';

const COUNTRY_ALIASES = {
  Bulgaria: ['България', 'Bulgaria'],
  Italy: ['Италия', 'Italia', 'Italy'],
  Germany: ['Германия', 'Germania', 'Deutschland', 'Germany'],
  Czechia: ['Чехия', 'Repubblica Ceca', 'Česko', 'Czech Republic', 'Czechia'],
  Hungary: ['Унгария', 'Ungheria', 'Magyarország', 'Hungary'],
  Denmark: ['Дания', 'Danimarca', 'Danmark', 'Denmark'],
  Norway: ['Норвегия', 'Norvegia', 'Norge', 'Norway'],
  Sweden: ['Швеция', 'Svezia', 'Sverige', 'Sweden'],
  Belgium: ['Белгия', 'Belgio', 'Belgique', 'België', 'Belgium'],
  Ireland: ['Ирландия', 'Irlanda', 'Éire', 'Ireland'],
  Finland: ['Финландия', 'Finlandia', 'Suomi', 'Finland'],
  Cyprus: ['Кипър', 'Cipro', 'Κύπρος', 'Cyprus'],
  France: ['Франция', 'Francia', 'France'],
  Spain: ['Испания', 'Spagna', 'España', 'Spain'],
  Greece: ['Гърция', 'Grecia', 'Ελλάδα', 'Greece'],
  Romania: ['Румъния', 'Romania', 'România'],
  Turkey: ['Турция', 'Turchia', 'Türkiye', 'Turkey'],
  Austria: ['Австрия', 'Austria', 'Österreich'],
  Portugal: ['Португалия', 'Portogallo', 'Portugal'],
  Poland: ['Полша', 'Polonia', 'Polska', 'Poland'],
  Serbia: ['Сърбия', 'Serbia', 'Srbija'],
  Croatia: ['Хърватия', 'Croazia', 'Hrvatska', 'Croatia'],
  Ukraine: ['Украйна', 'Ucraina', 'Україна', 'Ukraine'],
  Russia: ['Русия', 'Russia', 'Россия'],
  Netherlands: ['Нидерландия', 'Paesi Bassi', 'Nederland', 'Holland', 'Netherlands'],
  Switzerland: ['Швейцария', 'Svizzera', 'Schweiz', 'Switzerland'],
  'United Kingdom': ['Великобритания', 'Обединено кралство', 'Regno Unito', 'UK', 'Britain', 'United Kingdom'],
  'United States': ['САЩ', 'Съединени щати', 'Stati Uniti', 'USA', 'US', 'America', 'United States', 'United States of America'],
  Canada: ['Канада', 'Canada'],
  Australia: ['Австралия', 'Australia'],
  Japan: ['Япония', 'Giappone', '日本', 'Japan'],
  China: ['Китай', 'Cina', '中国', 'China'],
  India: ['Индия', 'India'],
};

const CITY_ALIASES = {
  Bulgaria: {
    Sofia: ['София', 'Sofiya'],
    Plovdiv: ['Пловдив'],
    Varna: ['Варна'],
    Burgas: ['Бургас'],
  },
  Italy: {
    Rome: ['Roma'],
    Milan: ['Milano'],
    Florence: ['Firenze'],
    Venice: ['Venezia'],
    Naples: ['Napoli'],
    Turin: ['Torino'],
  },
  Germany: {
    Cologne: ['Köln'],
    Munich: ['München'],
    Nuremberg: ['Nürnberg'],
  },
  Greece: {
    Athens: ['Αθήνα'],
    Thessaloniki: ['Θεσσαλονίκη'],
  },
  Spain: {
    Seville: ['Sevilla'],
  },
};

export function normalizeGeoName(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .trim();
}

function findAliasGroup(name, groups) {
  const normalized = normalizeGeoName(name);
  return Object.entries(groups).find(([canonical, aliases]) =>
    [canonical, ...aliases].some((alias) => normalizeGeoName(alias) === normalized)
  );
}

export function getCountrySearchAliases(country) {
  const match = findAliasGroup(country, COUNTRY_ALIASES);
  return match ? match[1] : [];
}

export function getCitySearchAliases(city, country) {
  const countryMatch = findAliasGroup(country, COUNTRY_ALIASES);
  const countryName = countryMatch?.[0] ?? country;
  const cityGroups = CITY_ALIASES[countryName] ?? {};
  const match = findAliasGroup(city, cityGroups);
  return match ? match[1] : [];
}

export function findGeoOption(value, options, getAliases = () => []) {
  const normalized = normalizeGeoName(value);
  if (!normalized) return null;
  return options.find((option) =>
    [option, ...getAliases(option)].some((candidate) => normalizeGeoName(candidate) === normalized)
  ) ?? null;
}

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
