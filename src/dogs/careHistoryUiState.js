const foodTypes = ['dry', 'wet', 'barf', 'home', 'canned', 'supplement', 'treat', 'other'];
const careTypes = ['walking', 'bathing', 'brushing', 'training', 'nails', 'ears', 'eyes', 'deworm', 'other'];
const healthTypes = ['weightType', 'vet', 'vaccine', 'medication', 'symptom', 'other'];

export function getCareHistoryOptions(section) {
  if (section === 'feeding') return foodTypes;
  if (section === 'care') return careTypes;
  if (section === 'health') return healthTypes;
  return [];
}

export function getActiveCareHistoryType(section, state) {
  if (section === 'feeding') return state.foodType;
  if (section === 'care') return state.careType;
  if (section === 'health') return state.healthType;
  return null;
}

export function resolveCareHistoryType(section, value, translations = {}) {
  const options = getCareHistoryOptions(section);
  if (options.includes(value)) return value;
  for (const option of options) {
    if (Object.values(translations).some(language => language && language[option] === value)) return option;
  }
  return null;
}

export function getCareHistoryTimeOptions() {
  return {
    hours: Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')),
    minutes: Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
  };
}
