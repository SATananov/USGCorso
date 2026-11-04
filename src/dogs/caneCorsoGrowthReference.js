export const CANE_CORSO_PUBLISHED_MEANS = [
  { month: 1, female: 4, male: 4.5 },
  { month: 2, female: 8.5, male: 9 },
  { month: 3, female: 12.5, male: 13.5 },
  { month: 4, female: 16.5, male: 18 },
  { month: 5, female: 22.5, male: 24.5 },
  { month: 6, female: 28, male: 31.5 },
  { month: 7, female: 33.5, male: 37.5 },
  { month: 8, female: 36, male: 40 },
  { month: 9, female: 38, male: 42 },
  { month: 10, female: 40, male: 44 },
  { month: 11, female: 41.5, male: 44.5 },
  { month: 12, female: 43, male: 47.5 },
];

export const CANE_CORSO_GROWTH_SOURCES = {
  article: 'https://doi.org/10.32782/bsnau.lvst.2026.2.14',
  fci: 'https://www.fci.be/Nomenclature/Standards/343g02-en.pdf',
  waltham: 'https://www.waltham.com/resources/puppy-growth-charts',
};

export function dogAgeInMonths(birthDate, measuredOn) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate || '') || !/^\d{4}-\d{2}-\d{2}$/.test(measuredOn || '')) return null;
  const [by, bm, bd] = birthDate.split('-').map(Number);
  const [my, mm, md] = measuredOn.split('-').map(Number);
  const birth = Date.UTC(by, bm - 1, bd);
  const measured = Date.UTC(my, mm - 1, md);
  if (!Number.isFinite(birth) || !Number.isFinite(measured) || measured < birth) return null;
  return (my - by) * 12 + (mm - bm) + (md - bd) / 30.4375;
}
