import USGSectionScreen from '../components/USGSectionScreen';
import { useLanguage } from '../i18n/LanguageContext';

export default function AboutScreen() {
  const { t } = useLanguage();

  return (
    <USGSectionScreen
      heroImage={require('../../assets/about-usg-hero.png')}
      kicker={t('sections.about.kicker')}
      title={t('sections.about.title')}
      subtitle={t('sections.about.subtitle')}
      body={t('sections.about.body')}
    />
  );
}
