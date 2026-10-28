import USGSectionScreen from '../components/USGSectionScreen';

export default function EventsScreen() {
  return (
    <USGSectionScreen
      heroImage={require('../../assets/events-hero.png')}
      kicker="CALENDAR"
      title="Events"
      subtitle="Shows, seminars, meetings and breed-related activities."
      body="This section will bring together upcoming dog shows, lectures, training events and Cane Corso community meetings."
    />
  );
}
