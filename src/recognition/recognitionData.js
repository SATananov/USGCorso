export function formatRecognitionDate(value, language) {
  if (typeof value !== 'string') return '';
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  if (!match) return '';
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return '';
  if (language === 'bg') return `${match[3]}.${match[2]}.${match[1]}`;
  if (language === 'it') return `${match[3]}/${match[2]}/${match[1]}`;
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function recognitionSnapshotFromApprovedCorso(corso) {
  if (!corso?.id || !corso.photo_path || !corso.photo_url || !corso.name) return null;
  return {
    dog_id: corso.id,
    source_photo_path: corso.photo_path,
    photo_url: corso.photo_url,
    dog_name: corso.name,
    sex: corso.sex ?? null,
    color: corso.color ?? null,
    birth_date: corso.birth_date ?? null,
    owner_name: null,
    issued_at: null,
    certificate_number: null,
    verification_url: null,
    status: 'preview',
  };
}
