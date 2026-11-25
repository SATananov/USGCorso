import { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '../auth/AuthContext';
import { getMyRole } from '../admin/adminService';
import { useAppControls } from '../app/AppControlContext';
import USGProgressBar from '../components/USGProgressBar';
import GuestSectionPreview from '../components/GuestSectionPreview';
import AboutScreen from '../screens/AboutScreen';
import AdminScreen from '../screens/AdminScreen';
import AdminServicesScreen from '../screens/AdminServicesScreen';
import AdminInboxScreen from '../screens/AdminInboxScreen';
import AdminPlaceDetailsScreen from '../screens/AdminPlaceDetailsScreen';
import AdminContentDetailsScreen from '../screens/AdminContentDetailsScreen';
import AdminDogDetailsScreen from '../screens/AdminDogDetailsScreen';
import CommunityScreen from '../screens/CommunityScreen';
import CommunityQuestionsScreen from '../screens/CommunityQuestionsScreen';
import CommunityNewQuestionScreen from '../screens/CommunityNewQuestionScreen';
import CorsoFriendlyScreen from '../screens/CorsoFriendlyScreen';
import CorsoMatchScreen from '../screens/CorsoMatchScreen';
import DetailsScreen from '../screens/DetailsScreen';
import EventsScreen from '../screens/EventsScreen';
import HomeScreen from '../screens/HomeScreen';
import KnowledgeScreen from '../screens/KnowledgeScreen';
import KnowledgePublicDetailsScreen from '../screens/KnowledgePublicDetailsScreen';
import MyCorsoScreen from '../screens/MyCorsoScreen';
import MyCorsoGrowthScreen from '../screens/MyCorsoGrowthScreen';
import MyCorsoCareScreen from '../screens/MyCorsoCareScreen';
import MyCorsoDiaryScreen from '../screens/MyCorsoDiaryScreen';
import CorsoCareRemindersScreen from '../screens/CorsoCareRemindersScreen';
import MyCorsoBehaviorScreen from '../screens/MyCorsoBehaviorScreen';
import MyCorsoChallengesScreen from '../screens/MyCorsoChallengesScreen';
import ArenaRankingPreviewScreen from '../screens/ArenaRankingPreviewScreen';
import MyCorsoWalkTrackerScreen from '../screens/MyCorsoWalkTrackerScreen';
import PlaceDetailsScreen from '../screens/PlaceDetailsScreen';
import ServicesScreen from '../screens/ServicesScreen';
import MyProfessionalProfileScreen from '../screens/MyProfessionalProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import MyMaterialsScreen from '../screens/MyMaterialsScreen';
import MyMaterialDetailsScreen from '../screens/MyMaterialDetailsScreen';
import AddMaterialScreen from '../screens/AddMaterialScreen';
import OcrTestLabScreen from '../screens/OcrTestLabScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import LegalScreen from '../screens/LegalScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import { useLanguage } from '../i18n/LanguageContext';
import USGBackButton from '../components/USGBackButton';
import USGHomeButton from '../components/USGHomeButton';
import USGGlobalHeader from '../components/USGGlobalHeader';
import { useTheme } from '../theme/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

export const MAIN_TAB_ROUTES = [
  'Home', 'My Corso', 'Corso Friendly', 'Knowledge', 'Community',
  'Services', 'Events', 'Corso Match', 'About',
];

export function getMainTabBarHeight(bottomInset) {
  return 57 + Math.max(bottomInset, 8);
}

const tabIcons = {
  Home: require('../../assets/icons/about-usg.png'),
  'My Corso': require('../../assets/icons/my-corso.png'),
  'Corso Friendly': require('../../assets/icons/corso-friendly.png'),
  Knowledge: require('../../assets/icons/knowledge.png'),
  Community: require('../../assets/icons/community.png'),
  Services: require('../../assets/icons/services.png'),
  Events: require('../../assets/icons/events.png'),
  'Corso Match': require('../../assets/icons/corso-match.png'),
  About: require('../../assets/icons/about-usg.png'),
};

function ScrollableTabBar({ state, descriptors, navigation }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View
      style={[
        styles.tabBarContainer,
        { paddingBottom: Math.max(insets.bottom, 8) },
      ]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBarContent}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;
          const options = descriptors[route.key].options;
          const label = options.tabBarLabel || route.name;

          function onPress() {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={[
                styles.tabItem,
                isFocused && styles.tabItemActive,
              ]}
            >
              {isFocused && <View style={styles.activeLine} />}

              <Image
                source={tabIcons[route.name]}
                style={[
                  styles.tabIcon,
                  { opacity: isFocused ? 1 : 0.48 },
                ]}
              />

              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  isFocused && styles.tabLabelActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function createGuestTabScreen(sectionKey) {
  return function GuestTabScreen({ navigation }) {
    return (
      <GuestSectionPreview
        sectionKey={sectionKey}
        navigation={navigation}
      />
    );
  };
}

const GuestMyCorsoScreen = createGuestTabScreen('myCorso');
const GuestCorsoFriendlyScreen = createGuestTabScreen('corsoFriendly');
const GuestCommunityScreen = createGuestTabScreen('community');
const GuestServicesScreen = createGuestTabScreen('services');
const GuestEventsScreen = createGuestTabScreen('events');
const GuestCorsoMatchScreen = createGuestTabScreen('corsoMatch');
const GuestAboutScreen = createGuestTabScreen('about');

function MainTabs({ route }) {
  const { t } = useLanguage();
  const { session } = useAuth();

  return (
    <Tab.Navigator
      tabBar={(props) => <ScrollableTabBar {...props} />}
      screenOptions={({ navigation, route }) => ({
        headerShown: true,
        header: () => (
          <USGGlobalHeader
            navigation={navigation}
            route={route}
            title={t(`nav.${route.name === 'My Corso'
              ? 'myCorso'
              : route.name === 'Corso Friendly'
                ? 'corsoFriendly'
                : route.name === 'Corso Match'
                  ? 'corsoMatch'
                  : route.name.toLowerCase()}`)}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('nav.home') }} />
      <Tab.Screen name="My Corso" component={session ? MyCorsoScreen : GuestMyCorsoScreen} options={{ tabBarLabel: t('nav.myCorso') }} />
      <Tab.Screen name="Corso Friendly" component={session ? CorsoFriendlyScreen : GuestCorsoFriendlyScreen} options={{ tabBarLabel: t('nav.corsoFriendly') }} />
      <Tab.Screen name="Knowledge" component={KnowledgeScreen} options={{ tabBarLabel: t('nav.knowledge') }} />
      <Tab.Screen name="Community" component={session ? CommunityScreen : GuestCommunityScreen} options={{ tabBarLabel: t('nav.community') }} />
      <Tab.Screen name="Services" component={session ? ServicesScreen : GuestServicesScreen} options={{ tabBarLabel: t('nav.services') }} />
      <Tab.Screen name="Events" component={session ? EventsScreen : GuestEventsScreen} options={{ tabBarLabel: t('nav.events') }} />
      <Tab.Screen name="Corso Match" component={session ? CorsoMatchScreen : GuestCorsoMatchScreen} options={{ tabBarLabel: t('nav.corsoMatch') }} />
      <Tab.Screen name="About" component={session ? AboutScreen : GuestAboutScreen} options={{ tabBarLabel: t('nav.about') }} />
    </Tab.Navigator>
  );
}

const accessCopy = {
  bg: { signIn: 'Необходим е вход в акаунта.', signInAction: 'ВХОД', denied: 'Нямате административен достъп.', failed: 'Ролята не можа да бъде проверена.', checking: 'Проверка на достъпа', retry: 'ОПИТАЙ ОТНОВО', home: 'НАЧАЛО' },
  en: { signIn: 'Please sign in to access this area.', signInAction: 'SIGN IN', denied: 'Administrator access is required.', failed: 'Your role could not be verified.', checking: 'Checking access', retry: 'TRY AGAIN', home: 'HOME' },
  it: { signIn: 'Accedi per entrare in questa sezione.', signInAction: 'ACCEDI', denied: 'È richiesto l’accesso amministrativo.', failed: 'Impossibile verificare il ruolo.', checking: 'Verifica accesso', retry: 'RIPROVA', home: 'HOME' },
};

function AccessScreen({ navigation, reason, onRetry }) {
  const { language } = useLanguage();
  const { colors } = useTheme();
  const { leaveGuestMode } = useAppControls();
  const labels = accessCopy[language] ?? accessCopy.en;
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.accessContainer}>
      {reason === 'checking' ? <USGProgressBar label={labels.checking} /> : (
        <>
          <Text style={styles.accessText}>{labels[reason]}</Text>
          {reason === 'signIn' || reason === 'failed' ? (
            <Pressable accessibilityRole="button" style={styles.accessButton} onPress={reason === 'signIn' ? leaveGuestMode : onRetry}>
              <Text style={styles.accessButtonText}>{reason === 'signIn' ? labels.signInAction : labels.retry}</Text>
            </Pressable>
          ) : null}
          <Pressable accessibilityRole="button" style={styles.accessButton} onPress={() => navigation.navigate('Main', { screen: 'Home' })}>
            <Text style={styles.accessButtonText}>{labels.home}</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

function AdminAccess({ Screen, screenProps, userId }) {
  const [status, setStatus] = useState('checking');
  const [attempt, setAttempt] = useState(0);

  useFocusEffect(useCallback(() => {
    let active = true;
    setStatus('checking');
    async function verifyRole() {
      try {
        const { data, error } = await getMyRole(userId);
        if (active) setStatus(error ? 'failed' : data?.role === 'admin' ? 'allowed' : 'denied');
      } catch {
        if (active) setStatus('failed');
      }
    }
    verifyRole();
    return () => { active = false; };
  }, [userId, attempt]));

  if (status !== 'allowed') {
    return <AccessScreen navigation={screenProps.navigation} reason={status} onRetry={() => setAttempt(value => value + 1)} />;
  }

  return <Screen {...screenProps} />;
}

function protectScreen(Screen, admin = false) {
  return function ProtectedScreen(props) {
    const { session, loading } = useAuth();
    const userId = session?.user?.id;
    if (loading) return <AccessScreen navigation={props.navigation} reason="checking" />;
    if (!userId || !session?.access_token) return <AccessScreen navigation={props.navigation} reason="signIn" />;
    if (admin) return <AdminAccess key={userId} Screen={Screen} screenProps={props} userId={userId} />;
    return <Screen key={userId} {...props} />;
  };
}

const ProtectedCommunityNewQuestionScreen = protectScreen(CommunityNewQuestionScreen);
const ProtectedMyCorsoGrowthScreen = protectScreen(MyCorsoGrowthScreen);
const ProtectedMyCorsoCareScreen = protectScreen(MyCorsoCareScreen);
const ProtectedMyCorsoQuickAddScreen = protectScreen(MyCorsoScreen);
const ProtectedMyCorsoDiaryScreen = protectScreen(MyCorsoDiaryScreen);
const ProtectedCorsoCareRemindersScreen = protectScreen(CorsoCareRemindersScreen);
const ProtectedMyCorsoBehaviorScreen = protectScreen(MyCorsoBehaviorScreen);
const ProtectedMyCorsoChallengesScreen = protectScreen(MyCorsoChallengesScreen);
const ProtectedArenaRankingPreviewScreen = protectScreen(ArenaRankingPreviewScreen);
const ProtectedMyCorsoWalkTrackerScreen = protectScreen(MyCorsoWalkTrackerScreen);
const ProtectedMyProfessionalProfileScreen = protectScreen(MyProfessionalProfileScreen);
const ProtectedMyMaterialsScreen = protectScreen(MyMaterialsScreen);
const ProtectedMyMaterialDetailsScreen = protectScreen(MyMaterialDetailsScreen);
const ProtectedOcrTestLabScreen = protectScreen(OcrTestLabScreen);
const ProtectedAddMaterialScreen = protectScreen(AddMaterialScreen);
const ProtectedNotificationsScreen = protectScreen(NotificationsScreen);
const ProtectedAccountSettingsScreen = protectScreen(AccountSettingsScreen);
const ProtectedAdminScreen = protectScreen(AdminScreen, true);
const ProtectedAdminServicesScreen = protectScreen(AdminServicesScreen, true);
const ProtectedAdminInboxScreen = protectScreen(AdminInboxScreen, true);
const ProtectedAdminPlaceDetailsScreen = protectScreen(AdminPlaceDetailsScreen, true);
const ProtectedAdminContentDetailsScreen = protectScreen(AdminContentDetailsScreen, true);
const ProtectedAdminDogDetailsScreen = protectScreen(AdminDogDetailsScreen, true);

export default function AppNavigator({ initialTab = 'Home' }) {
  const { t } = useLanguage();
  const { colors } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.gold,
        headerTitleStyle: {
          color: colors.text,
          fontWeight: '700',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
        headerLeft: () => (
          <USGBackButton onPress={() => navigation.goBack()} />
        ),
        headerRight: () => (
          <USGHomeButton
            label={t('nav.home')}
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          />
        ),
      })}
    >
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CommunityNewQuestion"
        component={ProtectedCommunityNewQuestionScreen}
        options={{ title: t('nav.community') }}
      />
      <Stack.Screen
        name="CommunityQuestions"
        component={CommunityQuestionsScreen}
        options={{ title: t('nav.community') }}
      />
      <Stack.Screen
        name="MyCorsoGrowth"
        component={ProtectedMyCorsoGrowthScreen}
        options={{ title: t('nav.myCorso') }}
      />
      <Stack.Screen
        name="MyCorsoCare"
        component={ProtectedMyCorsoCareScreen}
        options={{ title: t('nav.myCorso') }}
      />
      <Stack.Screen
        name="MyCorsoQuickAdd"
        component={ProtectedMyCorsoQuickAddScreen}
        options={{ title: t('nav.myCorso') }}
      />
      <Stack.Screen
        name="MyCorsoDiary"
        component={ProtectedMyCorsoDiaryScreen}
        options={{ title: t('nav.myCorso') }}
      />
      <Stack.Screen
        name="CorsoCareReminders"
        component={ProtectedCorsoCareRemindersScreen}
        options={{ title: t('nav.myCorso') }}
      />
      <Stack.Screen
        name="MyCorsoBehavior"
        component={ProtectedMyCorsoBehaviorScreen}
        options={{ title: t('nav.myCorso') }}
      />
      <Stack.Screen
        name="MyCorsoChallenges"
        component={ProtectedMyCorsoChallengesScreen}
        options={{ title: t('nav.myCorso') }}
      />
      <Stack.Screen
        name="ArenaRankingPreview"
        component={ProtectedArenaRankingPreviewScreen}
        options={{ title: 'USG ARENA' }}
      />
      <Stack.Screen
        name="MyCorsoWalkTracker"
        component={ProtectedMyCorsoWalkTrackerScreen}
        options={{ title: t('nav.myCorso') }}
      />
      <Stack.Screen
        name="MyProfessionalProfile"
        component={ProtectedMyProfessionalProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="KnowledgePublicDetails"
        component={KnowledgePublicDetailsScreen}
        options={{ title: t('nav.knowledge') }}
      />

      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{ title: t('nav.details') }}
      />
      <Stack.Screen
        name="PlaceDetails"
        component={PlaceDetailsScreen}
        options={{ title: t('nav.placeDetails') }}
      />
      <Stack.Screen
        name="Admin"
        component={ProtectedAdminScreen}
        options={{ title: t('nav.admin') }}
      />
      <Stack.Screen
        name="AdminServices"
        component={ProtectedAdminServicesScreen}
        options={{ title: t('nav.adminServices') }}
      />
      <Stack.Screen
        name="AdminInbox"
        component={ProtectedAdminInboxScreen}
        options={{ title: t('nav.adminInbox') }}
      />
      <Stack.Screen
        name="AdminPlaceDetails"
        component={ProtectedAdminPlaceDetailsScreen}
        options={{ title: t('nav.admin') }}
      />
      <Stack.Screen
        name="AdminContentDetails"
        component={ProtectedAdminContentDetailsScreen}
        options={{ title: t('nav.admin') }}
      />
      <Stack.Screen
        name="AdminDogDetails"
        component={ProtectedAdminDogDetailsScreen}
        options={{ title: t('nav.admin') }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t('settings.title') }}
      />
      <Stack.Screen
        name="MyMaterials"
        component={ProtectedMyMaterialsScreen}
        options={{ title: t('myMaterials.title') }}
      />
      <Stack.Screen
        name="MyMaterialDetails"
        component={ProtectedMyMaterialDetailsScreen}
        options={{ title: t('myMaterials.detailsTitle') }}
      />
      <Stack.Screen
        name="OcrTestLab"
        component={ProtectedOcrTestLabScreen}
        options={{ title: "OCR Test Lab" }}
      />
      <Stack.Screen
        name="AddMaterial"
        component={ProtectedAddMaterialScreen}
        options={{ title: t('addMaterial.title') }}
      />
      <Stack.Screen
        name="Notifications"
        component={ProtectedNotificationsScreen}
        options={{ title: t('settings.notificationsCenter') }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ title: t('settings.notifications') }}
      />
      <Stack.Screen
        name="PrivacySettings"
        component={PrivacySettingsScreen}
        options={{ title: t('settings.privacy') }}
      />
      <Stack.Screen
        name="AccountSettings"
        component={ProtectedAccountSettingsScreen}
        options={{ title: t('settings.account') }}
      />
      <Stack.Screen
        name="Legal"
        component={LegalScreen}
        options={{ title: t('settings.legal') }}
      />
      <Stack.Screen
        name="HelpSupport"
        component={HelpSupportScreen}
        options={{ title: t('settings.help') }}
      />
    </Stack.Navigator>
  );
}

function createStyles(colors) {
  return StyleSheet.create({
    accessContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      gap: 16,
      backgroundColor: colors.background,
    },
    accessText: {
      color: colors.text,
      textAlign: 'center',
      fontSize: 16,
    },
    accessButton: {
      borderWidth: 1,
      borderColor: colors.gold,
      borderRadius: 10,
      paddingHorizontal: 20,
      paddingVertical: 12,
    },
    accessButtonText: {
      color: colors.gold,
      fontWeight: '700',
    },
    tabBarContainer: {
      backgroundColor: colors.tabBackground,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    tabBarContent: {
      alignItems: 'center',
      paddingHorizontal: 6,
      paddingTop: 4,
      paddingBottom: 6,
    },
    tabItem: {
      minWidth: 74,
      minHeight: 46,
      paddingHorizontal: 8,
      paddingTop: 4,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 10,
    },
    tabItemActive: {
      backgroundColor: colors.activeSurface,
    },
    activeLine: {
      position: 'absolute',
      top: 0,
      width: 28,
      height: 2,
      borderRadius: 1,
      backgroundColor: colors.gold,
    },
    tabIcon: {
      width: 22,
      height: 22,
      borderRadius: 11,
      marginBottom: 3,
    },
    tabLabel: {
      color: colors.textMuted,
      fontSize: 9,
      fontWeight: '600',
    },
    tabLabelActive: {
      color: colors.gold,
    },
  });
}
