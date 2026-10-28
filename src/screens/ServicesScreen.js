import USGSectionScreen from '../components/USGSectionScreen';
import { useLanguage } from '../i18n/LanguageContext';

export default function ServicesScreen() {
  const { t } = useLanguage();

  return (
    <USGSectionScreen
      heroImage={require('../../assets/services-hero.png')}
      kicker={t('sections.services.kicker')}
      title={t('sections.services.title')}
      subtitle={t('sections.services.subtitle')}
      body={t('sections.services.body')}
    />
  );
}
