import USGSectionScreen from '../components/USGSectionScreen';

export default function CommunityScreen() {
  return (
    <USGSectionScreen
      heroImage={require('../../assets/community-hero.png')}
      kicker="PEOPLE & DOGS"
      title="Community"
      subtitle="Responsible connections inside the Cane Corso community."
      body="This section will support Lost & Found, responsible New Home posts, Breeding Match and community interaction."
    />
  );
}
