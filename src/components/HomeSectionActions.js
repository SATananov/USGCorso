import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { getHomePublicCounters } from '../home/homeCounterService';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';

const copyByLanguage = {
  bg: {
    browse: 'РАЗГЛЕДАЙ',
    add: '+ ДОБАВИ',
    map: 'КАРТА',
    addPlace: '+ ДОБАВИ МЯСТО',
    library: 'БИБЛИОТЕКА',
    addMaterial: '+ ДОБАВИ МАТЕРИАЛ',
    publicCorsos: 'ПУБЛИЧНИ КОРСО',
    community: 'ГАЛЕРИЯ',
    services: 'УСЛУГИ',
    addService: '+ ДОБАВИ УСЛУГА',
    upcoming: 'ПРЕДСТОЯЩИ',
    addEvent: '+ ДОБАВИ СЪБИТИЕ',
    openChoice: 'ОТВОРИ',
  },
  en: {
    browse: 'BROWSE',
    add: '+ ADD',
    map: 'MAP',
    addPlace: '+ ADD PLACE',
    library: 'LIBRARY',
    addMaterial: '+ ADD MATERIAL',
    publicCorsos: 'PUBLIC CORSOS',
    community: 'GALLERY',
    services: 'SERVICES',
    addService: '+ ADD SERVICE',
    upcoming: 'UPCOMING',
    addEvent: '+ ADD EVENT',
    openChoice: 'OPEN',
  },
  it: {
    browse: 'ESPLORA',
    add: '+ AGGIUNGI',
    map: 'MAPPA',
    addPlace: '+ AGGIUNGI LUOGO',
    library: 'BIBLIOTECA',
    addMaterial: '+ AGGIUNGI MATERIALE',
    publicCorsos: 'CORSO PUBBLICI',
    community: 'GALLERIA',
    services: 'SERVIZI',
    addService: '+ AGGIUNGI SERVIZIO',
    upcoming: 'IN ARRIVO',
    addEvent: '+ AGGIUNGI EVENTO',
    openChoice: 'APRI',
  },
};

function resolveSection(sectionId) {
  const value = String(sectionId || '').toLowerCase();

  if (value.includes('friendly') || value.includes('place')) return 'places';
  if (value.includes('knowledge')) return 'knowledge';
  if (value.includes('community')) return 'community';
  if (value.includes('service') || value.includes('professional')) return 'services';
  if (value.includes('event')) return 'events';
  if (value.includes('match') || value.includes('choice') || value.includes('selection')) return 'match';

  return null;
}

export default function HomeSectionActions({ sectionId, navigation }) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const copy = copyByLanguage[language] ?? copyByLanguage.en;
  const section = resolveSection(sectionId);
  const [counters, setCounters] = useState({});

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        const result = await getHomePublicCounters();

        if (active && !result.error) {
          setCounters(result.data ?? {});
        }
      }

      load();

      return () => {
        active = false;
      };
    }, [])
  );

  if (!section) {
    return null;
  }

  const config = {
    places: {
      primaryLabel: copy.map,
      primaryRoute: 'Corso Friendly',
      primaryCount: counters.places,
      secondaryLabel: copy.addPlace,
      secondaryRoute: 'Corso Friendly',
    },
    knowledge: {
      primaryLabel: copy.library,
      primaryRoute: 'Knowledge',
      primaryCount: counters.knowledge,
      secondaryLabel: copy.addMaterial,
      secondaryRoute: 'AddMaterial',
      secondaryParams: { section: 'knowledge' },
    },
    community: {
      primaryLabel: copy.publicCorsos,
      primaryRoute: 'Community',
      primaryCount: counters.community_corsos,
      secondaryLabel: copy.community,
      secondaryRoute: 'Community',
    },
    services: {
      primaryLabel: copy.services,
      primaryRoute: 'Services',
      primaryCount: counters.services,
      secondaryLabel: copy.addService,
      secondaryRoute: 'AddMaterial',
      secondaryParams: { section: 'services' },
    },
    events: {
      primaryLabel: copy.upcoming,
      primaryRoute: 'Events',
      primaryCount: counters.events,
      secondaryLabel: copy.addEvent,
      secondaryRoute: 'AddMaterial',
      secondaryParams: { section: 'events' },
    },
    match: {
      primaryLabel: copy.openChoice,
      primaryRoute: 'Corso Match',
      primaryCount: null,
      secondaryLabel: copy.browse,
      secondaryRoute: 'Corso Match',
    },
  }[section];

  return (
    <View style={styles.actions}>
      <Pressable
        style={styles.openButton}
        onPress={() => navigation.navigate(config.primaryRoute)}
      >
        <Text style={styles.openButtonText}>{config.primaryLabel}</Text>
        {Number.isFinite(Number(config.primaryCount)) ? (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{Number(config.primaryCount)}</Text>
          </View>
        ) : null}
      </Pressable>

      <Pressable
        style={styles.addButton}
        onPress={() =>
          navigation.navigate(
            config.secondaryRoute,
            config.secondaryParams
          )
        }
      >
        <Text style={styles.addButtonText}>{config.secondaryLabel}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    actions: {
      flexDirection: 'row',
      gap: 8,
      paddingHorizontal: 12,
      paddingBottom: 10,
    },
    openButton: {
      flex: 1,
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 9,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    openButtonText: {
      color: colors.textSoft,
      fontSize: 9,
      fontWeight: '800',
      textAlign: 'center',
    },
    countBadge: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.activeSurface,
      borderWidth: 1,
      borderColor: colors.gold,
      marginLeft: 8,
      paddingHorizontal: 6,
    },
    countText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
    },
    addButton: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 9,
      backgroundColor: colors.gold,
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    addButtonText: {
      color: colors.background,
      fontSize: 9,
      fontWeight: '900',
      textAlign: 'center',
    },
  });
}
