import USGSectionScreen from '../components/USGSectionScreen';
import { useLanguage } from '../i18n/LanguageContext';

export default function CommunityScreen() {
  const { t } = useLanguage();

  return (
    <USGSectionScreen
      heroImage={require('../../assets/community-hero.png')}
      kicker={t('sections.community.kicker')}
      title={t('sections.community.title')}
      subtitle={t('sections.community.subtitle')}
      body={t('sections.community.body')}
    />
  );
}
