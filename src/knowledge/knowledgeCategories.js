export const KNOWLEDGE_CATEGORY_KEYS = [
  'basics',
  'history',
  'function_type',
  'development',
  'nutrition',
  'training',
  'behavior',
  'health_care',
];

const labels = {
  bg: {
    basics: 'Основи за Кане Корсо',
    history: 'История и наследство',
    function_type: 'Функция и тип',
    development: 'Растеж и развитие',
    nutrition: 'Хранене',
    training: 'Обучение',
    behavior: 'Поведение',
    health_care: 'Здраве и грижи',
  },
  en: {
    basics: 'Cane Corso basics',
    history: 'History and heritage',
    function_type: 'Function and type',
    development: 'Growth and development',
    nutrition: 'Nutrition',
    training: 'Training',
    behavior: 'Behavior',
    health_care: 'Health and care',
  },
  it: {
    basics: 'Fondamenti sul Cane Corso',
    history: 'Storia e patrimonio',
    function_type: 'Funzione e tipo',
    development: 'Crescita e sviluppo',
    nutrition: 'Alimentazione',
    training: 'Educazione',
    behavior: 'Comportamento',
    health_care: 'Salute e cura',
  },
};

const headings = {
  bg: 'Категория',
  en: 'Category',
  it: 'Categoria',
};

export function getKnowledgeCategoryLabel(key, language = 'en') {
  return labels[language]?.[key] ?? labels.en[key] ?? key;
}

export function getKnowledgeCategoryHeading(language = 'en') {
  return headings[language] ?? headings.en;
}
