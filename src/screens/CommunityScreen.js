import { useCallback, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { communityCorsoCopy } from '../community/communityCorsoCopy';
import { getCommunityCorsos } from '../community/communityCorsoService';
import USGProgressBar from '../components/USGProgressBar';
import { useLanguage } from '../i18n/LanguageContext';
import { getAvatarPreset } from '../profile/avatarPresets';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

export default function CommunityScreen() {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const copy = communityCorsoCopy[language] ?? communityCorsoCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [corsos, setCorsos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCommunity = useCallback(async () => {
    setLoading(true);
    setError('');

    const { data, error: loadError } = await getCommunityCorsos();

    if (loadError) {
      setCorsos([]);
      setError(copy.loadError);
      setLoading(false);
      return;
    }

    setCorsos(data ?? []);
    setLoading(false);
  }, [copy.loadError]);

  useFocusEffect(
    useCallback(() => {
      loadCommunity();
    }, [loadCommunity])
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.kicker}>{copy.kicker}</Text>
          <Text style={styles.title}>{copy.title}</Text>
          <Text style={styles.subtitle}>{copy.subtitle}</Text>
        </View>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {loading ? (
          <View style={styles.loadingWrap}>
            <USGProgressBar label={copy.loading} />
          </View>
        ) : corsos.length ? (
          <View style={styles.grid}>
            {corsos.map((corso) => (
              <CommunityCorsoCard
                key={corso.id}
                corso={corso}
                copy={copy}
                styles={styles}
              />
            ))}
          </View>
        ) : !error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{copy.emptyTitle}</Text>
            <Text style={styles.emptyText}>{copy.emptyText}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function CommunityCorsoCard({ corso, copy, styles }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const avatar = getAvatarPreset(corso.owner_avatar_preset);
  const ownerName =
    corso.owner_display_name ||
    (corso.owner_username ? `@${corso.owner_username}` : 'USG');
  const ownerHandle =
    corso.owner_display_name && corso.owner_username
      ? `@${corso.owner_username}`
      : '';
  const location = [corso.city, corso.country].filter(Boolean).join(', ');
  const sex = corso.sex ? copy[corso.sex] : '';
  const color = corso.color ? copy[corso.color] : '';

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.identity}>
          <View style={styles.corsoMark}>
            {corso.photo_url ? (
              <Pressable
                style={styles.corsoPhotoTapTarget}
                onPress={() => setPreviewOpen(true)}
              >
                <Image
                  source={{ uri: corso.photo_url }}
                  style={styles.corsoPhoto}
                  resizeMode="contain"
                />
              </Pressable>
            ) : (
              <Text style={styles.corsoMarkText}>
                {(corso.name || 'C').slice(0, 1).toUpperCase()}
              </Text>
            )}
          </View>

          <View style={styles.identityText}>
            <Text style={styles.corsoName}>{corso.name}</Text>
            <Text style={styles.corsoMeta}>
              {[sex, color].filter(Boolean).join(' · ')}
            </Text>
          </View>
        </View>

        <View style={styles.sharedBadge}>
          <Text style={styles.sharedBadgeText}>{copy.shared}</Text>
        </View>
      </View>

      {corso.description ? (
        <Text style={styles.description}>{corso.description}</Text>
      ) : null}

      <View style={styles.details}>
        {corso.birth_date ? (
          <DetailRow
            label={copy.born}
            value={corso.birth_date}
            styles={styles}
          />
        ) : null}

        {location ? (
          <DetailRow
            label={copy.location}
            value={location}
            styles={styles}
          />
        ) : null}

        {corso.kennel ? (
          <DetailRow
            label={copy.kennel}
            value={corso.kennel}
            styles={styles}
          />
        ) : null}

        {corso.breeder ? (
          <DetailRow
            label={copy.breeder}
            value={corso.breeder}
            styles={styles}
          />
        ) : null}

        {corso.registration_number ? (
          <DetailRow
            label={copy.registration}
            value={corso.registration_number}
            styles={styles}
          />
        ) : null}
      </View>

      <Modal
        visible={previewOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewOpen(false)}
      >
        <Pressable
          style={styles.photoPreviewBackdrop}
          onPress={() => setPreviewOpen(false)}
        >
          <Pressable
            style={styles.photoPreviewClose}
            onPress={() => setPreviewOpen(false)}
          >
            <Text style={styles.photoPreviewCloseText}>×</Text>
          </Pressable>

          <Image
            source={{ uri: corso.photo_url }}
            style={styles.photoPreviewImage}
            resizeMode="contain"
          />
        </Pressable>
      </Modal>

      <View style={styles.ownerCard}>
        <Image source={avatar.source} style={styles.ownerAvatar} />
        <View style={styles.ownerText}>
          <Text style={styles.ownerLabel}>{copy.owner}</Text>
          <Text style={styles.ownerName}>{ownerName}</Text>
          {ownerHandle ? (
            <Text style={styles.ownerHandle}>{ownerHandle}</Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function DetailRow({ label, value, styles }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
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
      padding: spacing.md,
      paddingBottom: 40,
    },
    hero: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 18,
    },
    kicker: {
      color: colors.goldSoft,
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 2,
    },
    title: {
      color: colors.text,
      fontSize: 26,
      fontWeight: '800',
      marginTop: 5,
    },
    subtitle: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 6,
    },
    loadingWrap: {
      marginTop: 14,
    },
    grid: {
      gap: 12,
      marginTop: 12,
    },
    card: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 16,
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: 10,
    },
    identity: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    corsoMark: {
      width: 50,
      height: 50,
      borderRadius: 25,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    corsoPhotoTapTarget: {
      width: '100%',
      height: '100%',
    },
    corsoPhoto: {
      width: '100%',
      height: '100%',
    },
    photoPreviewBackdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.96)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 18,
    },
    photoPreviewImage: {
      width: '100%',
      height: '82%',
    },
    photoPreviewClose: {
      position: 'absolute',
      top: 48,
      right: 22,
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.surface,
      zIndex: 2,
    },
    photoPreviewCloseText: {
      color: colors.gold,
      fontSize: 30,
      lineHeight: 32,
    },
    corsoMarkText: {
      color: colors.gold,
      fontSize: 19,
      fontWeight: '900',
    },
    identityText: {
      flex: 1,
    },
    corsoName: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '800',
    },
    corsoMeta: {
      color: colors.goldSoft,
      fontSize: 10,
      fontWeight: '700',
      marginTop: 4,
    },
    sharedBadge: {
      borderRadius: 999,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
      paddingHorizontal: 9,
      paddingVertical: 5,
    },
    sharedBadgeText: {
      color: colors.gold,
      fontSize: 8,
      fontWeight: '900',
    },
    description: {
      color: colors.text,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 14,
    },
    details: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 14,
      paddingTop: 8,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 12,
      paddingVertical: 5,
    },
    detailLabel: {
      color: colors.textMuted,
      fontSize: 10,
    },
    detailValue: {
      flex: 1,
      color: colors.textSoft,
      fontSize: 10,
      fontWeight: '700',
      textAlign: 'right',
    },
    ownerCard: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.md,
      backgroundColor: colors.surfaceSoft,
      padding: 10,
      marginTop: 12,
    },
    ownerAvatar: {
      width: 38,
      height: 38,
      borderRadius: 19,
      borderWidth: 1,
      borderColor: colors.gold,
      marginRight: 10,
    },
    ownerText: {
      flex: 1,
    },
    ownerLabel: {
      color: colors.textMuted,
      fontSize: 8,
      fontWeight: '800',
      textTransform: 'uppercase',
    },
    ownerName: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '800',
      marginTop: 2,
    },
    ownerHandle: {
      color: colors.goldSoft,
      fontSize: 9,
      marginTop: 2,
    },
    emptyCard: {
      alignItems: 'center',
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: 24,
      marginTop: 12,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
    },
    emptyText: {
      color: colors.textSoft,
      fontSize: 11,
      lineHeight: 17,
      textAlign: 'center',
      marginTop: 6,
    },
    error: {
      color: colors.danger || '#b85c5c',
      fontSize: 11,
      lineHeight: 16,
      marginTop: 12,
    },
  });
}
