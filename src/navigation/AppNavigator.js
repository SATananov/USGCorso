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
              style={styles.tabItem}
            >
              <Image
                source={tabIcons[route.name]}
                style={[
                  styles.tabIcon,
                  { opacity: isFocused ? 1 : 0.5 },
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
  return (
    <Tab.Navigator
      tabBar={(props) => <ScrollableTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="My Corso"
        component={MyCorsoScreen}
        options={{ tabBarLabel: 'My Corso' }}
      />
      <Tab.Screen
        name="Corso Friendly"
        component={CorsoFriendlyScreen}
        options={{ tabBarLabel: 'Corso Friendly' }}
      />
      <Tab.Screen
        name="Knowledge"
        component={KnowledgeScreen}
        options={{ tabBarLabel: 'Knowledge' }}
      />
      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{ tabBarLabel: 'Community' }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesScreen}
        options={{ tabBarLabel: 'Services' }}
      />
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{ tabBarLabel: 'Events' }}
      />
      <Tab.Screen
        name="Corso Match"
        component={CorsoMatchScreen}
        options={{ tabBarLabel: 'Corso Match' }}
      />
      <Tab.Screen
        name="About"
        component={AboutScreen}
        options={{ tabBarLabel: 'About USG' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator>
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
          headerStyle: {
            backgroundColor: '#0d0d0d',
          },
          headerTintColor: '#d4af37',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          contentStyle: {
            backgroundColor: '#0d0d0d',
          },
        }}
      />
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: '#111111',
    borderTopWidth: 1,
    borderTopColor: '#302a1d',
  },
  tabBarContent: {
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 6,
    paddingBottom: 8,
  },
  tabItem: {
    minWidth: 88,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    width: 25,
    height: 25,
    borderRadius: 13,
    marginBottom: 4,
  },
  tabLabel: {
    color: '#777777',
    fontSize: 10,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#d4af37',
  },
});
