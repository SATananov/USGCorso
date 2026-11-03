export const serviceCategoryGroups = [
  {
    key: 'professionals',
    labels: {
      en: 'Professionals & Services',
      bg: 'Професионалисти и услуги',
      it: 'Professionisti e servizi',
    },
    items: [
      { key: 'breeders', labels: { en: 'Breeders', bg: 'Развъдници', it: 'Allevatori' } },
      { key: 'trainers', labels: { en: 'Trainers', bg: 'Треньори', it: 'Addestratori' } },
      { key: 'veterinary', labels: { en: 'Veterinary', bg: 'Ветеринарни специалисти', it: 'Veterinari' } },
      { key: 'handlers', labels: { en: 'Handlers', bg: 'Хендлъри', it: 'Handler' } },
      { key: 'transport', labels: { en: 'Transport', bg: 'Транспорт', it: 'Trasporto' } },
      { key: 'petShops', labels: { en: 'Pet Shops', bg: 'Зоомагазини', it: 'Negozi per animali' } },
      { key: 'dogHotels', labels: { en: 'Dog Hotels & Boarding', bg: 'Хотели и пансиони за кучета', it: 'Hotel e pensioni per cani' } },
      { key: 'sheltersRescues', labels: { en: 'Shelters & Rescues', bg: 'Приюти и спасителни центрове', it: 'Rifugi e centri di recupero' } },
      { key: 'grooming', labels: { en: 'Grooming', bg: 'Груминг', it: 'Toelettatura' } },
      { key: 'rehabilitation', labels: { en: 'Rehabilitation & Physiotherapy', bg: 'Рехабилитация и физиотерапия', it: 'Riabilitazione e fisioterapia' } },
      { key: 'behavior', labels: { en: 'Behavior Specialists', bg: 'Поведенчески специалисти', it: 'Specialisti del comportamento' } },
      { key: 'nutrition', labels: { en: 'Nutrition Specialists', bg: 'Специалисти по хранене', it: 'Specialisti della nutrizione' } },
      { key: 'photographers', labels: { en: 'Photographers', bg: 'Фотографи', it: 'Fotografi' } },
    ],
  },
  {
    key: 'organizations',
    labels: {
      en: 'Organizations & Clubs',
      bg: 'Организации и клубове',
      it: 'Organizzazioni e club',
    },
    items: [
      { key: 'caneCorsoClubs', labels: { en: 'Cane Corso Clubs', bg: 'Клубове Кане Корсо', it: 'Club Cane Corso' } },
      { key: 'breedAssociations', labels: { en: 'Breed Associations', bg: 'Породни асоциации', it: 'Associazioni di razza' } },
      { key: 'kennelOrganizations', labels: { en: 'Kennel Organizations', bg: 'Киноложки организации', it: 'Organizzazioni cinofile' } },
      { key: 'workingDogClubs', labels: { en: 'Working Dog Clubs', bg: 'Клубове за работни кучета', it: 'Club per cani da lavoro' } },
      { key: 'rescueOrganizations', labels: { en: 'Rescue Organizations', bg: 'Спасителни организации', it: 'Organizzazioni di recupero' } },
      { key: 'eventOrganizations', labels: { en: 'Event & Show Organizations', bg: 'Организатори на събития и изложби', it: 'Organizzazioni di eventi ed esposizioni' } },
      { key: 'trainingAssociations', labels: { en: 'Training Associations', bg: 'Асоциации за обучение', it: 'Associazioni di addestramento' } },
      { key: 'veterinaryAssociations', labels: { en: 'Veterinary Associations', bg: 'Ветеринарни асоциации', it: 'Associazioni veterinarie' } },
      { key: 'culturalOrganizations', labels: { en: 'Cultural & Historical Organizations', bg: 'Културни и исторически организации', it: 'Organizzazioni culturali e storiche' } },
    ],
  },
];

export function getServiceLabel(entry, language) {
  return entry.labels?.[language] ?? entry.labels?.en ?? entry.key;
}
