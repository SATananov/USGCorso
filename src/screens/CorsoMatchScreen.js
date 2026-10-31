import USGSectionScreen from '../components/USGSectionScreen';
import { useLanguage } from '../i18n/LanguageContext';

export default function CorsoMatchScreen() {
  const scrollRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: false,
      });
    }, [])
  );
  const { t } = useLanguage();

  return (
    <USGSectionScreen
      heroImage={require('../../assets/corso-match-hero.png')}
      kicker={t('sections.corsoMatch.kicker')}
      title={t('sections.corsoMatch.title')}
      subtitle={t('sections.corsoMatch.subtitle')}
      body={t('sections.corsoMatch.body')}
    />
  );
}
