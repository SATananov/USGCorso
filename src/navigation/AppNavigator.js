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
import { useLanguage } from '../i18n/LanguageContext';
import USGBackButton from '../components/USGBackButton';

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
      screenOptions={{
        headerShown: false,
      }}
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
  return (
    <Stack.Navigator
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: '#0b0b0c',
        },
        headerTintColor: '#d4af37',
        headerTitleStyle: {
          fontWeight: '700',
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: '#0b0b0c',
        },
        headerLeft: () => (
          <USGBackButton
            onPress={() => navigation.goBack()}
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
        name="Details"
        component={DetailsScreen}
        options={{
          title: 'USG Corso',
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: '#101011',
    borderTopWidth: 1,
    borderTopColor: '#332a18',
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
    backgroundColor: '#18150e',
  },
  activeLine: {
    position: 'absolute',
    top: 0,
    width: 28,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#d4af37',
  },
  tabIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    marginBottom: 3,
  },
  tabLabel: {
    color: '#777777',
    fontSize: 9,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#d4af37',
  },
});
