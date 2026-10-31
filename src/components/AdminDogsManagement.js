import { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { getAdminDogs } from '../admin/adminDogService';
import { useLanguage } from '../i18n/LanguageContext';
import { useTheme } from '../theme/ThemeContext';
import USGProgressBar from './USGProgressBar';

const copy = {
  bg: {
    title: 'Кучета в Моето Корсо',
    count: 'Общо кучета',
    open: 'ОТВОРИ',
    refresh: 'ОБНОВИ',
    empty: 'Няма добавени кучета.',
    loadError: 'Кучетата не можаха да се заредят.',
    owner: 'Собственик',
    public: 'Публично в Общността',
    private: 'Лично',
  },
  en: {
    title: 'My Corso Dogs',
    count: 'Total dogs',
    open: 'OPEN',
    refresh: 'REFRESH',
    empty: 'There are no dogs.',
    loadError: 'Dogs could not be loaded.',
    owner: 'Owner',
    public: 'Visible in Community',
    private: 'Private',
  },
  it: {
    title: 'Cani in Il mio Corso',
    count: 'Cani totali',
    open: 'APRI',
    refresh: 'AGGIORNA',
    empty: 'Non ci sono cani.',
    loadError: 'Impossibile caricare i cani.',
    owner: 'Proprietario',
    public: 'Visibile nella Comunità',
    private: 'Privato',
  },
};

export default function AdminDogsManagement() {
  const navigation = useNavigation();
  const { language } = useLanguage();
  const { colors } = useTheme();
  const labels = copy[language] ?? copy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);

  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');

    const result = await getAdminDogs();

    if (result.error) {
      setDogs([]);
      setError(labels.loadError);
    } else {
      setDogs(result.data ?? []);
    }

    setLoading(false);
  }, [labels.loadError]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{labels.title}</Text>
          <Text style={styles.count}>
            {labels.count}: {dogs.length}
          </Text>
        </View>

        <Pressable style={styles.refresh} onPress={load}>
          <Text style={styles.refreshText}>{labels.refresh}</Text>
        </Pressable>
      </View>

      {loading ? <USGProgressBar label={labels.title} /> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!loading && !error && dogs.length === 0 ? (
        <Text style={styles.empty}>{labels.empty}</Text>
      ) : null}

      {dogs.map((dog) => (
        <View key={dog.id} style={styles.card}>
          {dog.photo_url ? (
            <Image source={{ uri: dog.photo_url }} style={styles.photo} />
          ) : null}

          <View style={styles.body}>
            <View style={styles.cardHeader}>
              <View style={styles.nameWrap}>
                <Text style={styles.name}>{dog.name}</Text>
                <Text style={styles.meta}>
                  {[dog.sex, dog.color].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <Text style={styles.visibility}>
                {dog.community_visible ? labels.public : labels.private}
              </Text>
            </View>

            <Text style={styles.ownerLabel}>{labels.owner}</Text>
            <Text style={styles.ownerValue}>
              {dog.owner_display_name ||
                dog.owner_username ||
                'USG Member'}
            </Text>

            <Pressable
              style={styles.openButton}
              onPress={() =>
                navigation.navigate('AdminDogDetails', {
                  dogId: dog.id,
                })
              }
            >
              <Text style={styles.openText}>{labels.open}</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    section: {
      marginTop: 10,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      marginBottom: 8,
    },
    title: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '900',
    },
    count: {
      color: colors.textSoft,
      fontSize: 9,
      marginTop: 3,
    },
    refresh: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.gold,
      paddingHorizontal: 11,
      paddingVertical: 8,
    },
    refreshText: {
      color: colors.gold,
      fontSize: 8,
      fontWeight: '900',
    },
    card: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
      overflow: 'hidden',
      marginTop: 10,
    },
    photo: {
      width: '100%',
      height: 180,
      backgroundColor: '#09090b',
    },
    body: {
      padding: 12,
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
    },
    nameWrap: {
      flex: 1,
    },
    name: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '900',
    },
    meta: {
      color: colors.textSoft,
      fontSize: 9,
      marginTop: 3,
    },
    visibility: {
      color: colors.gold,
      fontSize: 7,
      fontWeight: '900',
      textAlign: 'right',
      maxWidth: 110,
    },
    ownerLabel: {
      color: colors.textMuted,
      fontSize: 7,
      fontWeight: '900',
      marginTop: 10,
      textTransform: 'uppercase',
    },
    ownerValue: {
      color: colors.textSoft,
      fontSize: 10,
      marginTop: 2,
    },
    openButton: {
      minHeight: 38,
      borderRadius: 999,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
    },
    openText: {
      color: '#070708',
      fontSize: 8,
      fontWeight: '900',
    },
    error: {
      color: colors.danger || '#d66',
      fontSize: 10,
      marginTop: 8,
    },
    empty: {
      color: colors.textSoft,
      fontSize: 10,
      marginTop: 8,
    },
  });
}
