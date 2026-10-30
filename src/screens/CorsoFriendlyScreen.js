import { Image } from 'react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
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
import { reverseGeocodePlace } from '../places/geocodingService';
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
      {place.cane_corso_friendly ? (
        <View style={styles.friendlyBadge}>
          <Text style={styles.friendlyBadgeText}>CANE CORSO FRIENDLY</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function AddPlaceForm({ copy, colors, user, onCreated }) {
  const styles = useMemo(() => createStyles(colors), [colors]);
  const mapRef = useRef(null);
  const pickerMapRef = useRef(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [mapPickerVisible, setMapPickerVisible] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [values, setValues] = useState({
    name: '',
    category: 'veterinary',
    country: '',
    city: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    caneCorsoFriendly: false,
    latitude: null,
    longitude: null,
  });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  function setField(field, value) {
    setValues((current) => ({ ...current, [field]: value }));
  }

  function buildAddress(location) {
    const parts = [
      location.name,
      location.street,
      location.streetNumber,
      location.district,
    ].filter(Boolean);

    return [...new Set(parts)].join(', ');
  }

  async function fillLocationFields(latitude, longitude) {
    setGeocoding(true);

    try {
      const precise = await reverseGeocodePlace({
        latitude,
        longitude,
        language,
      });

      if (precise?.result) {
        setValues((current) => ({
          ...current,
          country: precise.result.country || current.country,
          city: precise.result.city || current.city,
          address:
            precise.result.address ||
            precise.result.formattedAddress ||
            current.address,
        }));
        return;
      }
    } catch {
      try {
        const results = await Location.reverseGeocodeAsync({
          latitude,
          longitude,
        });
        const location = results[0];

        if (!location) {
          return;
        }

        const city =
          location.city ||
          location.subregion ||
          location.district ||
          location.region ||
          '';

        const address = buildAddress(location);

        setValues((current) => ({
          ...current,
          country: location.country || current.country,
          city: city || current.city,
          address: address || current.address,
        }));
      } catch {
        return;
      }
    } finally {
      setGeocoding(false);
    }
  }

  async function selectPoint(latitude, longitude) {
    setValues((current) => ({
      ...current,
      latitude,
      longitude,
    }));

    await fillLocationFields(latitude, longitude);
  }

  async function setPoint(event) {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    await selectPoint(latitude, longitude);
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

      setCurrentLocation(point);
      await selectPoint(point.latitude, point.longitude);

      const region = {
        ...point,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      };

      mapRef.current?.animateToRegion(region);
      pickerMapRef.current?.animateToRegion(region);
    } catch {
      setMessage(copy.locationError);
    }
  }

  function openMapPicker() {
    setMapPickerVisible(true);

    const latitude =
      values.latitude ?? currentLocation?.latitude ?? DEFAULT_REGION.latitude;
    const longitude =
      values.longitude ?? currentLocation?.longitude ?? DEFAULT_REGION.longitude;

    setTimeout(() => {
      pickerMapRef.current?.animateToRegion({
        latitude,
        longitude,
        latitudeDelta: values.latitude !== null || currentLocation ? 0.012 : DEFAULT_REGION.latitudeDelta,
        longitudeDelta: values.longitude !== null || currentLocation ? 0.012 : DEFAULT_REGION.longitudeDelta,
      });
    }, 120);
  }

  async function submit() {
    setMessage('');

    if (
      !values.category ||
      values.latitude === null ||
      values.longitude === null
    ) {
      setMessage(copy.form.required);
      return;
    }

    const generatedName =
      values.name.trim() ||
      `${copy.categories[values.category]}${
        values.city.trim() ? ` — ${values.city.trim()}` : ''
      }`;

    const payload = {
      ...values,
      name: generatedName,
    };

    setSaving(true);
    const { error } = await createPlace(user.id, payload);
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
      caneCorsoFriendly: false,
      latitude: null,
      longitude: null,
    });
    setCurrentLocation(null);
    onCreated?.();
  }

  function renderSelectedMarker() {
    if (values.latitude === null || values.longitude === null) {
      return null;
    }

    return (
      <Marker
        coordinate={{
          latitude: values.latitude,
          longitude: values.longitude,
        }}
        draggable
        zIndex={1000}
        onDragEnd={async (event) => {
          const { latitude, longitude } = event.nativeEvent.coordinate;
          await selectPoint(latitude, longitude);
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
            {values.category === 'pet_shop' ? (
              <View style={{ width: 24, height: 24, position: 'relative' }}>
                <View style={{ position: 'absolute', left: 7, top: 9, width: 11, height: 10, borderRadius: 7, backgroundColor: '#d4af37' }} />
                <View style={{ position: 'absolute', left: 2, top: 5, width: 6, height: 7, borderRadius: 4, backgroundColor: '#d4af37' }} />
                <View style={{ position: 'absolute', left: 7, top: 1, width: 6, height: 7, borderRadius: 4, backgroundColor: '#d4af37' }} />
                <View style={{ position: 'absolute', right: 5, top: 1, width: 6, height: 7, borderRadius: 4, backgroundColor: '#d4af37' }} />
                <View style={{ position: 'absolute', right: 0, top: 5, width: 6, height: 7, borderRadius: 4, backgroundColor: '#d4af37' }} />
              </View>
            ) : (
              <Text
                style={{
                  color: '#d4af37',
                  fontSize: 19,
                  fontWeight: '900',
                }}
              >
                {getPlaceMarkerSymbol(values.category)}
              </Text>
            )}
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
      </Marker>
    );
  }

  function renderCurrentLocationMarker() {
    if (!currentLocation) {
      return null;
    }

    return (
      <Marker
        coordinate={currentLocation}
        anchor={{ x: 0.5, y: 0.5 }}
        zIndex={900}
      >
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 21,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(17, 135, 205, 0.22)',
            borderWidth: 2,
            borderColor: 'rgba(72, 187, 255, 0.78)',
          }}
        >
          <View
            style={{
              width: 24,
              height: 24,
              borderRadius: 12,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#0b8bd3',
              borderWidth: 3,
              borderColor: '#ffffff',
            }}
          >
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: '#ffffff',
              }}
            />
          </View>
        </View>
      </Marker>
    );
  }

  const previewRegion = {
    latitude:
      values.latitude ?? currentLocation?.latitude ?? DEFAULT_REGION.latitude,
    longitude:
      values.longitude ?? currentLocation?.longitude ?? DEFAULT_REGION.longitude,
    latitudeDelta:
      values.latitude !== null || currentLocation ? 0.012 : DEFAULT_REGION.latitudeDelta,
    longitudeDelta:
      values.longitude !== null || currentLocation ? 0.012 : DEFAULT_REGION.longitudeDelta,
  };

  return (
    <ScrollView
      contentContainerStyle={styles.formContent}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
    >
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
      <View>
        <Text style={styles.fieldLabel}>{copy.form.suggestedAddress}</Text>
        <TextInput
          value={values.address}
          onChangeText={(value) => setField('address', value)}
          placeholder={copy.form.address}
          placeholderTextColor={colors.textMuted}
          style={styles.input}
        />
        <Text style={styles.coordinatesHint}>{copy.form.addressConfidenceHint}</Text>
      </View>
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

      <Pressable
        onPress={() => setField('caneCorsoFriendly', !values.caneCorsoFriendly)}
        style={[
          styles.friendlyToggle,
          values.caneCorsoFriendly && styles.friendlyToggleActive,
        ]}
      >
        <View
          style={[
            styles.friendlyToggleIcon,
            values.caneCorsoFriendly && styles.friendlyToggleIconActive,
          ]}
        >
          <Text
            style={[
              styles.friendlyToggleCheck,
              values.caneCorsoFriendly && styles.friendlyToggleCheckActive,
            ]}
          >
            {values.caneCorsoFriendly ? '\u2713' : ''}
          </Text>
        </View>
        <View style={styles.friendlyToggleCopy}>
          <Text style={styles.friendlyToggleTitle}>{copy.form.caneCorsoFriendly}</Text>
          <Text style={styles.friendlyToggleHint}>{copy.form.caneCorsoFriendlyHint}</Text>
        </View>
      </Pressable>

      <View style={styles.mapLabelRow}>
        <View style={styles.mapLabelText}>
          <Text style={styles.fieldLabel}>{copy.form.coordinates}</Text>
          <Text style={styles.coordinatesHint}>{copy.form.coordinatesHint}</Text>
        </View>
        <Pressable style={styles.nearButton} onPress={useCurrentLocation}>
          <Text style={styles.nearButtonText}>{copy.nearMe}</Text>
        </Pressable>
      </View>

      <View style={{ position: 'relative' }}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.pickMap}
          initialRegion={previewRegion}
          mapType="hybrid"
          showsPointsOfInterest
          showsBuildings
          showsCompass={false}
          toolbarEnabled={false}
          scrollEnabled={false}
          zoomEnabled={false}
          rotateEnabled={false}
          pitchEnabled={false}
          onPress={openMapPicker}
        >
          {renderCurrentLocationMarker()}
          {renderSelectedMarker()}
        </MapView>

        <Pressable
          onPress={openMapPicker}
          style={{
            position: 'absolute',
            left: 14,
            right: 14,
            bottom: 14,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: '#d4af37',
            backgroundColor: 'rgba(7, 7, 8, 0.92)',
            paddingVertical: 11,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: '#d4af37',
              fontSize: 12,
              fontWeight: '900',
              letterSpacing: 0.4,
            }}
          >
            {copy.form.openMap}
          </Text>
        </Pressable>
      </View>

      {geocoding ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ActivityIndicator size="small" color={colors.gold} />
          <Text style={styles.coordinatesHint}>{copy.form.locatingAddress}</Text>
        </View>
      ) : null}

      <Modal
        visible={mapPickerVisible}
        animationType="slide"
        onRequestClose={() => setMapPickerVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#070708' }}>
          <View
            style={{
              paddingHorizontal: 18,
              paddingTop: 8,
              paddingBottom: 12,
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(212, 175, 55, 0.28)',
              backgroundColor: '#070708',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: '#f7f3e9',
                    fontSize: 22,
                    fontWeight: '900',
                  }}
                >
                  {copy.form.mapPickerTitle}
                </Text>
                <Text
                  style={{
                    marginTop: 5,
                    color: '#8d8981',
                    fontSize: 12,
                    lineHeight: 18,
                  }}
                >
                  {copy.form.mapPickerHint}
                </Text>
              </View>

              <Pressable
                onPress={() => setMapPickerVisible(false)}
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  borderWidth: 1,
                  borderColor: '#d4af37',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#d4af37', fontSize: 22, fontWeight: '700' }}>
                  {'\u00d7'}
                </Text>
              </Pressable>
            </View>
          </View>

          <MapView
            ref={pickerMapRef}
            provider={PROVIDER_GOOGLE}
            style={{ flex: 1 }}
            initialRegion={previewRegion}
            mapType="hybrid"
            showsPointsOfInterest
            showsBuildings
            showsCompass
            toolbarEnabled={false}
            onPress={setPoint}
          >
            {renderCurrentLocationMarker()}
            {renderSelectedMarker()}
          </MapView>

          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 16,
              borderTopWidth: 1,
              borderTopColor: 'rgba(212, 175, 55, 0.28)',
              backgroundColor: '#070708',
            }}
          >
            <Text
              style={{
                color: '#d4af37',
                fontSize: 11,
                fontWeight: '900',
                letterSpacing: 0.4,
                marginBottom: 4,
                textTransform: 'uppercase',
              }}
            >
              {copy.form.suggestedAddress}
            </Text>
            <Text
              numberOfLines={2}
              style={{
                color: values.address ? '#f7f3e9' : '#8d8981',
                fontSize: 13,
                lineHeight: 18,
                marginBottom: 6,
              }}
            >
              {geocoding
                ? copy.form.locatingAddress
                : [values.address, values.city, values.country].filter(Boolean).join(', ') ||
                  copy.form.mapPickerHint}
            </Text>
            <Text
              style={{
                color: '#8d8981',
                fontSize: 10,
                lineHeight: 15,
                marginBottom: 10,
              }}
            >
              {copy.form.addressConfidenceHint}
            </Text>

            <View style={{ flexDirection: 'row', gap: 10 }}>
              <Pressable
                onPress={useCurrentLocation}
                style={{
                  minWidth: 120,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: '#d4af37',
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: '900' }}>
                  {copy.nearMe}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setMapPickerVisible(false)}
                disabled={values.latitude === null || values.longitude === null}
                style={{
                  flex: 1,
                  borderRadius: 999,
                  backgroundColor:
                    values.latitude === null || values.longitude === null
                      ? 'rgba(212, 175, 55, 0.35)'
                      : '#d4af37',
                  paddingHorizontal: 16,
                  paddingVertical: 13,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: '#070708', fontSize: 12, fontWeight: '900' }}>
                  {copy.form.confirmLocation}
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

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
    stylers: [{ color: '#11171b' }],
  },
  {
    elementType: 'labels.icon',
    stylers: [{ visibility: 'on' }, { saturation: -38 }, { lightness: -8 }],
  },
  {
    elementType: 'labels.text.fill',
    stylers: [{ color: '#dedbd4' }],
  },
  {
    elementType: 'labels.text.stroke',
    stylers: [{ color: '#090c0f' }, { weight: 2.2 }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#303940' }],
  },
  {
    featureType: 'administrative.locality',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f5f2ea' }],
  },
  {
    featureType: 'administrative.neighborhood',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#c8c4ba' }],
  },
  {
    featureType: 'landscape',
    elementType: 'geometry',
    stylers: [{ color: '#151d21' }],
  },
  {
    featureType: 'landscape.man_made',
    elementType: 'geometry',
    stylers: [{ color: '#182025' }],
  },
  {
    featureType: 'landscape.natural',
    elementType: 'geometry',
    stylers: [{ color: '#13231e' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ color: '#182126' }],
  },
  {
    featureType: 'poi',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#bbb7ae' }],
  },
  {
    featureType: 'poi.business',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#cbc5b8' }],
  },
  {
    featureType: 'poi.medical',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'on' }, { saturation: -15 }, { lightness: -4 }],
  },
  {
    featureType: 'poi.park',
    elementType: 'geometry',
    stylers: [{ color: '#18372a' }],
  },
  {
    featureType: 'poi.park',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#a8b9aa' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#3a4248' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#13191d' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.icon',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f0ede6' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry',
    stylers: [{ color: '#665333' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#372d1d' }],
  },
  {
    featureType: 'road.arterial',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#f6f1e7' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry',
    stylers: [{ color: '#8a6a28' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#c29a3b' }],
  },
  {
    featureType: 'road.highway',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#fff5d7' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry',
    stylers: [{ color: '#343d43' }],
  },
  {
    featureType: 'road.local',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#171d21' }],
  },
  {
    featureType: 'road.local',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#e3e0d9' }],
  },
  {
    featureType: 'transit',
    elementType: 'geometry',
    stylers: [{ color: '#242d32' }],
  },
  {
    featureType: 'transit',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#bcb8ae' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#0a3149' }],
  },
  {
    featureType: 'water',
    elementType: 'labels.text.fill',
    stylers: [{ color: '#a2bdcc' }],
  },
];

const getPlaceMarkerSymbol = (category) => {
  if (category === 'veterinary') return '+';
  if (category === 'grooming') return '✂';
  if (category === 'pet_shop') return '';
  if (category === 'breeder') return '⌂';
  if (category === 'trainer') return 'K9';
  if (category === 'large_dog_hotel') return 'H';
  if (category === 'pet_transport') return '↔';
  if (category === 'pharmacy') return 'Rx';
  return 'USG';
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
  const [userLocation, setUserLocation] = useState(null);

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
      const currentLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setUserLocation(currentLocation);

      mapRef.current?.animateToRegion({
        ...currentLocation,
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
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={DEFAULT_REGION}
            mapType="hybrid"
            showsPointsOfInterest
            showsBuildings
            showsCompass={false}
            toolbarEnabled={false}
          >
            {userLocation ? (
              <Marker
                coordinate={userLocation}
                anchor={{ x: 0.5, y: 0.5 }}
                zIndex={1000}
              >
                <View style={styles.userLocationMarker}>
                  <View style={styles.userLocationPulse}>
                    <View style={styles.userLocationCore} />
                  </View>
                </View>
              </Marker>
            ) : null}

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
                    {place.category === 'pet_shop' ? (
                      <View style={{ width: 24, height: 24, position: 'relative' }}>
                        <View style={{ position: 'absolute', left: 7, top: 9, width: 11, height: 10, borderRadius: 7, backgroundColor: '#d4af37' }} />
                        <View style={{ position: 'absolute', left: 2, top: 5, width: 6, height: 7, borderRadius: 4, backgroundColor: '#d4af37' }} />
                        <View style={{ position: 'absolute', left: 7, top: 1, width: 6, height: 7, borderRadius: 4, backgroundColor: '#d4af37' }} />
                        <View style={{ position: 'absolute', right: 5, top: 1, width: 6, height: 7, borderRadius: 4, backgroundColor: '#d4af37' }} />
                        <View style={{ position: 'absolute', right: 0, top: 5, width: 6, height: 7, borderRadius: 4, backgroundColor: '#d4af37' }} />
                      </View>
                    ) : (
                      <Text
                        style={{
                          color: '#d4af37',
                          fontSize: 19,
                          fontWeight: '900',
                        }}
                      >
                        {getPlaceMarkerSymbol(place.category)}
                      </Text>
                    )}
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

          <Image
            source={require('../../assets/icons/usg-map-crest.png')}
            style={styles.mapCrest}
            resizeMode="contain"
            pointerEvents="none"
          />

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
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 7,
    },
    kicker: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 2.4,
    },
    title: {
      color: colors.text,
      fontSize: 24,
      fontWeight: '800',
      letterSpacing: 0.3,
      marginTop: 2,
    },
    subtitle: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 16,
      marginTop: 2,
    },
    modeRow: {
      flexDirection: 'row',
      paddingHorizontal: 12,
      gap: 7,
    },
    modeButton: {
      flex: 1,
      minHeight: 38,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 19,
      paddingHorizontal: 8,
      paddingVertical: 7,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 15, 17, 0.92)',
    },
    modeButtonActive: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    modeButtonText: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '800',
      textAlign: 'center',
    },
    modeButtonTextActive: {
      color: colors.gold,
    },
    filters: {
      gap: 7,
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 8,
      alignItems: 'center',
    },
    filterChip: {
      height: 32,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      paddingHorizontal: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(15, 15, 17, 0.94)',
    },
    filterChipActive: {
      borderColor: colors.gold,
    },
    filterText: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '700',
    },
    filterTextActive: {
      color: colors.gold,
    },
    mapWrap: {
      flex: 1,
      minHeight: 430,
      marginTop: 0,
      marginHorizontal: 0,
      marginBottom: 0,
      overflow: 'hidden',
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.32)',
      backgroundColor: '#0b0e11',
    },
    map: {
      flex: 1,
      minHeight: 430,
      backgroundColor: '#0b0e11',
    },
    mapCrest: {
      position: 'absolute',
      top: 58,
      right: 14,
      width: 54,
      height: 54,
      opacity: 0.18,
    },
    userLocationMarker: {
      width: 50,
      height: 50,
      borderRadius: 25,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(17, 135, 205, 0.22)',
      borderWidth: 2,
      borderColor: 'rgba(72, 187, 255, 0.72)',
    },
    userLocationPulse: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#0b8bd3',
      borderWidth: 3,
      borderColor: '#ffffff',
      shadowColor: '#0b8bd3',
      shadowOpacity: 0.95,
      shadowRadius: 10,
      elevation: 14,
    },
    userLocationCore: {
      width: 9,
      height: 9,
      borderRadius: 4.5,
      backgroundColor: '#ffffff',
    },
    mapActions: {
      position: 'absolute',
      top: 12,
      left: 12,
      right: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    nearButton: {
      backgroundColor: 'rgba(5, 6, 8, 0.92)',
      borderWidth: 1,
      borderColor: colors.gold,
      borderRadius: 999,
      paddingHorizontal: 15,
      paddingVertical: 9,
      shadowColor: '#000',
      shadowOpacity: 0.34,
      shadowRadius: 8,
      elevation: 5,
    },
    nearButtonText: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.35,
    },
    refreshButton: {
      backgroundColor: 'rgba(5, 6, 8, 0.92)',
      borderWidth: 1,
      borderColor: 'rgba(212, 175, 55, 0.52)',
      borderRadius: 999,
      paddingHorizontal: 15,
      paddingVertical: 9,
      shadowColor: '#000',
      shadowOpacity: 0.34,
      shadowRadius: 8,
      elevation: 5,
    },
    refreshButtonDisabled: {
      opacity: 0.55,
    },
    refreshButtonText: {
      color: colors.text,
      fontSize: 10,
      fontWeight: '900',
      letterSpacing: 0.35,
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
    friendlyBadge: {
      alignSelf: 'flex-start',
      marginTop: 9,
      borderWidth: 1,
      borderColor: colors.gold,
      borderRadius: 999,
      paddingHorizontal: 9,
      paddingVertical: 4,
      backgroundColor: colors.activeSurface,
    },
    friendlyBadgeText: {
      color: colors.gold,
      fontSize: 9,
      fontWeight: '900',
      letterSpacing: 0.5,
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
    friendlyToggle: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.surface,
      paddingHorizontal: 13,
      paddingVertical: 12,
    },
    friendlyToggleActive: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    friendlyToggleIcon: {
      width: 24,
      height: 24,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    friendlyToggleIconActive: {
      borderColor: colors.gold,
    },
    friendlyToggleCheck: {
      color: colors.textMuted,
      fontSize: 14,
      fontWeight: '900',
    },
    friendlyToggleCheckActive: {
      color: colors.gold,
    },
    friendlyToggleCopy: {
      flex: 1,
    },
    friendlyToggleTitle: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '800',
    },
    friendlyToggleHint: {
      color: colors.textMuted,
      fontSize: 10,
      lineHeight: 15,
      marginTop: 3,
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
