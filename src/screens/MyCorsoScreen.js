import USGSectionScreen from '../components/USGSectionScreen';
import { useLanguage } from '../i18n/LanguageContext';

export default function MyCorsoScreen() {
  const { t } = useLanguage();

  return (
    <USGSectionScreen
      heroImage={require('../../assets/my-corso-hero.png')}
      kicker={t('sections.myCorso.kicker')}
      title={t('sections.myCorso.title')}
      subtitle={t('sections.myCorso.subtitle')}
      body={t('sections.myCorso.body')}
    />
  );
}
