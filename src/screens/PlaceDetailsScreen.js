import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useLanguage } from '../i18n/LanguageContext';
import { placeCopy } from '../places/placeCopy';
import { getPlaceById } from '../places/placeService';
import { useTheme } from '../theme/ThemeContext';

export default function PlaceDetailsScreen({ route }) {
  const { placeId } = route.params ?? {};
  const { language } = useLanguage();
  const { colors } = useTheme();
  const copy = placeCopy[language] ?? placeCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        setLoading(true);
        const { data, error } = await getPlaceById(placeId);

        if (!active) {
          return;
        }

        if (error) {
          setErrorText(copy.loadError);
        } else {
          setPlace(data);
          setErrorText('');
        }

        setLoading(false);
      }

      if (placeId) {
        load();
      } else {
        setErrorText(copy.loadError);
        setLoading(false);
      }

      return () => {
        active = false;
      };
    }, [copy.loadError, placeId])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!place) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{errorText}</Text>
      </View>
    );
  }

  const coordinate = {
    latitude: Number(place.latitude),
    longitude: Number(place.longitude),
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>{copy.categories[place.category]}</Text>
        <Text style={styles.title}>{place.name}</Text>

        <View style={[styles.badge, place.verified && styles.badgeVerified]}>
          <Text style={styles.badgeText}>
            {place.verified ? copy.status.verified : copy.status.community}
          </Text>
        </View>

        <MapView
          style={styles.map}
          initialRegion={{
            ...coordinate,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker coordinate={coordinate} />
        </MapView>

        <InfoRow
          label={copy.details.address}
          value={`${place.address}, ${place.city}, ${place.country}`}
          styles={styles}
        />

        {place.phone ? (
          <Pressable onPress={() => Linking.openURL(`tel:${place.phone}`)}>
            <InfoRow label={copy.details.phone} value={place.phone} styles={styles} />
          </Pressable>
        ) : null}

        {place.website ? (
          <Pressable
            onPress={() =>
              Linking.openURL(
                place.website.startsWith('http')
                  ? place.website
                  : `https://${place.website}`
              )
            }
          >
            <InfoRow label={copy.details.website} value={place.website} styles={styles} />
          </Pressable>
        ) : null}

        <InfoRow
          label={copy.details.description}
          value={place.description || copy.details.noDescription}
          styles={styles}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, styles }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      padding: 18,
      paddingBottom: 30,
      gap: 12,
    },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
      padding: 24,
    },
    kicker: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.3,
      textTransform: 'uppercase',
    },
    title: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '800',
    },
    badge: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    badgeVerified: {
      borderColor: colors.gold,
    },
    badgeText: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '800',
    },
    map: {
      height: 240,
      borderRadius: 18,
      overflow: 'hidden',
    },
    infoCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
      backgroundColor: colors.surface,
    },
    infoLabel: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '800',
      textTransform: 'uppercase',
      marginBottom: 5,
    },
    infoValue: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 19,
    },
    errorText: {
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
}
