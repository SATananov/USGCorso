const pad = value => String(value).padStart(2, '0');

function isValidCalendarParts(year, month, day) {
  if (!Number.isInteger(year) || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
  const monthLengths = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= monthLengths[month - 1];
}

export function parseCareHistoryDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof value === 'string' ? value : '');
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (!isValidCalendarParts(year, month, day)) return null;
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(12, 0, 0, 0);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}


function getCalendarDateParts(value) {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return [value.getFullYear(), value.getMonth() + 1, value.getDate()];
  }
  if (typeof value !== 'string') return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match || !isValidCalendarParts(Number(match[1]), Number(match[2]), Number(match[3]))) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function getCareHistoryDayOrdinal(value) {
  const parts = getCalendarDateParts(value);
  if (!parts) return null;
  let [year, month, day] = parts;
  year -= month <= 2 ? 1 : 0;
  const era = Math.floor(year / 400);
  const yearOfEra = year - era * 400;
  const shiftedMonth = month + (month > 2 ? -3 : 9);
  const dayOfYear = Math.floor((153 * shiftedMonth + 2) / 5) + day - 1;
  const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
  return era * 146097 + dayOfEra;
}

export function isCareHistoryDateInRange(entryValue, currentDate, range) {
  if (range !== '30' && range !== '365') return true;
  const entryOrdinal = getCareHistoryDayOrdinal(entryValue);
  const currentOrdinal = getCareHistoryDayOrdinal(currentDate instanceof Date ? currentDate : new Date());
  if (entryOrdinal === null || currentOrdinal === null) return true;
  const ageInCalendarDays = currentOrdinal - entryOrdinal;
  if (ageInCalendarDays < 0) return false;
  return range === '30' ? ageInCalendarDays <= 29 : ageInCalendarDays <= 364;
}

export function getDeviceCareHistoryLocale() {
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
      const locale = Intl.DateTimeFormat().resolvedOptions().locale;
      if (locale && Intl.DateTimeFormat.supportedLocalesOf([locale]).length) return locale;
    }
  } catch {}
  return 'en-GB';
}

function getFormatter(locale, options) {
  if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
    const candidate = locale || getDeviceCareHistoryLocale();
    try {
      if (Intl.DateTimeFormat.supportedLocalesOf([candidate]).length) return new Intl.DateTimeFormat(candidate, options);
    } catch {}
    try {
      return new Intl.DateTimeFormat('en-GB', options);
    } catch {}
  }
  return null;
}

export function formatCareHistoryDate(value, locale) {
  const date = parseCareHistoryDate(value);
  if (!date) return value == null ? '' : String(value);
  const formatter = getFormatter(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
  return formatter ? formatter.format(date) : pad(date.getDate()) + '/' + pad(date.getMonth() + 1) + '/' + date.getFullYear();
}

export function formatCareHistoryMonth(value, locale) {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return '';
  const formatter = getFormatter(locale, { month: 'long', year: 'numeric' });
  return formatter ? formatter.format(value) : value.getFullYear() + '-' + pad(value.getMonth() + 1);
}
