import USGSectionScreen from '../components/USGSectionScreen';
import { useLanguage } from '../i18n/LanguageContext';

export default function KnowledgeScreen() {
  const { t } = useLanguage();

  return (
    <USGSectionScreen
      heroImage={require('../../assets/knowledge-hero.png')}
      kicker={t('sections.knowledge.kicker')}
      title={t('sections.knowledge.title')}
      subtitle={t('sections.knowledge.subtitle')}
      body={t('sections.knowledge.body')}
    />
  );
}
