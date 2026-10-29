export const avatarPresets = [
  {
    id: 'natural-black',
    group: 'natural',
    source: require('../../assets/profile/avatars/natural-black.jpg'),
  },
  {
    id: 'natural-grey',
    group: 'natural',
    source: require('../../assets/profile/avatars/natural-grey.jpg'),
  },
  {
    id: 'natural-brindle',
    group: 'natural',
    source: require('../../assets/profile/avatars/natural-brindle.jpg'),
  },
  {
    id: 'natural-fawn',
    group: 'natural',
    source: require('../../assets/profile/avatars/natural-fawn.jpg'),
  },
  {
    id: 'natural-dark',
    group: 'natural',
    source: require('../../assets/profile/avatars/natural-dark.jpg'),
  },
  {
    id: 'natural-black-gold',
    group: 'natural',
    source: require('../../assets/profile/avatars/natural-black-gold.jpg'),
  },
  {
    id: 'cropped-black',
    group: 'cropped',
    source: require('../../assets/profile/avatars/cropped-black.jpg'),
  },
  {
    id: 'cropped-grey',
    group: 'cropped',
    source: require('../../assets/profile/avatars/cropped-grey.jpg'),
  },
  {
    id: 'cropped-brindle',
    group: 'cropped',
    source: require('../../assets/profile/avatars/cropped-brindle.jpg'),
  },
  {
    id: 'cropped-fawn',
    group: 'cropped',
    source: require('../../assets/profile/avatars/cropped-fawn.jpg'),
  },
  {
    id: 'cropped-black-white',
    group: 'cropped',
    source: require('../../assets/profile/avatars/cropped-black-white.jpg'),
  },
  {
    id: 'cropped-laurel',
    group: 'cropped',
    source: require('../../assets/profile/avatars/cropped-laurel.jpg'),
  },
];

export function getAvatarPreset(id) {
  return avatarPresets.find((item) => item.id === id) ?? avatarPresets[0];
}
