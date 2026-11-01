import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import KnowledgePublicList from '../components/KnowledgePublicList';
import USGSectionScreen from '../components/USGSectionScreen';
import { useLanguage } from '../i18n/LanguageContext';

export default function KnowledgeScreen({ route }) {
  const { t } = useLanguage();
  const categoryKey = route?.params?.categoryKey ?? null;
  const [heroResetKey, setHeroResetKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setHeroResetKey((value) => value + 1);
    }, [])
  );

  return (
    <USGSectionScreen
      key={"knowledge-${heroResetKey}"}
      heroImage={require('../../assets/knowledge-hero.png')}
      heroCarousel
      showScrollHint
      kicker={t('sections.knowledge.kicker')}
      title={t('sections.knowledge.title')}
      subtitle={t('sections.knowledge.subtitle')}
      body={t('sections.knowledge.body')}
    >
      <KnowledgePublicList categoryKey={categoryKey} />
    </USGSectionScreen>
  );
}
