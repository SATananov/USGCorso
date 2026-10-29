import { Image } from 'react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { getCountryPosition } from '../profile/geoService';
import { getMyProfile } from '../profile/profileService';
import { placeCategories, placeCopy } from '../places/placeCopy';
import { createPlace, getApprovedPlaces } from '../places/placeService';
import { useTheme } from '../theme/ThemeContext';

const DEFAULT_REGION = {
  latitude: 42.7339,
  longitude: 25.4858,
  latitudeDelta: 4.8,
  longitudeDelta: 4.8,
};

function PlaceCard({ place, copy, colors, onPress }) {
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <Pressable style={styles.placeCard} onPress={onPress}>
      <View style={styles.placeCardTop}>
        <Text style={styles.placeName}>{place.name}</Text>
        <View style={[styles.badge, place.verified && styles.badgeVerified]}>
          <Text style={styles.badgeText}>
            {place.verified ? copy.status.verified : copy.status.community}
          </Text>
        </View>
      </View>
      <Text style={styles.placeCategory}>{copy.categories[place.category]}</Text>
      <Text style={styles.placeAddress}>
        {place.address}, {place.city}, {place.country}
      </Text>
    </Pressable>
  );
}

function AddPlaceForm({ copy, colors, user, onCreated }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const mapRef = useRef(null);
  const [values, setValues] = useState({
    name: '',
    category: 'veterinary',
    country: '',
    city: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    latitude: null,
    longitude: null,
  });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function setPoint(event) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setValues((current) => ({ ...current, latitude, longitude }));
  }

  async function useCurrentLocation() {
    setMessage('');
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== 'granted') {
      setMessage(copy.locationDenied);
      return;
    }

    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const point = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setValues((current) => ({ ...current, ...point }));
      mapRef.current?.animateToRegion({
        ...point,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } catch {
      setMessage(copy.locationError);
    }
  }

  async function submit() {
    setMessage('');

    if (
      !values.name.trim() ||
      !values.category ||
      !values.country.trim() ||
      !values.city.trim() ||
      !values.address.trim() ||
      values.latitude === null ||
      values.longitude === null
    ) {
      setMessage(copy.form.required);
      return;
    }

    setSaving(true);
    const { error } = await createPlace(user.id, values);
    setSaving(false);

    if (error) {
      setMessage(copy.form.failed);
      return;
    }

    setMessage(copy.form.success);
    setValues({
      name: '',
      category: 'veterinary',
      country: '',
      city: '',
      address: '',
      phone: '',
      website: '',
      description: '',
      latitude: null,
      longitude: null,
    });
    onCreated?.();
  }

  return (
    <ScrollView contentContainerStyle={styles.formContent}>
      <Text style={styles.formTitle}>{copy.form.title}</Text>
      <Text style={styles.formIntro}>{copy.form.intro}</Text>

      <TextInput
        value={values.name}
        onChangeText={(value) => setField('name', value)}
        placeholder={copy.form.name}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />

      <Text style={styles.fieldLabel}>{copy.form.category}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        {placeCategories.map((category) => (
          <Pressable
            key={category}
            onPress={() => setField('category', category)}
            style={[
              styles.categoryChip,
              values.category === category && styles.categoryChipActive,
            ]}
          >
            <Text
              style={[
                styles.categoryChipText,
                values.category === category && styles.categoryChipTextActive,
              ]}
            >
              {copy.categories[category]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <TextInput
        value={values.country}
        onChangeText={(value) => setField('country', value)}
        placeholder={copy.form.country}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <TextInput
        value={values.city}
        onChangeText={(value) => setField('city', value)}
        placeholder={copy.form.city}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <TextInput
        value={values.address}
        onChangeText={(value) => setField('address', value)}
        placeholder={copy.form.address}
        placeholderTextColor={colors.textMuted}
        style={styles.input}
      />
      <TextInput
        value={values.phone}
        onChangeText={(value) => setField('phone', value)}
        placeholder={copy.form.phone}
        placeholderTextColor={colors.textMuted}
        keyboardType="phone-pad"
        style={styles.input}
      />
      <TextInput
        value={values.website}
        onChangeText={(value) => setField('website', value)}
        placeholder={copy.form.website}
        placeholderTextColor={colors.textMuted}
        autoCapitalize="none"
        keyboardType="url"
        style={styles.input}
      />
      <TextInput
        value={values.description}
        onChangeText={(value) => setField('description', value)}
        placeholder={copy.form.description}
        placeholderTextColor={colors.textMuted}
        multiline
        style={[styles.input, styles.textarea]}
      />

      <View style={styles.mapLabelRow}>
        <View style={styles.mapLabelText}>
          <Text style={styles.fieldLabel}>{copy.form.coordinates}</Text>
          <Text style={styles.coordinatesHint}>{copy.form.coordinatesHint}</Text>
        </View>
        <Pressable style={styles.nearButton} onPress={useCurrentLocation}>
          <Text style={styles.nearButtonText}>{copy.nearMe}</Text>
        </Pressable>
      </View>

      <MapView
              provider={PROVIDER_GOOGLE}
              customMapStyle={USG_MAP_STYLE}
              mapType="standard"
              showsPointsOfInterest
              showsBuildings
        ref={mapRef}
        style={styles.pickMap}
        initialRegion={DEFAULT_REGION}
        onPress={setPoint}
      >
        {values.latitude !== null && values.longitude !== null ? (
          <Marker
            coordinate={{
              latitude: values.latitude,
              longitude: values.longitude,
            }}
          >
                <View
                  style={{
                    width: 52,
                    height: 66,
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
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
                    }}
                  >
                    <Text
                      style={{
                        color: '#d4af37',
                        fontSize: 19,
                        fontWeight: '900',
                      }}
                    >
                      {getPlaceMarkerSymbol(place.category)}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      marginTop: -8,
                      backgroundColor: '#070708',
                      borderRightWidth: 3,
                      borderBottomWidth: 3,
                      borderColor: '#d4af37',
                      transform: [{ rotate: '45deg' }],
                    }}
                  />
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      marginTop: 1,
                      borderRadius: 4,
                      backgroundColor: '#d4af37',
                      shadowColor: '#d4af37',
                      shadowOpacity: 0.9,
                      shadowRadius: 5,
                      elevation: 6,
                    }}
                  />
                </View>

                <Callout tooltip>
                  <View
                    style={{
                      width: 230,
                      paddingHorizontal: 15,
                      paddingVertical: 13,
                      backgroundColor: 'rgba(6, 7, 8, 0.98)',
                      borderWidth: 1.5,
                      borderColor: '#d4af37',
                      borderRadius: 18,
                    }}
                  >
                    <Text
                      style={{
                        color: '#f7f3e9',
                        fontSize: 15,
                        fontWeight: '800',
                      }}
                    >
                      {place.name}
                    </Text>

                    {!!place.address && (
                      <Text
                        style={{
                          marginTop: 5,
                          color: '#d4af37',
                          fontSize: 12,
                          lineHeight: 17,
                          fontWeight: '600',
                        }}
                      >
                        {place.address}
                      </Text>
                    )}

                    {!!place.city && (
                      <Text
                        style={{
                          marginTop: 5,
                          color: '#aaa69d',
                          fontSize: 11,
                          lineHeight: 16,
                        }}
                      >
                        {place.city}
                      </Text>
                    )}
                  </View>
                </Callout>
              </Marker>
        ) : null}
      </MapView>
            <Image
              source={require('../../assets/icons/usg-map-crest.png')}
              style={{
                position: 'absolute',
                top: 94,
                right: 16,
                width: 58,
                height: 58,
                opacity: 0.22,
              }}
              resizeMode="contain"
              pointerEvents="none"
            />
            

      {message ? <Text style={styles.formMessage}>{message}</Text> : null}

      <Pressable
        style={[styles.submitButton, saving && styles.disabledButton]}
        onPress={submit}
        disabled={saving}
      >
        <Text style={styles.submitButtonText}>
          {saving ? '...' : copy.form.submit}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const USG_MAP_STYLE = [
  {
    elementType: 'geometry',
    stylers: [{ color: '#101417' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'on' }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e7e5df' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#0b0e10' }, { weight: 3 }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f5f2e9' }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cfc9bc' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#151b1d' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#14201c' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#19201f' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#b9b5aa' }],
  },
  {
    featureType: 'poi.business',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#c5bfae' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#173025' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#30363a' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#0d1113' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f5f1e8' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#443b2a' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f2eee5' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#6d5524' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#b18b35' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#fff4d2' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: '#2b3033' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#dfddd7' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#202529' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0c3048' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#9fbfce' }],
  },
];

const getPlaceMarkerSymbol = (category) => {
  if (category === 'veterinary') return '+';
  if (category === 'grooming') return '✂';
  if (category === 'pet_shop') return '●';
  if (category === 'breeder') return 'C';
  if (category === 'trainer') return 'T';
  if (category === 'large_dog_hotel') return 'H';
  if (category === 'pet_transport') return 'V';
  if (category === 'pharmacy') return 'Rx';
  return '•';
};

export default function CorsoFriendlyScreen({ navigation }) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const { user } = useAuth();
  const copy = placeCopy[language] ?? placeCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const mapRef = useRef(null);
  const [mode, setMode] = useState('map');
  const [category, setCategory] = useState('all');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState('');

  const filteredPlaces = useMemo(
    () =>
      category === 'all'
        ? places
        : places.filter((place) => place.category === category),
    [category, places]
  );

  const loadPlaces = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setErrorText('');
    const { data, error } = await getApprovedPlaces();

    if (error) {
      setErrorText(copy.loadError);
    } else {
      const nextPlaces = data ?? [];
      setPlaces(nextPlaces);

      if (nextPlaces.length > 0) {
        requestAnimationFrame(() => {
          mapRef.current?.fitToCoordinates(
            nextPlaces.map((place) => ({
              latitude: Number(place.latitude),
              longitude: Number(place.longitude),
            })),
            {
              edgePadding: {
                top: 90,
                right: 50,
                bottom: 90,
                left: 50,
              },
              animated: true,
            }
          );
        });
      }
    }

    setLoading(false);
    setRefreshing(false);
  }, [copy.loadError]);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadScreen() {
        await loadPlaces();

        const { data: profile, error: profileError } = await getMyProfile(user?.id);

        if (!active || profileError || !profile?.country) {
          return;
        }

        try {
          const countryPosition = await getCountryPosition(profile.country);

          if (!active || !countryPosition) {
            return;
          }

          mapRef.current?.animateToRegion({
            ...countryPosition,
            latitudeDelta: 7,
            longitudeDelta: 7,
          });
        } catch {
          return;
        }
      }

      loadScreen();

      return () => {
        active = false;
      };
    }, [loadPlaces, user?.id])
  );

  function openDetails(place) {
    navigation.getParent()?.navigate('PlaceDetails', { placeId: place.id });
  }

  async function goNearMe() {
    setErrorText('');
    const permission = await Location.requestForegroundPermissionsAsync();

    if (permission.status !== 'granted') {
      setErrorText(copy.locationDenied);
      return;
    }

    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      mapRef.current?.animateToRegion({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      });
    } catch {
      setErrorText(copy.locationError);
    }
  }

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>USG CORSO</Text>
        <Text style={styles.title}>{copy.title}</Text>
        <Text style={styles.subtitle}>{copy.subtitle}</Text>
      </View>

      <View style={styles.modeRow}>
        {[
          ['map', copy.map],
          ['list', copy.list],
          ['add', copy.add],
        ].map(([value, label]) => (
          <Pressable
            key={value}
            onPress={() => setMode(value)}
            style={[styles.modeButton, mode === value && styles.modeButtonActive]}
          >
            <Text
              style={[
                styles.modeButtonText,
                mode === value && styles.modeButtonTextActive,
              ]}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>

      {mode !== 'add' ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {['all', ...placeCategories].map((value) => (
            <Pressable
              key={value}
              onPress={() => setCategory(value)}
              style={[
                styles.filterChip,
                category === value && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  category === value && styles.filterTextActive,
                ]}
              >
                {copy.categories[value]}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}

      {mode === 'map' ? (
        <View style={styles.mapWrap}>
          <MapView ref={mapRef} style={styles.map} initialRegion={DEFAULT_REGION}>
            {filteredPlaces.map((place) => (
              <Marker
                key={place.id}
                coordinate={{
                  latitude: Number(place.latitude),
                  longitude: Number(place.longitude),
                }}
                title={place.name}
                description={`${copy.categories[place.category]} · ${place.city}`}
                onCalloutPress={() => openDetails(place)}
              >
                <View
                  style={{
                    width: 52,
                    height: 66,
                    alignItems: 'center',
                  }}
                >
                  <View
                    style={{
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
                    }}
                  >
                    <Text
                      style={{
                        color: '#d4af37',
                        fontSize: 19,
                        fontWeight: '900',
                      }}
                    >
                      {getPlaceMarkerSymbol(place.category)}
                    </Text>
                  </View>
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      marginTop: -8,
                      backgroundColor: '#070708',
                      borderRightWidth: 3,
                      borderBottomWidth: 3,
                      borderColor: '#d4af37',
                      transform: [{ rotate: '45deg' }],
                    }}
                  />
                  <View
                    style={{
                      width: 8,
                      height: 8,
                      marginTop: 1,
                      borderRadius: 4,
                      backgroundColor: '#d4af37',
                      shadowColor: '#d4af37',
                      shadowOpacity: 0.9,
                      shadowRadius: 5,
                      elevation: 6,
                    }}
                  />
                </View>

                <Callout tooltip>
                  <View
                    style={{
                      width: 230,
                      paddingHorizontal: 15,
                      paddingVertical: 13,
                      backgroundColor: 'rgba(6, 7, 8, 0.98)',
                      borderWidth: 1.5,
                      borderColor: '#d4af37',
                      borderRadius: 18,
                    }}
                  >
                    <Text
                      style={{
                        color: '#f7f3e9',
                        fontSize: 15,
                        fontWeight: '800',
                      }}
                    >
                      {place.name}
                    </Text>

                    {!!place.address && (
                      <Text
                        style={{
                          marginTop: 5,
                          color: '#d4af37',
                          fontSize: 12,
                          lineHeight: 17,
                          fontWeight: '600',
                        }}
                      >
                        {place.address}
                      </Text>
                    )}

                    {!!place.city && (
                      <Text
                        style={{
                          marginTop: 5,
                          color: '#aaa69d',
                          fontSize: 11,
                          lineHeight: 16,
                        }}
                      >
                        {place.city}
                      </Text>
                    )}
                  </View>
                </Callout>
              </Marker>
            ))}
          </MapView>

          <View style={styles.mapActions}>
            <Pressable style={styles.nearButton} onPress={goNearMe}>
              <Text style={styles.nearButtonText}>{copy.nearMe}</Text>
            </Pressable>
            <Pressable
              style={[
                styles.refreshButton,
                refreshing && styles.refreshButtonDisabled,
              ]}
              onPress={() => loadPlaces(true)}
              disabled={refreshing}
            >
              <Text style={styles.refreshButtonText}>
                {refreshing ? '...' : copy.refresh}
              </Text>
            </Pressable>
          </View>

          {loading ? (
            <View style={styles.overlayMessage}>
              <ActivityIndicator />
              <Text style={styles.overlayText}>{copy.loading}</Text>
            </View>
          ) : null}

          {errorText ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{errorText}</Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {mode === 'list' ? (
        <FlatList
          data={filteredPlaces}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadPlaces(true)}
            />
          }
          ListEmptyComponent={
            loading ? (
              <Text style={styles.emptyText}>{copy.loading}</Text>
            ) : (
              <Text style={styles.emptyText}>{errorText || copy.empty}</Text>
            )
          }
          renderItem={({ item }) => (
            <PlaceCard
              place={item}
              copy={copy}
              colors={colors}
              onPress={() => openDetails(item)}
            />
          )}
        />
      ) : null}

      {mode === 'add' ? (
        <AddPlaceForm
          copy={copy}
          colors={colors}
          user={user}
          onCreated={() => loadPlaces(true)}
        />
      ) : null}
    </SafeAreaView>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    hero: {
      paddingHorizontal: 18,
      paddingTop: 12,
      paddingBottom: 12,
    },
    kicker: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1.8,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '800',
      marginTop: 4,
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: 13,
      lineHeight: 19,
      marginTop: 4,
    },
    modeRow: {
      flexDirection: 'row',
      paddingHorizontal: 14,
      gap: 8,
    },
    modeButton: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: colors.surface,
    },
    modeButtonActive: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    modeButtonText: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '800',
    },
    modeButtonTextActive: {
      color: colors.gold,
    },
    filters: {
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      alignItems: 'center',
    },
    filterChip: {
      height: 36,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 18,
      paddingHorizontal: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    filterChipActive: {
      borderColor: colors.gold,
    },
    filterText: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '700',
    },
    filterTextActive: {
      color: colors.gold,
    },
    mapWrap: {
      flex: 1,
      minHeight: 360,
      marginHorizontal: 14,
      marginBottom: 12,
      borderRadius: 18,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    map: {
      flex: 1,
      minHeight: 360,
    },
    mapActions: {
      position: 'absolute',
      top: 12,
      left: 12,
      right: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    nearButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.gold,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    nearButtonText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '800',
    },
    refreshButton: {
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 8,
    },
    refreshButtonDisabled: {
      opacity: 0.55,
    },
    refreshButtonText: {
      color: colors.text,
      fontSize: 10,
      fontWeight: '800',
    },
    overlayMessage: {
      position: 'absolute',
      left: 20,
      right: 20,
      bottom: 20,
      borderRadius: 12,
      padding: 12,
      backgroundColor: colors.background,
      alignItems: 'center',
      gap: 6,
    },
    overlayText: {
      color: colors.textMuted,
      fontSize: 12,
    },
    errorBanner: {
      position: 'absolute',
      left: 12,
      right: 12,
      bottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.background,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    errorText: {
      color: '#d88',
      fontSize: 12,
      lineHeight: 17,
      textAlign: 'center',
    },
    listContent: {
      paddingHorizontal: 14,
      paddingBottom: 24,
      gap: 10,
      flexGrow: 1,
    },
    placeCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      backgroundColor: colors.surface,
    },
    placeCardTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
    },
    placeName: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
    },
    placeCategory: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '800',
      marginTop: 6,
    },
    placeAddress: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 4,
    },
    badge: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    badgeVerified: {
      borderColor: colors.gold,
    },
    badgeText: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '800',
    },
    emptyText: {
      color: colors.textMuted,
      textAlign: 'center',
      padding: 28,
    },
    formContent: {
      padding: 14,
      paddingBottom: 30,
      gap: 10,
    },
    formTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '800',
    },
    formIntro: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
      marginBottom: 2,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.surface,
      color: colors.text,
      paddingHorizontal: 13,
      paddingVertical: 11,
      fontSize: 13,
    },
    textarea: {
      minHeight: 88,
      textAlignVertical: 'top',
    },
    fieldLabel: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '800',
    },
    categoryRow: {
      gap: 8,
      paddingBottom: 2,
    },
    categoryChip: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 7,
    },
    categoryChipActive: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    categoryChipText: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '700',
    },
    categoryChipTextActive: {
      color: colors.gold,
    },
    mapLabelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginTop: 4,
    },
    mapLabelText: {
      flex: 1,
    },
    coordinatesHint: {
      color: colors.textMuted,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 2,
    },
    pickMap: {
      height: 220,
      borderRadius: 16,
    },
    formMessage: {
      color: colors.gold,
      fontSize: 12,
      lineHeight: 18,
    },
    submitButton: {
      backgroundColor: colors.gold,
      borderRadius: 14,
      paddingVertical: 13,
      alignItems: 'center',
    },
    disabledButton: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: '#111',
      fontSize: 12,
      fontWeight: '900',
    },
  });
}
