// App.js

import React, { useEffect, useState, useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { enableScreens } from 'react-native-screens';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AuthProvider, AuthContext } from './context/AuthContext';
import { getUser, logout } from './utils/auth';
import { checkCanUsePremium } from './utils/premiumUtils';
import { API_BASE_URL } from './utils/config';

// 認証・共通画面
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

// タブ画面
import ProfileScreen from './screens/ProfileScreen';
import RecordScreen from './screens/RecordScreen';
import ChartScreen from './screens/ChartScreen';
import MusicScreen from './screens/MusicScreen';

// その他ページ
import TermsScreen from './screens/TermsScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import LegalScreen from './screens/LegalScreen';
import ContactScreen from './screens/ContactScreen';
import ScoreHistory from './screens/ScoreHistory';
import EditProfile from './screens/EditProfile';

enableScreens(false);

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ─────────────────────────────
// Stack Navigator inside each Tab to retain tabs on subpages
// ─────────────────────────────
function TabWithStack({ screen }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={screen.name} component={screen.component} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} />
      <Stack.Screen name="Legal" component={LegalScreen} />
      <Stack.Screen name="Contact" component={ContactScreen} />
      <Stack.Screen name="EditProfile" component={EditProfile} />
      <Stack.Screen name="History" component={ScoreHistory} />
    </Stack.Navigator>
  );
}

// ─────────────────────────────
// Bottom Tabs Navigator
// ─────────────────────────────
function MainTabs() {
  const insets = useSafeAreaInsets();
  const tabs = [
    { name: 'Home', title: 'マイページ', component: ProfileScreen, icon: 'person' },
    { name: 'Record', title: '録音', component: RecordScreen, icon: 'mic' },
    { name: 'Chart', title: 'グラフ', component: ChartScreen, icon: 'bar-chart' },
    { name: 'Music', title: '音源', component: MusicScreen, icon: 'musical-notes' },
  ];

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        unmountOnBlur: false,
        animationEnabled: false,
        detachInactiveScreens: false,
        sceneContainerStyle: { backgroundColor: '#fff' },
        tabBarActiveTintColor: '#007AFF',
        tabBarLabelStyle: { fontSize: 14, textAlign: 'center', paddingBottom: 4 },
        tabBarStyle: {
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 6,
          paddingTop: 6,
          borderTopWidth: 0.5,
          borderTopColor: '#ccc',
        },
        tabBarItemStyle: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        tabBarIcon: ({ color }) => {
          const iconMap = {
            Home: 'person',
            Record: 'mic',
            Chart: 'bar-chart',
            Music: 'musical-notes',
          };
          return <Ionicons name={iconMap[route.name]} size={24} color={color} />;
        },
      })}
    >
      {tabs.map(tab => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.title }}
        >
          {() => <TabWithStack screen={{ name: tab.name, component: tab.component }} />}
        </Tab.Screen>
      ))}
    </Tab.Navigator>
  );
}

// ─────────────────────────────
// Root Navigator
// ─────────────────────────────
function RootNavigator() {
  const [isReady, setIsReady] = useState(false);
  const [firstLaunch, setFirstLaunch] = useState(null);
  const { showAuthStack, setShowAuthStack } = useContext(AuthContext);

  useEffect(() => {
    (async () => {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched === null) {
        await AsyncStorage.setItem('hasLaunched', 'true');
        setFirstLaunch(true);
      } else {
        setFirstLaunch(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (firstLaunch === null) return;
    if (firstLaunch) {
      setIsReady(true);
      return;
    }
    (async () => {
      const localUser = await getUser();
      if (!localUser) {
        setShowAuthStack(true);
        setIsReady(true);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, {
          credentials: 'include',
        });
        const data = await res.json();
        const ok = checkCanUsePremium(data.created_at, data.is_paid, data.is_free_extended);
        setShowAuthStack(!ok);
      } catch (err) {
        console.error(err);
        await logout();
        setShowAuthStack(true);
      } finally {
        setIsReady(true);
      }
    })();
  }, [firstLaunch]);

  if (!isReady || firstLaunch === null || showAuthStack === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={
        firstLaunch
          ? 'Welcome'
          : showAuthStack
          ? 'Login'
          : 'MainTabs'
      }
      screenOptions={{ headerShown: false }}
    >
      {firstLaunch ? (
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
      ) : showAuthStack ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="Terms" component={TermsScreen} />
          <Stack.Screen name="Privacy" component={PrivacyScreen} />
          <Stack.Screen name="Legal" component={LegalScreen} />
          <Stack.Screen name="Contact" component={ContactScreen} />
        </>
      ) : (
        <Stack.Screen name="MainTabs" component={MainTabs} />
      )}
    </Stack.Navigator>
  );
}

// ─────────────────────────────
// App
// ─────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
