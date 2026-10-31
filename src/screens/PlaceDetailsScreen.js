import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getMyRole } from '../admin/adminService';
import { useAuth } from '../auth/AuthContext';
import { useLanguage } from '../i18n/LanguageContext';
import { placeCategories, placeCopy } from '../places/placeCopy';
import {
  addPlaceFavorite,
  addPlaceReviewHelpful,
  deletePlaceReview,
  getPlaceById,
  getPlaceReviewHelpful,
  getPlaceReviews,
  isPlaceFavorite,
  removePlaceFavorite,
  removePlaceReviewHelpful,
  savePlaceReview,
  updatePlaceByOwnerOrAdmin,
} from '../places/placeService';
import { useTheme } from '../theme/ThemeContext';

export default function PlaceDetailsScreen({ route }) {
  const { placeId } = route.params ?? {};
  const { language } = useLanguage();
  const { user } = useAuth();
  const { colors } = useTheme();
  const copy = placeCopy[language] ?? placeCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [favoriteSaving, setFavoriteSaving] = useState(false);
  const [favoriteError, setFavoriteError] = useState('');
  const [role, setRole] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editValues, setEditValues] = useState(null);
  const [editSaving, setEditSaving] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [helpfulRows, setHelpfulRows] = useState([]);
  const [helpfulSavingId, setHelpfulSavingId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function load() {
        setLoading(true);
        const [
          { data, error },
          favoriteResult,
          reviewsResult,
          helpfulResult,
        ] = await Promise.all([
          getPlaceById(placeId),
          user?.id
            ? isPlaceFavorite(user.id, placeId)
            : Promise.resolve({ data: null, error: null }),
          getPlaceReviews(placeId),
          getPlaceReviewHelpful(placeId),
        ]);

        if (!active) {
          return;
        }

        if (error) {
          setErrorText(copy.loadError);
        } else {
          setPlace(data);
          setErrorText('');
        }

        if (!favoriteResult.error) {
          setFavorite(Boolean(favoriteResult.data));
        }

        if (reviewsResult.error) {
          setReviewError(copy.details.reviewsLoadError);
        } else {
          const nextReviews = reviewsResult.data ?? [];
          setReviews(nextReviews);
          const ownReview = nextReviews.find((review) => review.user_id === user?.id);
          setReviewRating(ownReview?.rating ?? 0);
          setReviewComment(ownReview?.comment ?? '');
          setReviewError('');
        }

        if (!helpfulResult.error) {
          setHelpfulRows(helpfulResult.data ?? []);
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
    }, [copy.details.reviewsLoadError, copy.loadError, placeId, user?.id])
  );

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadRole() {
        const result = await getMyRole(user?.id);

        if (active && !result.error) {
          setRole(result.data?.role ?? 'user');
        }
      }

      if (user?.id) {
        loadRole();
      }

      return () => {
        active = false;
      };
    }, [user?.id])
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

  async function toggleFavorite() {
    if (!user?.id || favoriteSaving) {
      return;
    }

    setFavoriteSaving(true);
    setFavoriteError('');

    const result = favorite
      ? await removePlaceFavorite(user.id, place.id)
      : await addPlaceFavorite(user.id, place.id);

    if (result.error) {
      setFavoriteError(copy.favorites.error);
    } else {
      setFavorite((current) => !current);
    }

    setFavoriteSaving(false);
  }

  async function submitReview() {
    if (!user?.id || reviewSaving) {
      return;
    }

    if (reviewRating < 1 || reviewRating > 5) {
      setReviewError(copy.details.reviewRequired);
      return;
    }

    setReviewSaving(true);
    setReviewError('');

    const result = await savePlaceReview(
      user.id,
      place.id,
      reviewRating,
      reviewComment
    );

    if (result.error) {
      setReviewError(copy.details.reviewSaveError);
    } else {
      const saved = result.data;
      setReviews((current) => [
        saved,
        ...current.filter((review) => review.user_id !== user.id),
      ]);
    }

    setReviewSaving(false);
  }

  async function removeReview() {
    if (!user?.id || reviewSaving) {
      return;
    }

    setReviewSaving(true);
    setReviewError('');

    const result = await deletePlaceReview(user.id, place.id);

    if (result.error) {
      setReviewError(copy.details.reviewDeleteError);
    } else {
      setReviews((current) =>
        current.filter((review) => review.user_id !== user.id)
      );
      setReviewRating(0);
      setReviewComment('');
    }

    setReviewSaving(false);
  }

  async function toggleHelpful(review) {
    if (
      !user?.id ||
      review.user_id === user.id ||
      helpfulSavingId === review.id
    ) {
      return;
    }

    setHelpfulSavingId(review.id);
    setReviewError('');

    const active = helpfulRows.some(
      (row) => row.review_id === review.id && row.user_id === user.id
    );

    const result = active
      ? await removePlaceReviewHelpful(user.id, review.id)
      : await addPlaceReviewHelpful(user.id, place.id, review.id);

    if (result.error) {
      setReviewError(copy.details.helpfulError);
    } else if (active) {
      setHelpfulRows((current) =>
        current.filter(
          (row) => !(row.review_id === review.id && row.user_id === user.id)
        )
      );
    } else {
      setHelpfulRows((current) => [
        ...current,
        { review_id: review.id, user_id: user.id },
      ]);
    }

    setHelpfulSavingId(null);
  }

  function beginEdit() {
    setEditMessage('');
    setEditValues({
      name: place.name ?? '',
      category: place.category ?? 'other',
      country: place.country ?? '',
      city: place.city ?? '',
      address: place.address ?? '',
      phone: place.phone ?? '',
      website: place.website ?? '',
      description: place.description ?? '',
      latitude: String(place.latitude ?? ''),
      longitude: String(place.longitude ?? ''),
      caneCorsoFriendly: Boolean(place.cane_corso_friendly),
    });
    setEditing(true);
  }

  function setEditField(field, value) {
    setEditValues((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function saveEdit() {
    if (!editValues || editSaving) {
      return;
    }

    const latitude = Number(editValues.latitude);
    const longitude = Number(editValues.longitude);

    if (
      !editValues.name.trim() ||
      !editValues.category ||
      !editValues.country.trim() ||
      !editValues.city.trim() ||
      !editValues.address.trim() ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude) ||
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      setEditMessage(copy.edit.required);
      return;
    }

    setEditSaving(true);
    setEditMessage('');

    const result = await updatePlaceByOwnerOrAdmin(place.id, editValues);

    if (result.error) {
      setEditMessage(copy.edit.failed);
    } else {
      setPlace(result.data);
      setEditing(false);
      setEditMessage(
        role === 'admin' ? copy.edit.adminSuccess : copy.edit.ownerSuccess
      );
    }

    setEditSaving(false);
  }

  const canEdit =
    role === 'admin' ||
    (Boolean(user?.id) && place.created_by === user.id);

  const ownReview = reviews.find((review) => review.user_id === user?.id);
  const communityReviews = reviews.filter(
    (review) => review.user_id !== user?.id
  );
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
      : 0;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.kicker}>{copy.categories[place.category]}</Text>
        <Text style={styles.title}>{place.name}</Text>

        <Pressable
          style={[styles.favoriteButton, favorite && styles.favoriteButtonActive]}
          onPress={toggleFavorite}
          disabled={favoriteSaving}
        >
          <Text style={[styles.favoriteIcon, favorite && styles.favoriteIconActive]}>
            {favorite ? '♥' : '♡'}
          </Text>
          <Text style={[styles.favoriteText, favorite && styles.favoriteTextActive]}>
            {favorite ? copy.favorites.remove : copy.favorites.add}
          </Text>
        </Pressable>

        {favoriteError ? (
          <Text style={styles.favoriteError}>{favoriteError}</Text>
        ) : null}

        {canEdit ? (
          <Pressable style={styles.editPlaceButton} onPress={beginEdit}>
            <Text style={styles.editPlaceButtonText}>{copy.edit.button}</Text>
          </Pressable>
        ) : null}

        {editMessage ? (
          <Text style={styles.editMessage}>{editMessage}</Text>
        ) : null}

        {editing && editValues ? (
          <View style={styles.editPanel}>
            <Text style={styles.editTitle}>{copy.edit.title}</Text>
            <Text style={styles.editNotice}>
              {role === 'admin' ? copy.edit.adminNotice : copy.edit.ownerNotice}
            </Text>

            <TextInput
              style={styles.editInput}
              value={editValues.name}
              onChangeText={(value) => setEditField('name', value)}
              placeholder={copy.form.name}
              placeholderTextColor={colors.textMuted}
            />

            <Text style={styles.editFieldLabel}>{copy.form.category}</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.editCategoryRow}
            >
              {placeCategories.map((category) => (
                <Pressable
                  key={category}
                  style={[
                    styles.editCategoryChip,
                    editValues.category === category &&
                      styles.editCategoryChipActive,
                  ]}
                  onPress={() => setEditField('category', category)}
                >
                  <Text
                    style={[
                      styles.editCategoryChipText,
                      editValues.category === category &&
                        styles.editCategoryChipTextActive,
                    ]}
                  >
                    {copy.categories[category]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {[
              ['country', copy.form.country],
              ['city', copy.form.city],
              ['address', copy.form.address],
              ['phone', copy.form.phone],
              ['website', copy.form.website],
            ].map(([field, placeholder]) => (
              <TextInput
                key={field}
                style={styles.editInput}
                value={editValues[field]}
                onChangeText={(value) => setEditField(field, value)}
                placeholder={placeholder}
                placeholderTextColor={colors.textMuted}
                autoCapitalize={field === 'website' ? 'none' : 'sentences'}
              />
            ))}

            <TextInput
              style={[styles.editInput, styles.editTextarea]}
              value={editValues.description}
              onChangeText={(value) => setEditField('description', value)}
              placeholder={copy.form.description}
              placeholderTextColor={colors.textMuted}
              multiline
              textAlignVertical="top"
            />

            <TextInput
              style={styles.editInput}
              value={editValues.latitude}
              onChangeText={(value) => setEditField('latitude', value)}
              placeholder={copy.edit.latitude}
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />

            <TextInput
              style={styles.editInput}
              value={editValues.longitude}
              onChangeText={(value) => setEditField('longitude', value)}
              placeholder={copy.edit.longitude}
              placeholderTextColor={colors.textMuted}
              keyboardType="decimal-pad"
            />

            <Pressable
              style={[
                styles.editFriendlyToggle,
                editValues.caneCorsoFriendly &&
                  styles.editFriendlyToggleActive,
              ]}
              onPress={() =>
                setEditField(
                  'caneCorsoFriendly',
                  !editValues.caneCorsoFriendly
                )
              }
            >
              <Text style={styles.editFriendlyToggleText}>
                {editValues.caneCorsoFriendly ? '✓ ' : ''}
                {copy.edit.friendly}
              </Text>
            </Pressable>

            <View style={styles.editActions}>
              <Pressable
                style={styles.editCancelButton}
                onPress={() => {
                  setEditing(false);
                  setEditMessage('');
                }}
              >
                <Text style={styles.editCancelButtonText}>
                  {copy.edit.cancel}
                </Text>
              </Pressable>

              <Pressable
                style={styles.editSaveButton}
                onPress={saveEdit}
                disabled={editSaving}
              >
                <Text style={styles.editSaveButtonText}>
                  {copy.edit.save}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : null}

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

        <View style={styles.reviewSection}>
          <Text style={styles.reviewSectionTitle}>{copy.details.reviewsTitle}</Text>

          <View style={styles.reviewSummary}>
            <Text style={styles.reviewAverage}>
              {reviews.length > 0 ? averageRating.toFixed(1) : '—'}
            </Text>
            <View style={styles.reviewSummaryText}>
              <Text style={styles.reviewStars}>
                {reviews.length > 0
                  ? '★'.repeat(Math.round(averageRating)) +
                    '☆'.repeat(5 - Math.round(averageRating))
                  : '☆☆☆☆☆'}
              </Text>
              <Text style={styles.reviewCount}>
                {copy.details.reviewsSummary} · {reviews.length} {copy.details.reviewsCount}
              </Text>
            </View>
          </View>

          <View style={styles.reviewEditor}>
            <Text style={styles.reviewEditorTitle}>{copy.details.yourReview}</Text>

            <View style={styles.ratingHeader}>
              <Text style={styles.ratingLabel}>{copy.details.ratingLabel}</Text>
              <Text style={styles.ratingValue}>
                {reviewRating > 0 ? `${reviewRating}/5` : '—/5'}
              </Text>
            </View>

            <View style={styles.starRow}>
              {[1, 2, 3, 4, 5].map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityLabel={`${value}/5`}
                  hitSlop={8}
                  style={({ pressed }) => [
                    styles.starButton,
                    pressed && styles.starButtonPressed,
                  ]}
                  onPress={() => setReviewRating(value)}
                >
                  <Text style={styles.starButtonText}>
                    {value <= reviewRating ? '★' : '☆'}
                  </Text>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              value={reviewComment}
              onChangeText={setReviewComment}
              placeholder={copy.details.commentPlaceholder}
              placeholderTextColor={colors.textMuted}
              maxLength={500}
              multiline
              textAlignVertical="top"
            />

            <Text style={styles.reviewCharacterCount}>
              {reviewComment.length}/500
            </Text>

            <Pressable
              style={styles.reviewSaveButton}
              onPress={submitReview}
              disabled={reviewSaving}
            >
              <Text style={styles.reviewSaveButtonText}>
                {ownReview ? copy.details.updateReview : copy.details.saveReview}
              </Text>
            </Pressable>

            {ownReview ? (
              <Pressable
                style={styles.reviewDeleteButton}
                onPress={removeReview}
                disabled={reviewSaving}
              >
                <Text style={styles.reviewDeleteButtonText}>
                  {copy.details.deleteReview}
                </Text>
              </Pressable>
            ) : null}

            {reviewError ? (
              <Text style={styles.reviewError}>{reviewError}</Text>
            ) : null}
          </View>

          <View style={styles.communityReviewSection}>
            <Text style={styles.communityReviewTitle}>
              {copy.details.communityReviews}
            </Text>

            <View style={styles.reviewList}>
              {communityReviews.length === 0 ? (
                <Text style={styles.noReviews}>
                  {copy.details.noCommunityReviews}
                </Text>
              ) : (
                communityReviews.map((review) => (
                  <View key={review.id} style={styles.reviewCard}>
                    <View style={styles.reviewCardHeader}>
                      <Text style={styles.reviewAuthor}>
                        {copy.details.memberReview}
                      </Text>
                      <Text style={styles.reviewRatingValue}>
                        {review.rating}/5
                      </Text>
                    </View>

                    {review.comment ? (
                      <Text style={styles.reviewComment}>{review.comment}</Text>
                    ) : null}

                    <View style={styles.reviewFooter}>
                      <Text style={styles.reviewDate}>
                        {(review.updated_at || review.created_at || '').slice(0, 10)}
                      </Text>

                      <Pressable
                        style={[
                          styles.helpfulButton,
                          helpfulRows.some(
                            (row) =>
                              row.review_id === review.id &&
                              row.user_id === user?.id
                          ) && styles.helpfulButtonActive,
                        ]}
                        onPress={() => toggleHelpful(review)}
                        disabled={helpfulSavingId === review.id}
                      >
                        <Text style={styles.helpfulIcon}>👍</Text>
                        <Text style={styles.helpfulText}>
                          {copy.details.helpful}
                        </Text>
                        <Text style={styles.helpfulCount}>
                          {
                            helpfulRows.filter(
                              (row) => row.review_id === review.id
                            ).length
                          }
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
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
    favoriteButton: {
      minHeight: 46,
      borderWidth: 1,
      borderColor: colors.gold,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.surface,
    },
    favoriteButtonActive: {
      backgroundColor: colors.gold,
    },
    favoriteIcon: {
      color: colors.gold,
      fontSize: 20,
      lineHeight: 22,
    },
    favoriteIconActive: {
      color: colors.background,
    },
    favoriteText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.4,
    },
    favoriteTextActive: {
      color: colors.background,
    },
    favoriteError: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 17,
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
    reviewSection: {
      marginTop: 8,
      gap: 12,
    },
    reviewSectionTitle: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 1,
    },
    reviewSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
      backgroundColor: colors.surface,
    },
    reviewAverage: {
      color: colors.gold,
      fontSize: 30,
      fontWeight: '900',
    },
    reviewSummaryText: {
      flex: 1,
      gap: 3,
    },
    reviewStars: {
      color: colors.gold,
      fontSize: 18,
      letterSpacing: 2,
    },
    reviewCount: {
      color: colors.textMuted,
      fontSize: 11,
    },
    reviewEditor: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
      gap: 10,
      backgroundColor: colors.surface,
    },
    reviewEditorTitle: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '900',
    },
    ratingHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    ratingLabel: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '800',
    },
    ratingValue: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '900',
    },
    starRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 4,
    },
    starButton: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
    },
    starButtonPressed: {
      backgroundColor: colors.activeSurface,
    },
    starButtonText: {
      color: colors.gold,
      fontSize: 30,
      lineHeight: 34,
    },
    reviewInput: {
      minHeight: 96,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      backgroundColor: colors.background,
      fontSize: 13,
      lineHeight: 19,
    },
    reviewCharacterCount: {
      color: colors.textMuted,
      fontSize: 10,
      textAlign: 'right',
    },
    reviewSaveButton: {
      minHeight: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.gold,
      paddingHorizontal: 12,
    },
    reviewSaveButtonText: {
      color: colors.background,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    reviewDeleteButton: {
      minHeight: 42,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 12,
    },
    reviewDeleteButtonText: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '800',
    },
    reviewError: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 17,
    },
    communityReviewSection: {
      marginTop: 4,
      gap: 10,
    },
    communityReviewTitle: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.9,
    },
    reviewList: {
      gap: 10,
    },
    noReviews: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
      paddingVertical: 8,
    },
    reviewCard: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      padding: 14,
      gap: 8,
      backgroundColor: colors.surface,
    },
    reviewCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
    },
    reviewAuthor: {
      flex: 1,
      color: colors.text,
      fontSize: 11,
      fontWeight: '900',
    },
    reviewRatingValue: {
      color: colors.gold,
      fontSize: 12,
      fontWeight: '900',
    },
    reviewComment: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 19,
    },
    reviewFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },
    reviewDate: {
      color: colors.textMuted,
      fontSize: 10,
    },
    helpfulButton: {
      minHeight: 34,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 5,
    },
    helpfulButtonActive: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    helpfulIcon: {
      fontSize: 14,
    },
    helpfulText: {
      color: colors.textMuted,
      fontSize: 10,
      fontWeight: '800',
    },
    helpfulCount: {
      color: colors.gold,
      fontSize: 10,
      fontWeight: '900',
    },
    editPlaceButton: {
      minHeight: 44,
      borderWidth: 1,
      borderColor: colors.gold,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    editPlaceButtonText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    editMessage: {
      color: colors.textMuted,
      fontSize: 12,
      lineHeight: 18,
      textAlign: 'center',
    },
    editPanel: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 16,
      padding: 14,
      gap: 10,
      backgroundColor: colors.surface,
    },
    editTitle: {
      color: colors.gold,
      fontSize: 16,
      fontWeight: '900',
    },
    editNotice: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 17,
    },
    editFieldLabel: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '800',
    },
    editInput: {
      minHeight: 46,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      backgroundColor: colors.background,
      fontSize: 13,
    },
    editTextarea: {
      minHeight: 92,
    },
    editCategoryRow: {
      gap: 8,
      paddingVertical: 2,
    },
    editCategoryChip: {
      minHeight: 36,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editCategoryChipActive: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    editCategoryChipText: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '800',
    },
    editCategoryChipTextActive: {
      color: colors.gold,
    },
    editFriendlyToggle: {
      minHeight: 44,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    editFriendlyToggleActive: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    editFriendlyToggleText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '900',
      textAlign: 'center',
    },
    editActions: {
      flexDirection: 'row',
      gap: 10,
    },
    editCancelButton: {
      flex: 1,
      minHeight: 44,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
    },
    editCancelButtonText: {
      color: colors.textMuted,
      fontSize: 11,
      fontWeight: '900',
    },
    editSaveButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 10,
      backgroundColor: colors.gold,
    },
    editSaveButtonText: {
      color: colors.background,
      fontSize: 11,
      fontWeight: '900',
    },
    errorText: {
      color: colors.textMuted,
      textAlign: 'center',
    },
  });
}
