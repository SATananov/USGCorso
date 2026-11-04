import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { getMyRole } from '../admin/adminService';
import { useAuth } from '../auth/AuthContext';
import USGSectionScreen from '../components/USGSectionScreen';
import { useLanguage } from '../i18n/LanguageContext';
import {
  getMyProfessionalApplication,
  submitProfessionalApplication,
} from '../services/professionalAccessService';
import {
  getServiceLabel,
  serviceCategoryGroups,
} from '../services/serviceCategories';
import { radius, spacing } from '../styles/usgTheme';
import { useTheme } from '../theme/ThemeContext';


import ServiceCategoryPublicList from '../components/ServiceCategoryPublicList';
import { getPublicProfessionalProfileCategoryCounts } from '../services/professionalProfileService';
import ServicePublicProfileDetails from '../components/ServicePublicProfileDetails';
const copy = {
  en: {
    intro: 'Profiles in this area use private owner data, USG moderation and admin-controlled public visibility.',
    privateTitle: 'Privacy by default',
    privateText: 'Professional users can complete their own profile and contact data. Private data stays visible only to the profile owner and USG administration unless an administrator explicitly approves a field for public display.',
    accessTitle: 'Professional access',
    manageProfile: 'MY PROFESSIONAL PROFILE',
    guestText: 'Sign in to apply for professional or organization access.',
    applyText: 'Only approved professional and organization accounts can create and manage profiles in this section.',
    type: 'Account type',
    professional: 'Professional',
    organization: 'Organization',
    categories: 'Categories',
    message: 'Application message',
    messagePlaceholder: 'Briefly describe your professional activity or organization.',
    submit: 'SUBMIT APPLICATION',
    submitting: 'SUBMITTING...',
    chooseCategory: 'Choose at least one category.',
    submitFailed: 'The application could not be submitted.',
    pending: 'Your application is pending administrator review.',
    approved: 'Your professional access is approved.',
    rejected: 'Your application was rejected. You can update it and submit again.',
    needs_changes: 'Changes were requested. Update your application and submit again.',
    admin: 'Administrator access is active.',
    status: 'Status',
    adminNote: 'Admin note',
  },
  bg: {
    intro: 'Професионалисти и организации в света на Кане Корсо с USG модерация и контролирана публичност.',
    privateTitle: 'Поверителност по подразбиране',
    privateText: 'Професионалистите могат да попълват своя профил и контактни данни. Личната информация остава видима само за собственика на профила и администрацията на USG, освен ако администратор изрично не разреши конкретно поле за публично показване.',
    accessTitle: 'Професионален достъп',
    manageProfile: 'МОЯТ ПРОФЕСИОНАЛЕН ПРОФИЛ',
    guestText: 'Влезте в профила си, за да кандидатствате като професионалист или организация.',
    applyText: 'Само одобрени професионални и организационни акаунти могат да създават и управляват профили в тази секция.',
    type: 'Тип профил',
    professional: 'Професионалист',
    organization: 'Организация',
    categories: 'Категории',
    message: 'Съобщение към заявката',
    messagePlaceholder: 'Опишете накратко професионалната си дейност или организацията.',
    submit: 'ИЗПРАТИ ЗАЯВКА',
    submitting: 'ИЗПРАЩАНЕ...',
    chooseCategory: 'Изберете поне една категория.',
    submitFailed: 'Заявката не можа да бъде изпратена.',
    pending: 'Заявката ви очаква преглед от администратор.',
    approved: 'Професионалният ви достъп е одобрен.',
    rejected: 'Заявката ви е отказана. Можете да я редактирате и изпратите отново.',
    needs_changes: 'Изискани са промени. Актуализирайте заявката и я изпратете отново.',
    admin: 'Администраторският достъп е активен.',
    status: 'Статус',
    adminNote: 'Бележка от администратор',
  },
  it: {
    intro: "I profili di questa sezione usano dati privati del proprietario, moderazione USG e visibilità pubblica controllata dall'amministratore.",
    privateTitle: 'Privacy predefinita',
    privateText: "Gli utenti professionali possono completare il proprio profilo e i dati di contatto. I dati privati restano visibili solo al proprietario del profilo e all'amministrazione USG, salvo approvazione esplicita di un campo per la visualizzazione pubblica.",
    accessTitle: 'Accesso professionale',
    manageProfile: 'IL MIO PROFILO PROFESSIONALE',
    guestText: 'Accedi per candidarti come professionista o organizzazione.',
    applyText: 'Solo gli account professionali e organizzativi approvati possono creare e gestire profili in questa sezione.',
    type: 'Tipo di account',
    professional: 'Professionista',
    organization: 'Organizzazione',
    categories: 'Categorie',
    message: 'Messaggio della candidatura',
    messagePlaceholder: 'Descrivi brevemente la tua attività professionale o organizzazione.',
    submit: 'INVIA CANDIDATURA',
    submitting: 'INVIO...',
    chooseCategory: 'Seleziona almeno una categoria.',
    submitFailed: 'Non è stato possibile inviare la candidatura.',
    pending: "La candidatura è in attesa di revisione da parte dell'amministratore.",
    approved: 'Il tuo accesso professionale è stato approvato.',
    rejected: 'La candidatura è stata rifiutata. Puoi aggiornarla e inviarla di nuovo.',
    needs_changes: 'Sono state richieste modifiche. Aggiorna la candidatura e inviala di nuovo.',
    admin: "L'accesso amministratore è attivo.",
    status: 'Stato',
    adminNote: 'Nota amministratore',
  },
};

const applicationFieldCopy = {
  bg: {
    profileName: 'Име / наименование',
    phone: 'Телефон',
    email: 'Email',
    country: 'Държава',
    city: 'Град',
    requiredInfo: 'Попълни име, телефон, email, държава, град, категория и кратко описание.',
  },
  en: {
    profileName: 'Name / business name',
    phone: 'Phone',
    email: 'Email',
    country: 'Country',
    city: 'City',
    requiredInfo: 'Complete name, phone, email, country, city, category and a short description.',
  },
  it: {
    profileName: 'Nome / denominazione',
    phone: 'Telefono',
    email: 'Email',
    country: 'Paese',
    city: 'Città',
    requiredInfo: 'Completa nome, telefono, email, paese, città, categoria e una breve descrizione.',
  },
};

function getApplicationFromResult(data) {
  if (Array.isArray(data)) {
    return data[0] ?? null;
  }

  return data ?? null;
}

export default function ServicesScreen({ navigation, route }) {
  const publicCategoryKey = route?.params?.categoryKey;
  const openApplication = route?.params?.openApplication === true;
  const publicProfileId = route?.params?.profileId;

  if (publicProfileId) {
    return (
      <ServicePublicProfileDetails
        profileId={publicProfileId}
        onBack={() => {
          if (publicCategoryKey) {
            navigation.setParams({
              profileId: undefined,
              categoryKey: publicCategoryKey,
            });
            return;
          }

          navigation.goBack();
        }}
      />
    );
  }

  if (publicCategoryKey) {
    return (
      <ServiceCategoryPublicList
        categoryKey={publicCategoryKey}
        onBack={() => navigation.goBack()}
        onNext={(nextCategoryKey) =>
          navigation.setParams({
            categoryKey: nextCategoryKey,
            profileId: undefined,
          })
        }
        onOpenProfile={(profileId) =>
          navigation.navigate('Services', {
            profileId,
            categoryKey: publicCategoryKey,
          })
        }
      />
    );
  }
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const labels = copy[language] ?? copy.en;
  const applicationLabels = applicationFieldCopy[language] ?? applicationFieldCopy.en;

  const [role, setRole] = useState(null);
  const [application, setApplication] = useState(null);
  const [requestedType, setRequestedType] = useState('professional');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [profileName, setProfileName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [applicationCountry, setApplicationCountry] = useState('');
  const [applicationCity, setApplicationCity] = useState('');
  const [message, setMessage] = useState('');
  const [accessLoading, setAccessLoading] = useState(Boolean(user));
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [publicCategoryCounts, setPublicCategoryCounts] = useState({});

  const activeGroup = serviceCategoryGroups.find((group) =>
    requestedType === 'organization'
      ? group.key === 'organizations'
      : group.key === 'professionals'
  );

  useEffect(() => {
    let active = true;

    async function loadPublicCategoryCounts() {
      const { data, error } = await getPublicProfessionalProfileCategoryCounts();

      if (!active || error) {
        return;
      }

      const nextCounts = {};

      for (const row of data || []) {
        nextCounts[row.category_key] = Number(row.profile_count) || 0;
      }

      setPublicCategoryCounts(nextCounts);
    }

    loadPublicCategoryCounts();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadAccess() {
      if (!user) {
        if (active) {
          setRole(null);
          setApplication(null);
          setAccessLoading(false);
        }
        return;
      }

      setAccessLoading(true);

      const [roleResult, applicationResult] = await Promise.all([
        getMyRole(user.id),
        getMyProfessionalApplication(),
      ]);

      if (!active) {
        return;
      }

      const nextApplication = getApplicationFromResult(applicationResult.data);

      setRole(roleResult.data?.role ?? 'user');
      setApplication(nextApplication);

      if (nextApplication) {
        setRequestedType(nextApplication.requested_type ?? 'professional');
        setSelectedCategories(nextApplication.categories ?? []);
        setProfileName(nextApplication.profile_name ?? '');
        setContactPhone(nextApplication.contact_phone ?? '');
        setContactEmail(nextApplication.contact_email ?? '');
        setApplicationCountry(nextApplication.country ?? '');
        setApplicationCity(nextApplication.city ?? '');
        setMessage(nextApplication.message ?? '');
      }

      setAccessLoading(false);
    }

    loadAccess();

    return () => {
      active = false;
    };
  }, [user]);

  function selectType(type) {
    setRequestedType(type);
    setSelectedCategories([]);
    setFormError('');
  }

  function toggleCategory(key) {
    setSelectedCategories((current) =>
      current.includes(key)
        ? current.filter((value) => value !== key)
        : [...current, key]
    );
    setFormError('');
  }

  async function submitApplication() {
    const hasRequiredInfo =
      profileName.trim() &&
      contactPhone.trim() &&
      contactEmail.trim() &&
      applicationCountry.trim() &&
      applicationCity.trim() &&
      message.trim() &&
      selectedCategories.length > 0;

    if (!hasRequiredInfo) {
      setFormError(applicationLabels.requiredInfo);
      return;
    }

    setSubmitting(true);
    setFormError('');

    const result = await submitProfessionalApplication({
      requestedType,
      categories: selectedCategories,
      profileName,
      contactPhone,
      contactEmail,
      country: applicationCountry,
      city: applicationCity,
      message,
    });

    if (result.error) {
      setFormError(labels.submitFailed);
      setSubmitting(false);
      return;
    }

    const refreshed = await getMyProfessionalApplication();

    setApplication(getApplicationFromResult(refreshed.data));
    setSubmitting(false);
  }

  const applicationReady = Boolean(
    profileName.trim() &&
      contactPhone.trim() &&
      contactEmail.trim() &&
      applicationCountry.trim() &&
      applicationCity.trim() &&
      message.trim() &&
      selectedCategories.length > 0
  );

  const showApplicationArea = openApplication;

  const canApply =
    user &&
    role === 'user' &&
    (!application ||
      application.status === 'rejected' ||
      application.status === 'needs_changes');

  const accessMessage =
    role === 'admin'
      ? labels.admin
      : role === 'professional' || role === 'organization'
        ? labels.approved
        : application?.status
          ? labels[application.status]
          : null;

  return (
    <USGSectionScreen
      resetScrollOnFocus
      heroImage={require('../../assets/services-hero.png')}
      kicker={t('sections.services.kicker')}
      title={t('sections.services.title')}
      subtitle={t('sections.services.subtitle')}
      body={labels.intro}
    >
      <View style={styles.notice}>
        <Text style={styles.noticeTitle}>{labels.privateTitle}</Text>
        <Text style={styles.noticeText}>{labels.privateText}</Text>
      </View>

      {(role === 'professional' || role === 'organization') ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.getParent()?.navigate('MyProfessionalProfile')}
          style={{
            marginHorizontal: 16,
            marginTop: 12,
            marginBottom: 14,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: colors.gold,
            backgroundColor: colors.activeSurface,
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            gap: 12,
          }}
        >
          <Image
            source={require('../../assets/icons/services.png')}
            style={{ width: 36, height: 36, borderRadius: 18 }}
          />
          <Text style={{ color: colors.gold, fontSize: 14, fontWeight: '800', flex: 1 }}>
            {labels.manageProfile}
          </Text>
          <Text style={{ color: colors.gold, fontSize: 22 }}>›</Text>
        </Pressable>
      ) : null}

      {showApplicationArea ? (
        <View style={styles.accessCard}>
          <Text style={styles.accessTitle}>{labels.accessTitle}</Text>
          <Text style={styles.accessText}>
            {!user ? labels.guestText : labels.applyText}
          </Text>
  
          {accessLoading ? (
            <Text style={styles.statusText}>...</Text>
          ) : accessMessage ? (
            <View style={styles.statusBox}>
              <Text style={styles.statusLabel}>
                {labels.status}: {application?.status ?? role}
              </Text>
              <Text style={styles.statusText}>{accessMessage}</Text>
              {application?.admin_note ? (
                <Text style={styles.adminNote}>
                  {labels.adminNote}: {application.admin_note}
                </Text>
              ) : null}
            </View>
          ) : null}
  
          {canApply ? (
            <View style={styles.form}>
              <Text style={styles.fieldLabel}>{labels.type}</Text>
  
              <View style={styles.typeRow}>
                {['professional', 'organization'].map((type) => {
                  const selected = requestedType === type;
  
                  return (
                    <Pressable
                      key={type}
                      onPress={() => selectType(type)}
                      style={[
                        styles.typeButton,
                        selected && styles.typeButtonSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          selected && styles.typeButtonTextSelected,
                        ]}
                      >
                        {labels[type]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
  
              <Text style={styles.fieldLabel}>{labels.categories}</Text>
  
              <View style={styles.categorySelectList}>
                {(activeGroup?.items ?? []).map((item) => {
                  const selected = selectedCategories.includes(item.key);
  
                  return (
                    <Pressable
                      key={item.key}
                      onPress={() => toggleCategory(item.key)}
                      style={[
                        styles.selectRow,
                        selected && styles.selectRowSelected,
                      ]}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          selected && styles.checkboxSelected,
                        ]}
                      >
                        {selected ? <View style={styles.checkmarkShape} /> : null}
                      </View>
                      <Text style={styles.selectLabel}>
                        {getServiceLabel(item, language)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
  
              <Text style={styles.fieldLabel}>{applicationLabels.profileName}</Text>
              <TextInput
                value={profileName}
                onChangeText={setProfileName}
                placeholder={applicationLabels.profileName}
                placeholderTextColor={colors.textMuted}
                style={styles.applicationInput}
              />
  
              <Text style={styles.fieldLabel}>{applicationLabels.phone}</Text>
              <TextInput
                value={contactPhone}
                onChangeText={setContactPhone}
                placeholder={applicationLabels.phone}
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                style={styles.applicationInput}
              />
  
              <Text style={styles.fieldLabel}>{applicationLabels.email}</Text>
              <TextInput
                value={contactEmail}
                onChangeText={setContactEmail}
                placeholder={applicationLabels.email}
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.applicationInput}
              />
  
              <Text style={styles.fieldLabel}>{applicationLabels.country}</Text>
              <TextInput
                value={applicationCountry}
                onChangeText={setApplicationCountry}
                placeholder={applicationLabels.country}
                placeholderTextColor={colors.textMuted}
                style={styles.applicationInput}
              />
  
              <Text style={styles.fieldLabel}>{applicationLabels.city}</Text>
              <TextInput
                value={applicationCity}
                onChangeText={setApplicationCity}
                placeholder={applicationLabels.city}
                placeholderTextColor={colors.textMuted}
                style={styles.applicationInput}
              />
  
              <Text style={styles.fieldLabel}>{labels.message}</Text>
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder={labels.messagePlaceholder}
                placeholderTextColor={colors.textMuted}
                multiline
                maxLength={1000}
                style={styles.messageInput}
              />
  
              {formError ? (
                <Text style={styles.formError}>{formError}</Text>
              ) : null}
  
              <Pressable
                disabled={submitting || !applicationReady}
                onPress={submitApplication}
                style={[
                  styles.submitButton,
                  (submitting || !applicationReady) && styles.submitButtonDisabled,
                ]}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? labels.submitting : labels.submit}
                </Text>
              </Pressable>
            </View>
          ) : null}
        </View>
      ) : null}

      {!showApplicationArea ? serviceCategoryGroups.map((group) => (
        <View key={group.key} style={styles.group}>
          <Text style={styles.groupTitle}>
            {getServiceLabel(group, language)}
          </Text>

          <View style={styles.grid}>
            {group.items.map((item) => (
              <Pressable
                key={item.key}
                onPress={() =>
                  navigation.setParams({
                    categoryKey: item.key,
                    profileId: undefined,
                    openApplication: undefined,
                  })
                }
                style={({ pressed }) => [
                  styles.categoryCard,
                  pressed && styles.categoryCardPressed,
                ]}
              >
                <View style={styles.dot} />
                <Text style={styles.categoryLabel}>
                  {getServiceLabel(item, language)}
                </Text>
                <View style={styles.categoryCountBadge}>
                  <Text style={styles.categoryCountText}>
                    {publicCategoryCounts[item.key] ?? 0}
                  </Text>
                </View>
              </Pressable>
            ))}
          </View>
        </View>
      )) : null}
    </USGSectionScreen>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    notice: {
      marginTop: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.activeSurface,
      padding: spacing.md,
    },
    noticeTitle: {
      color: colors.gold,
      fontSize: 13,
      fontWeight: '800',
      textAlign: 'center',
    },
    noticeText: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 8,
    },
    accessCard: {
      marginTop: spacing.lg,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: spacing.md,
    },
    accessTitle: {
      color: colors.gold,
      fontSize: 15,
      fontWeight: '800',
      textAlign: 'center',
    },
    accessText: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 19,
      textAlign: 'center',
      marginTop: 8,
    },
    statusBox: {
      marginTop: 14,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      padding: 12,
    },
    statusLabel: {
      color: colors.goldSoft,
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
    statusText: {
      color: colors.textSoft,
      fontSize: 12,
      lineHeight: 18,
      marginTop: 6,
      textAlign: 'center',
    },
    adminNote: {
      color: colors.textMuted,
      fontSize: 11,
      lineHeight: 17,
      marginTop: 8,
    },
    form: {
      marginTop: 16,
    },
    fieldLabel: {
      color: colors.goldSoft,
      fontSize: 11,
      fontWeight: '800',
      textTransform: 'uppercase',
      marginTop: 12,
      marginBottom: 8,
    },
    typeRow: {
      flexDirection: 'row',
      gap: 8,
    },
    typeButton: {
      flex: 1,
      minHeight: 44,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: 10,
    },
    typeButtonSelected: {
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
    },
    typeButtonText: {
      color: colors.textSoft,
      fontSize: 12,
      fontWeight: '700',
      textAlign: 'center',
    },
    typeButtonTextSelected: {
      color: colors.gold,
    },
    categorySelectList: {
      gap: 7,
    },
    selectRow: {
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      paddingHorizontal: 12,
      paddingVertical: 9,
    },
    selectRowSelected: {
      borderColor: colors.goldDark,
      backgroundColor: colors.activeSurface,
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 5,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    checkboxSelected: {
      borderColor: colors.gold,
      backgroundColor: colors.gold,
    },
    checkmarkShape: {
      width: 7,
      height: 12,
      borderRightWidth: 3,
      borderBottomWidth: 3,
      borderColor: colors.background,
      transform: [{ rotate: '45deg' }, { translateY: -1 }],
    },
    selectLabel: {
      flex: 1,
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
    },
    applicationInput: {
      minHeight: 46,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      color: colors.text,
      fontSize: 13,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    messageInput: {
      minHeight: 100,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surfaceSoft,
      color: colors.text,
      fontSize: 13,
      lineHeight: 19,
      paddingHorizontal: 12,
      paddingVertical: 11,
      textAlignVertical: 'top',
    },
    formError: {
      color: colors.error ?? '#d76c6c',
      fontSize: 11,
      lineHeight: 17,
      marginTop: 10,
      textAlign: 'center',
    },
    submitButton: {
      minHeight: 46,
      marginTop: 14,
      borderRadius: radius.md,
      backgroundColor: colors.gold,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    submitButtonDisabled: {
      opacity: 0.6,
    },
    submitButtonText: {
      color: colors.background,
      fontSize: 12,
      fontWeight: '900',
      letterSpacing: 0.5,
    },
    group: {
      marginTop: spacing.lg,
    },
    groupTitle: {
      color: colors.goldSoft,
      fontSize: 13,
      fontWeight: '800',
      letterSpacing: 0.8,
      textAlign: 'center',
      textTransform: 'uppercase',
      marginBottom: 12,
    },
    grid: {
      gap: 9,
    },
    categoryCard: {
      minHeight: 48,
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      paddingHorizontal: 15,
      paddingVertical: 11,
    },
    dot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: colors.gold,
      marginRight: 12,
    },
    categoryCardPressed: {
      opacity: 0.72,
    },
    categoryCountBadge: {
      minWidth: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.gold,
      backgroundColor: colors.activeSurface,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 7,
      marginLeft: 10,
    },
    categoryCountText: {
      color: colors.gold,
      fontSize: 11,
      fontWeight: '900',
    },
    categoryLabel: {
      flex: 1,
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
  });
}
