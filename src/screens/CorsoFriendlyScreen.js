import USGSectionScreen from '../components/USGSectionScreen';

export default function CorsoFriendlyScreen() {
  return (
    <USGSectionScreen
      heroImage={require('../../assets/corso-friendly-hero.png')}
      kicker="PLACES & TRAVEL"
      title="Corso Friendly"
      subtitle="Places that truly welcome Cane Corso and other large dogs."
      body="This section will focus on genuinely suitable locations, useful details, community verification and location-based discovery."
    />
  );
}
