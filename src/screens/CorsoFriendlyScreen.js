import USGSectionScreen from '../components/USGSectionScreen';
import { useLanguage } from '../i18n/LanguageContext';

export default function CorsoFriendlyScreen() {
  const { t } = useLanguage();

  return (
    <USGSectionScreen
      heroImage={require('../../assets/corso-friendly-hero.png')}
      kicker={t('sections.corsoFriendly.kicker')}
      title={t('sections.corsoFriendly.title')}
      subtitle={t('sections.corsoFriendly.subtitle')}
      body={t('sections.corsoFriendly.body')}
    />
  );
}
