import USGSectionScreen from '../components/USGSectionScreen';

export default function MyCorsoScreen() {
  return (
    <USGSectionScreen
      heroImage={require('../../assets/my-corso-hero.png')}
      kicker="OWNER SPACE"
      title="My Corso"
      subtitle="Growth, care, behavior and life with your Cane Corso."
      body="This section will become the personal space for the dog — growth, care, behavior, challenges and journal."
    />
  );
}
