import { useCallback, useMemo, useState, useRef } from 'react';
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
import { communityQuestionsCopy } from '../community/communityQuestionsCopy';
import { getCommunityCorsos, setCommunityCorsoVote } from '../community/communityCorsoService';
import USGProgressBar from '../components/USGProgressBar';
import USGInteractiveHeroImage from '../components/USGInteractiveHeroImage';
import { useLanguage } from '../i18n/LanguageContext';
import USGBackToTop from '../components/USGBackToTop';
import { getAvatarPreset } from '../profile/avatarPresets';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';

export default function CommunityScreen({ navigation }) {
  const scrollRef = useRef(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({
        y: 0,
        animated: false,
      });
    }, [])
  );
  const { language } = useLanguage();
  const { colors } = useTheme();
  const copy = communityCorsoCopy[language] ?? communityCorsoCopy.en;
  const questionsCopy = communityQuestionsCopy[language] ?? communityQuestionsCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [corsos, setCorsos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [votingDogId, setVotingDogId] = useState(null);

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

  const changeVote = useCallback(async (corso) => {
    if (votingDogId || !corso.viewer_can_vote || corso.vote_count == null) return false;
    setVotingDogId(corso.id);
    try {
      const { data, error: voteError } = await setCommunityCorsoVote(
        corso.id,
        !corso.viewer_has_voted
      );
      if (voteError || !Array.isArray(data) || data.length !== 1) return false;
      const next = data[0];
      const count = Number(next.vote_count);
      if (!Number.isSafeInteger(count) || count < 0 || typeof next.viewer_has_voted !== 'boolean') return false;
      setCorsos((items) => items.map((item) => item.id === corso.id ? {
        ...item,
        vote_count: count,
        viewer_has_voted: next.viewer_has_voted,
      } : item));
      return true;
    } catch {
      return false;
    } finally {
      setVotingDogId(null);
    }
  }, [votingDogId]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        ref={scrollRef}
        onScroll={(event) => {
          const visible = event.nativeEvent.contentOffset.y > 220;
          setShowBackToTop((current) => current === visible ? current : visible);
        }}
        scrollEventThrottle={32}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <USGInteractiveHeroImage
          source={require('../../assets/community-hero.png')}
          title={copy.title}
        />

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
                language={language}
                styles={styles}
                onVote={changeVote}
                voting={votingDogId === corso.id}
              />
            ))}
          </View>
        ) : !error ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>{copy.emptyTitle}</Text>
            <Text style={styles.emptyText}>{copy.emptyText}</Text>
          </View>
        ) : null}
        <View style={styles.questionsEntry}>
          <Text style={styles.questionsEntryTitle}>{questionsCopy.entryTitle}</Text>
          <Text style={styles.questionsEntryText}>{questionsCopy.entryDescription}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={questionsCopy.entryAction}
            style={styles.questionsEntryButton}
            onPress={() => navigation.getParent()?.navigate('CommunityQuestions')}
          >
            <Text style={styles.questionsEntryButtonText}>{questionsCopy.entryAction}</Text>
          </Pressable>
        </View>

      </ScrollView>
      <USGBackToTop
        visible={showBackToTop}
        language={language}
        onPress={() => scrollRef.current?.scrollTo({ y: 0, animated: true })}
      />
    </SafeAreaView>
  );
}

function CommunityCorsoCard({ corso, copy, language, styles, onVote, voting }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [voteError, setVoteError] = useState(false);
  const voteAvailable = corso.vote_count !== null && corso.vote_count !== undefined;
  const voteAllowed = voteAvailable && corso.viewer_can_vote;
  const handleVote = async () => {
    setVoteError(false);
    const ok = await onVote(corso);
    if (!ok) setVoteError(true);
  };
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
  const voteCountValue = corso.vote_count;
  const parsedVoteCount = voteCountValue === null || voteCountValue === undefined
    ? null
    : Number(voteCountValue);
  const voteCount = Number.isInteger(parsedVoteCount) && parsedVoteCount >= 0
    ? parsedVoteCount
    : null;

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.identity}>
          <View style={styles.corsoMark}>
            {corso.photo_url ? (
              <Pressable
                style={styles.corsoPhotoTapTarget}
                onPress={() => { setVoteError(false); setPreviewOpen(true); }}
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
            value={formatCommunityBirthDate(corso.birth_date, language)}
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

          <Pressable style={styles.photoVotePanel} onPress={(event) => event.stopPropagation()}>
            <Text style={styles.photoVoteName}>{corso.name}</Text>
            <Text style={styles.photoVoteCount}>👍 {voteAvailable ? corso.vote_count : '—'} · {copy.communityVotes}</Text>
            {voteAvailable && (
              <Text style={styles.photoVoteProgress}>{copy.recognitionProgress}: {Math.min(corso.vote_count, 50)} / 50</Text>
            )}
            {voteAllowed ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={corso.viewer_has_voted ? copy.unvoteAction : copy.voteAction}
                disabled={voting}
                style={[styles.photoVoteButton, voting && styles.photoVoteButtonDisabled]}
                onPress={(event) => { event.stopPropagation(); handleVote(); }}
              >
                <Text style={styles.photoVoteButtonText}>
                  {voting ? copy.voteSaving : corso.viewer_has_voted ? copy.unvoteAction : copy.voteAction}
                </Text>
              </Pressable>
            ) : (
              <Text style={styles.photoVoteDisabled}>
                {voteAvailable ? copy.cannotVote : copy.votesNotActive}
              </Text>
            )}
            {voteError ? <Text style={styles.photoVoteError}>{copy.voteError}</Text> : null}
          </Pressable>
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

      <View style={styles.votePanel}>
        <View style={styles.voteHeading}>
          <Text style={styles.voteSymbol}>👍</Text>
          <Text style={styles.voteTitle}>{copy.communityVotes}</Text>
          <Text style={styles.voteNumber}>{voteCount === null ? '—' : voteCount}</Text>
        </View>
        {voteCount === null ? (
          <Text style={styles.voteUnavailable}>{copy.votesNotActive}</Text>
        ) : (
          <Text style={styles.voteProgress}>
            {copy.recognitionProgress}: {Math.min(voteCount, 50)} / 50
          </Text>
        )}
      </View>
    </View>
  );
}

function formatCommunityBirthDate(value, language) {
  if (typeof value !== 'string') return value;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return value;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year ||
      date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day) return value;
  if (language === 'bg') return `${match[3]}.${match[2]}.${match[1]}`;
  if (language === 'it') return `${match[3]}/${match[2]}/${match[1]}`;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
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
    questionsEntry: {
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: colors.goldDark,
      backgroundColor: colors.activeSurface,
      padding: 18,
      marginTop: 12,
    },
    questionsEntryTitle: {
      color: colors.gold,
      fontSize: 18,
      fontWeight: '800',
    },
    questionsEntryText: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
      marginTop: 8,
    },
    questionsEntryButton: {
      backgroundColor: colors.gold,
      borderRadius: radius.md,
      paddingVertical: 13,
      paddingHorizontal: 14,
      alignItems: 'center',
      marginTop: 14,
      minHeight: 46,
      justifyContent: 'center',
    },
    questionsEntryButtonText: {
      color: colors.background,
      fontSize: 13,
      fontWeight: '800',
      textAlign: 'center',
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
      flex: 1,
      marginTop: 68,
    },
    photoVotePanel: {
      width: '100%',
      borderWidth: 1,
      borderColor: colors.goldDark,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      padding: 14,
      marginTop: 8,
      marginBottom: 18,
      alignItems: 'center',
    },
    photoVoteName: {
      color: colors.gold,
      fontWeight: '800',
      fontSize: 16,
    },
    photoVoteCount: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 12,
      marginTop: 6,
    },
    photoVoteProgress: {
      color: colors.goldSoft,
      fontSize: 10,
      marginTop: 5,
    },
    photoVoteButton: {
      backgroundColor: colors.gold,
      borderRadius: radius.md,
      paddingVertical: 12,
      paddingHorizontal: 22,
      minHeight: 44,
      justifyContent: 'center',
      marginTop: 12,
    },
    photoVoteButtonDisabled: {
      opacity: 0.55,
    },
    photoVoteButtonText: {
      color: colors.background,
      fontWeight: '800',
      fontSize: 12,
      textAlign: 'center',
    },
    photoVoteDisabled: {
      color: colors.textMuted,
      fontSize: 11,
      marginTop: 12,
      textAlign: 'center',
    },
    photoVoteError: {
      color: colors.danger || '#b85c5c',
      fontSize: 11,
      marginTop: 8,
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
    votePanel: {
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.activeSurface,
      paddingHorizontal: 12,
      paddingVertical: 12,
      marginTop: 12,
    },
    voteHeading: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    voteSymbol: {
      fontSize: 17,
      marginRight: 9,
    },
    voteTitle: {
      color: colors.textSoft,
      fontSize: 12,
      fontWeight: '700',
      flex: 1,
    },
    voteNumber: {
      color: colors.gold,
      fontSize: 17,
      fontWeight: '800',
    },
    voteUnavailable: {
      color: colors.textMuted,
      fontSize: 10,
      lineHeight: 16,
      marginTop: 5,
    },
    voteProgress: {
      color: colors.goldSoft,
      fontSize: 10,
      marginTop: 5,
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
