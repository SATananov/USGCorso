const FALLBACK_LOCALE = 'en-GB';
const DATE_ONLY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_TIMESTAMP_PATTERN = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-]\d{2}:\d{2})$/;
const pad = value => String(value).padStart(2, '0');

function isLeapYear(year) {
  return year % 400 === 0 || year % 4 === 0 && year % 100 !== 0;
}

function isValidParts(year, month, day) {
  if (!Number.isInteger(year) || year < 0 || year > 9999 || !Number.isInteger(month) || !Number.isInteger(day)) return false;
  if (month < 1 || month > 12 || day < 1) return false;
  const monthLengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return day <= monthLengths[month - 1];
}

function parseDateOnly(value) {
  if (typeof value !== 'string') return null;
  const match = DATE_ONLY_PATTERN.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  return isValidParts(year, month, day) ? { year, month, day } : null;
}

function isSupportedLocale(locale) {
  if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function' || typeof locale !== 'string' || !locale) return false;
  try {
    if (typeof Intl.DateTimeFormat.supportedLocalesOf === 'function') return Intl.DateTimeFormat.supportedLocalesOf([locale]).length > 0;
    new Intl.DateTimeFormat(locale);
    return true;
  } catch {
    return false;
  }
}

function resolveDeviceLocale() {
  try {
    if (typeof Intl !== 'undefined' && typeof Intl.DateTimeFormat === 'function') {
      const locale = new Intl.DateTimeFormat().resolvedOptions().locale;
      if (isSupportedLocale(locale)) return locale;
    }
  } catch {}
  return FALLBACK_LOCALE;
}

function formatterLocale(locale) {
  const candidate = typeof locale === 'string' && locale.trim() ? locale.trim() : resolveDeviceLocale();
  return isSupportedLocale(candidate) ? candidate : FALLBACK_LOCALE;
}

function makeFormatter(locale, options) {
  if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function') return null;
  const candidate = formatterLocale(locale);
  try {
    return new Intl.DateTimeFormat(candidate, options);
  } catch {
    try {
      return new Intl.DateTimeFormat(FALLBACK_LOCALE, options);
    } catch {
      return null;
    }
  }
}

function utcDateForParts(parts) {
  const date = new Date(0);
  date.setUTCHours(12, 0, 0, 0);
  date.setUTCFullYear(parts.year, parts.month - 1, parts.day);
  if (date.getUTCFullYear() !== parts.year || date.getUTCMonth() !== parts.month - 1 || date.getUTCDate() !== parts.day) return null;
  return date;
}

function dateOnlyOptions(options) {
  const supplied = options && typeof options === 'object' ? { ...options } : {};
  for (const key of ['timeZone', 'hour', 'minute', 'second', 'fractionalSecondDigits', 'dayPeriod', 'hourCycle', 'timeStyle', 'timeZoneName']) delete supplied[key];
  const defaults = supplied.dateStyle ? {} : { day: '2-digit', month: '2-digit', year: 'numeric' };
  return { ...defaults, ...supplied, timeZone: 'UTC' };
}

function formatDateOnly(value, locale, options) {
  const parts = parseDateOnly(value);
  if (!parts) return '';
  const date = utcDateForParts(parts);
  if (!date) return '';
  const formatter = makeFormatter(locale, dateOnlyOptions(options));
  return formatter ? formatter.format(date) : `${pad(parts.day)}/${pad(parts.month)}/${String(parts.year).padStart(4, '0')}`;
}

function parseTimestamp(value) {
  if (typeof value !== 'string') return null;
  const match = ISO_TIMESTAMP_PATTERN.exec(value);
  if (!match || !parseDateOnly(match[1])) return null;
  const hour = Number(match[2]);
  const minute = Number(match[3]);
  const second = match[4] == null ? 0 : Number(match[4]);
  if (hour > 23 || minute > 59 || second > 59) return null;
  if (match[6] !== 'Z') {
    const offset = /[+-](\d{2}):(\d{2})$/.exec(match[6]);
    if (!offset || Number(offset[1]) > 23 || Number(offset[2]) > 59) return null;
  }
  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) ? new Date(milliseconds) : null;
}

function fallbackLocalDateTime(date, includeTime) {
  const datePart = `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  return includeTime ? `${datePart}, ${pad(date.getHours())}:${pad(date.getMinutes())}` : datePart;
}

function fallbackTimestampDate(date, options) {
  if (options.dateStyle != null) return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
  const year = options.year != null ? String(date.getFullYear()).padStart(4, '0') : '';
  const monthOption = options.month;
  const monthNumber = monthOption === '2-digit' ? pad(date.getMonth() + 1) : String(date.getMonth() + 1);
  const monthLong = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][date.getMonth()];
  const month = monthOption === 'long' ? monthLong : monthOption === 'short' ? monthLong.slice(0, 3) : monthOption != null ? monthNumber : '';
  const day = options.day === '2-digit' ? pad(date.getDate()) : options.day != null ? String(date.getDate()) : '';
  if (monthOption === 'long' || monthOption === 'short') return [month, day, year].filter(Boolean).join(' ');
  return [day, month, year].filter(Boolean).join('/');
}

function fallbackTimestampTime(date, options) {
  const hasTimeStyle = options.timeStyle != null;
  const hasHour = options.hour != null || options.dayPeriod != null || hasTimeStyle;
  const hasMinute = options.minute != null || hasTimeStyle;
  const hasSecond = options.second != null || options.fractionalSecondDigits != null;
  const hour12 = options.hour12 === true || options.hourCycle === 'h11' || options.hourCycle === 'h12';
  let hour = date.getHours();
  let suffix = '';
  if (hour12) {
    suffix = hour >= 12 ? ' PM' : ' AM';
    hour = hour % 12 || 12;
  }
  const parts = [];
  if (hasHour) parts.push(options.hour === '2-digit' || hasTimeStyle ? pad(hour) : String(hour));
  if (hasMinute) parts.push(options.minute === '2-digit' || hasTimeStyle ? pad(date.getMinutes()) : String(date.getMinutes()));
  if (hasSecond) {
    const second = options.second === '2-digit' ? pad(date.getSeconds()) : String(date.getSeconds());
    const fractionLength = options.fractionalSecondDigits;
    const fraction = fractionLength ? '.' + String(date.getMilliseconds()).padStart(3, '0').slice(0, fractionLength) : '';
    parts.push(second + fraction);
  }
  return parts.join(':') + suffix;
}

function fallbackTimestamp(date, options) {
  const dateKeys = ['weekday', 'era', 'year', 'month', 'day'];
  const timeKeys = ['dayPeriod', 'hour', 'minute', 'second', 'fractionalSecondDigits'];
  const hasDate = options.dateStyle != null || dateKeys.some(key => options[key] != null);
  const hasTime = options.timeStyle != null || timeKeys.some(key => options[key] != null);
  if (!hasDate && !hasTime) return fallbackLocalDateTime(date, true);
  const datePart = hasDate ? fallbackTimestampDate(date, options) : '';
  const timePart = hasTime ? fallbackTimestampTime(date, options) : '';
  if (datePart && timePart) return `${datePart}, ${timePart}`;
  return datePart || timePart;
}

function formatTimestamp(value, locale, options) {
  const date = parseTimestamp(value);
  if (!date) return '';
  const supplied = options && typeof options === 'object' ? { ...options } : {};
  delete supplied.timeZone;
  const componentKeys = [
    'weekday', 'era', 'year', 'month', 'day', 'dayPeriod',
    'hour', 'minute', 'second', 'fractionalSecondDigits',
    'timeZoneName',
  ];
  const hasComponents = componentKeys.some(key => supplied[key] != null);
  const hasStyles = supplied.dateStyle != null || supplied.timeStyle != null;
  const defaults = hasComponents || hasStyles ? {} : { dateStyle: 'medium', timeStyle: 'short' };
  const formatter = makeFormatter(locale, { ...defaults, ...supplied });
  return formatter ? formatter.format(date) : fallbackTimestamp(date, supplied);
}

function calendarParts(value) {
  if (typeof value === 'string') return parseDateOnly(value);
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) return null;
  return { year: value.getFullYear(), month: value.getMonth() + 1, day: 1 };
}

function formatMonthYear(value, locale, options) {
  const parts = calendarParts(value);
  if (!parts || !isValidParts(parts.year, parts.month, parts.day)) return '';
  const date = utcDateForParts(parts);
  if (!date) return '';
  const supplied = options && typeof options === 'object' ? { ...options } : {};
  for (const key of ['timeZone', 'day', 'weekday', 'era', 'hour', 'minute', 'second', 'fractionalSecondDigits', 'dayPeriod', 'hourCycle', 'dateStyle', 'timeStyle', 'timeZoneName']) delete supplied[key];
  const formatter = makeFormatter(locale, { month: 'long', year: 'numeric', ...supplied, timeZone: 'UTC' });
  return formatter ? formatter.format(date) : `${String(parts.year).padStart(4, '0')}-${pad(parts.month)}`;
}

function formatTime(value, locale, options) {
  const match = /^(\d{2}):(\d{2})$/.exec(typeof value === 'string' ? value : '');
  if (!match) return '';
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return '';
  const date = new Date(0);
  date.setUTCHours(hour, minute, 0, 0);
  const supplied = options && typeof options === 'object' ? { ...options } : {};
  for (const key of ['timeZone', 'dateStyle', 'timeStyle', 'year', 'month', 'day', 'weekday', 'era', 'timeZoneName']) delete supplied[key];
  const defaults = supplied.hour || supplied.minute || supplied.second ? {} : { hour: 'numeric', minute: '2-digit' };
  const formatter = makeFormatter(locale, { ...defaults, ...supplied, timeZone: 'UTC' });
  return formatter ? formatter.format(date) : `${pad(hour)}:${pad(minute)}`;
}

export { resolveDeviceLocale, parseDateOnly, formatDateOnly, formatTimestamp, formatMonthYear, formatTime };
