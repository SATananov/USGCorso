import USGSectionScreen from '../components/USGSectionScreen';

export default function ServicesScreen() {
  return (
    <USGSectionScreen
      heroImage={require('../../assets/services-hero.png')}
      kicker="TRUSTED NETWORK"
      title="Professionals & Services"
      subtitle="Useful people and services around the Cane Corso world."
      body="This section will connect users with breeders, trainers, veterinary professionals, handlers, transport and pet shops."
    />
  );
}
