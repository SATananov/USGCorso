export const placeMarkerKinds = {
  veterinary: 'medical',
  breeder: 'breeder',
  trainer: 'trainer',
  pet_shop: 'paw',
  large_dog_hotel: 'hotel',
  pet_transport: 'transport',
  grooming: 'grooming',
  pharmacy: 'pharmacy',
  park: 'park',
  dog_park: 'dogPark',
  shelter: 'shelter',
  boarding: 'boarding',
  dog_friendly_hotel: 'hotel',
  dog_friendly_food: 'food',
  pet_friendly_stay: 'stay',
  walking_area: 'walking',
  other: 'fallback',
};

export function getPlaceMarkerKind(category) {
  return placeMarkerKinds[category] ?? 'fallback';
}
