import USGSectionScreen from '../components/USGSectionScreen';

export default function CorsoMatchScreen() {
  return (
    <USGSectionScreen
      heroImage={require('../../assets/corso-match-hero.png')}
      kicker="EDUCATIONAL MATCH"
      title="Corso Match"
      subtitle="Is the Cane Corso the right dog for your lifestyle?"
      body="This section will become an educational questionnaire focused on expectations, experience, time, activity and responsibility."
    />
  );
}
