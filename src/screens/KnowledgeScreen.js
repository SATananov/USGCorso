import USGSectionScreen from '../components/USGSectionScreen';

export default function KnowledgeScreen() {
  return (
    <USGSectionScreen
      heroImage={require('../../assets/knowledge-hero.png')}
      kicker="BREED KNOWLEDGE"
      title="Knowledge"
      subtitle="History, function, development, care and responsible ownership."
      body="This section will become the educational heart of USG Corso, connecting breed heritage with practical knowledge."
    />
  );
}
