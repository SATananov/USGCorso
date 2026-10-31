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
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
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

  const address = [place.address, place.city, place.country]
    .filter(Boolean)
    .join(', ');

  function openDirections() {
    const destination = `${coordinate.latitude},${coordinate.longitude}`;
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`
    );
  }

  function callPlace() {
    Linking.openURL(`tel:${place.phone}`);
  }

  function openWebsite() {
    Linking.openURL(
      place.website.startsWith('http')
        ? place.website
        : `https://${place.website}`
    );
  }

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

        {place.cane_corso_friendly ? (
          <View style={styles.friendlyBadge}>
            <Text style={styles.friendlyBadgeText}>{copy.details.caneCorsoFriendly}</Text>
          </View>
        ) : null}

        <MapView
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          mapType="hybrid"
          showsPointsOfInterest
          showsBuildings
          showsCompass={false}
          toolbarEnabled={false}
          initialRegion={{
            ...coordinate,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          scrollEnabled={false}
          zoomEnabled={false}
        >
          <Marker coordinate={coordinate}>
            <View style={styles.marker}>
              <View style={styles.markerHead}>
                {place.category === 'pet_shop' ? (
                  <View style={styles.pawIcon}>
                    <View style={styles.pawPad} />
                    <View style={[styles.pawToe, styles.pawToeLeft]} />
                    <View style={[styles.pawToe, styles.pawToeTopLeft]} />
                    <View style={[styles.pawToe, styles.pawToeTopRight]} />
                    <View style={[styles.pawToe, styles.pawToeRight]} />
                  </View>
                ) : (
                  <Text style={styles.markerSymbol}>
                    {getPlaceMarkerSymbol(place.category)}
                  </Text>
                )}
              </View>
              <View style={styles.markerTip} />
              <View style={styles.markerGlow} />
            </View>
          </Marker>
        </MapView>

        <InfoRow
          label={copy.details.address}
          value={address}
          styles={styles}
        />

        <View style={styles.actions}>
          <Pressable style={styles.primaryAction} onPress={openDirections}>
            <Text style={styles.primaryActionText}>{copy.details.directions}</Text>
          </Pressable>

          {place.phone ? (
            <Pressable style={styles.secondaryAction} onPress={callPlace}>
              <Text style={styles.secondaryActionText}>{copy.details.call}</Text>
            </Pressable>
          ) : null}

          {place.website ? (
            <Pressable style={styles.secondaryAction} onPress={openWebsite}>
              <Text style={styles.secondaryActionText}>{copy.details.openWebsite}</Text>
            </Pressable>
          ) : null}
        </View>

        {place.phone ? (
          <InfoRow label={copy.details.phone} value={place.phone} styles={styles} />
        ) : null}

        {place.website ? (
          <InfoRow label={copy.details.website} value={place.website} styles={styles} />
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

function getPlaceMarkerSymbol(category) {
  if (category === 'veterinary') return '+';
  if (category === 'grooming') return '✂';
  if (category === 'pet_shop') return '';
  if (category === 'breeder') return '⌂';
  if (category === 'trainer') return 'K9';
  if (category === 'large_dog_hotel') return 'H';
  if (category === 'pet_transport') return '↔';
  if (category === 'pharmacy') return 'Rx';
  return 'USG';
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
    friendlyBadge: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: colors.gold,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
      backgroundColor: colors.activeSurface,
    },
    friendlyBadgeText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.45,
      textTransform: 'uppercase',
    },
    map: {
      height: 240,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.34)',
      backgroundColor: '#08090b',
    },
    marker: {
      width: 52,
      height: 66,
      alignItems: 'center',
    },
    markerHead: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: '#070708',
      borderWidth: 3,
      borderColor: '#d4af37',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#d4af37',
      shadowOpacity: 0.55,
      shadowRadius: 9,
      elevation: 9,
    },
    markerSymbol: {
      color: '#d4af37',
      fontSize: 19,
      fontWeight: '900',
    },
    markerTip: {
      width: 18,
      height: 18,
      marginTop: -8,
      backgroundColor: '#070708',
      borderRightWidth: 3,
      borderBottomWidth: 3,
      borderColor: '#d4af37',
      transform: [{ rotate: '45deg' }],
    },
    markerGlow: {
      width: 8,
      height: 8,
      marginTop: 1,
      borderRadius: 4,
      backgroundColor: '#d4af37',
      shadowColor: '#d4af37',
      shadowOpacity: 0.9,
      shadowRadius: 5,
      elevation: 6,
    },
    pawIcon: {
      width: 24,
      height: 24,
      position: 'relative',
    },
    pawPad: {
      position: 'absolute',
      left: 7,
      top: 9,
      width: 11,
      height: 10,
      borderRadius: 7,
      backgroundColor: '#d4af37',
    },
    pawToe: {
      position: 'absolute',
      width: 6,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#d4af37',
    },
    pawToeLeft: {
      left: 2,
      top: 5,
    },
    pawToeTopLeft: {
      left: 7,
      top: 1,
    },
    pawToeTopRight: {
      right: 5,
      top: 1,
    },
    pawToeRight: {
      right: 0,
      top: 5,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    primaryAction: {
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: colors.gold,
    },
    primaryActionText: {
      color: colors.background,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    secondaryAction: {
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.surface,
    },
    secondaryActionText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.5,
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
