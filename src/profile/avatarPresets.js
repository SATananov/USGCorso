export const avatarPresets = [
  {
    id: 'natural-black',
    group: 'natural',
    source: require('../../assets/profile/avatars/natural-01.jpg'),
  },
  {
    id: 'natural-grey',
    group: 'natural',
    source: require('../../assets/profile/avatars/natural-02.jpg'),
  },
  {
    id: 'natural-brindle',
    group: 'natural',
    source: require('../../assets/profile/avatars/natural-03.jpg'),
  },
  {
    id: 'natural-fawn',
    group: 'natural',
    source: require('../../assets/profile/avatars/natural-04.jpg'),
  },
  {
    id: 'natural-dark',
    group: 'natural',
    source: require('../../assets/profile/avatars/natural-05.jpg'),
  },
  {
    id: 'natural-black-gold',
    group: 'natural',
    source: require('../../assets/profile/avatars/natural-06.jpg'),
  },
  {
    id: 'cropped-black',
    group: 'cropped',
    source: require('../../assets/profile/avatars/cropped-01.jpg'),
  },
  {
    id: 'cropped-grey',
    group: 'cropped',
    source: require('../../assets/profile/avatars/cropped-02.jpg'),
  },
  {
    id: 'cropped-brindle',
    group: 'cropped',
    source: require('../../assets/profile/avatars/cropped-03.jpg'),
  },
  {
    id: 'cropped-fawn',
    group: 'cropped',
    source: require('../../assets/profile/avatars/cropped-04.jpg'),
  },
  {
    id: 'cropped-black-white',
    group: 'cropped',
    source: require('../../assets/profile/avatars/cropped-05.jpg'),
  },
  {
    id: 'cropped-laurel',
    group: 'cropped',
    source: require('../../assets/profile/avatars/cropped-06.jpg'),
  },
];

export function getAvatarPreset(id) {
  return avatarPresets.find((item) => item.id === id) ?? avatarPresets[0];
}
