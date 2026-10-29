import { useMemo } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AboutScreen from '../screens/AboutScreen';
import CommunityScreen from '../screens/CommunityScreen';
import CorsoFriendlyScreen from '../screens/CorsoFriendlyScreen';
import CorsoMatchScreen from '../screens/CorsoMatchScreen';
import DetailsScreen from '../screens/DetailsScreen';
import EventsScreen from '../screens/EventsScreen';
import HomeScreen from '../screens/HomeScreen';
import KnowledgeScreen from '../screens/KnowledgeScreen';
import MyCorsoScreen from '../screens/MyCorsoScreen';
import ServicesScreen from '../screens/ServicesScreen';
import SettingsScreen from '../screens/SettingsScreen';
import NotificationSettingsScreen from '../screens/NotificationSettingsScreen';
import PrivacySettingsScreen from '../screens/PrivacySettingsScreen';
import AccountSettingsScreen from '../screens/AccountSettingsScreen';
import LegalScreen from '../screens/LegalScreen';
import HelpSupportScreen from '../screens/HelpSupportScreen';
import { useLanguage } from '../i18n/LanguageContext';
import USGBackButton from '../components/USGBackButton';
import USGGlobalHeader from '../components/USGGlobalHeader';
import { useTheme } from '../theme/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

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
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <View style={styles.tabBarContainer}>
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

function MainTabs() {
  const { t } = useLanguage();

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
      <Tab.Screen name="My Corso" component={MyCorsoScreen} options={{ tabBarLabel: t('nav.myCorso') }} />
      <Tab.Screen name="Corso Friendly" component={CorsoFriendlyScreen} options={{ tabBarLabel: t('nav.corsoFriendly') }} />
      <Tab.Screen name="Knowledge" component={KnowledgeScreen} options={{ tabBarLabel: t('nav.knowledge') }} />
      <Tab.Screen name="Community" component={CommunityScreen} options={{ tabBarLabel: t('nav.community') }} />
      <Tab.Screen name="Services" component={ServicesScreen} options={{ tabBarLabel: t('nav.services') }} />
      <Tab.Screen name="Events" component={EventsScreen} options={{ tabBarLabel: t('nav.events') }} />
      <Tab.Screen name="Corso Match" component={CorsoMatchScreen} options={{ tabBarLabel: t('nav.corsoMatch') }} />
      <Tab.Screen name="About" component={AboutScreen} options={{ tabBarLabel: t('nav.about') }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
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
      })}
    >
      <Stack.Screen
        name="Main"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Details"
        component={DetailsScreen}
        options={{ title: 'USG Corso' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t('settings.title') }}
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
        component={AccountSettingsScreen}
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


