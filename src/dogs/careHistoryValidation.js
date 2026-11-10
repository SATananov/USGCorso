const pad = value => String(value).padStart(2, '0');
export function isValidCareHistoryDate(value, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || '')) return false;
  const [year, month, day] = value.split('-').map(Number);
  const candidate = new Date(year, month - 1, day);
  const current = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  return candidate.getFullYear() === year && candidate.getMonth() === month - 1 && candidate.getDate() === day && value <= current;
}
export function isValidCareQuantity(value, unit = 'g') {
  const quantity = Number(String(value ?? '').trim().replace(',', '.'));
  const decimalDigits = (String(value ?? '').trim().replace(',', '.').split('.')[1] || '').length;
  return Number.isFinite(quantity) && quantity > 0 && quantity <= 10000 && decimalDigits <= (unit === 'g' ? 1 : 3);
}
export function isValidCareWeight(value) {
  const weight = Number(String(value ?? '').trim().replace(',', '.'));
  return Number.isFinite(weight) && weight >= 0.1 && weight <= 250;
}
export function isValidCareDuration(value) {
  if (String(value ?? '').trim() === '') return true;
  const duration = Number(value);
  return Number.isInteger(duration) && duration >= 1 && duration <= 1440;
}
