import USGSectionScreen from '../components/USGSectionScreen';
import { useLanguage } from '../i18n/LanguageContext';

export default function EventsScreen() {
  const { t } = useLanguage();

  return (
    <USGSectionScreen
      heroImage={require('../../assets/events-hero.png')}
      kicker={t('sections.events.kicker')}
      title={t('sections.events.title')}
      subtitle={t('sections.events.subtitle')}
      body={t('sections.events.body')}
    />
  );
}
