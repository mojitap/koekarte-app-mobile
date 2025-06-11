import React, { useEffect, useState, useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import ProfileScreen from './screens/ProfileScreen';
import RecordScreen from './screens/RecordScreen';
import ChartScreen from './screens/ChartScreen';
import MusicScreen from './screens/MusicScreen';
import EditProfile from './screens/EditProfile';
import TermsScreen from './screens/TermsScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import LegalScreen from './screens/LegalScreen';
import ScoreHistory from './screens/ScoreHistory';
import RegisterScreen from './screens/RegisterScreen';
import LoginScreen from './screens/LoginScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import WelcomeScreen from './screens/WelcomeScreen';

import { getUser, logout } from './utils/auth';
import { checkCanUsePremium } from './utils/premiumUtils';
import { API_BASE_URL } from './utils/config';

import { AuthProvider, AuthContext } from './context/AuthContext';
import ContactScreen from './screens/ContactScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// ── タブナビゲーション（マイページ/録音/グラフ/音源）──
function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Home: 'person',
          Record: 'mic',
          Chart: 'bar-chart',
          Music: 'musical-notes',
        };
        return <Ionicons name={icons[route.name]} size={size} color={color} />;
      },
    })}>
      <Tab.Screen name="Home" component={ProfileScreen} options={{ title: 'マイページ' }} />
      <Tab.Screen name="Record" component={RecordScreen} options={{ title: '録音' }} />
      <Tab.Screen name="Chart" component={ChartScreen} options={{ title: 'グラフ' }} />
      <Tab.Screen name="Music" component={MusicScreen} options={{ title: '音源' }} />
    </Tab.Navigator>
  );
}

// ── ログイン/登録用スタック ──
function AuthStackScreens() {
  return (
    <Stack.Navigator initialRouteName="Login" screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'ログイン' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: '新規登録' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'パスワード再設定' }} />
    </Stack.Navigator>
  );
}

// ── アプリ本体スタック ──
function AppStackScreens() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: true, title: 'プロフィール編集' }} />
      <Stack.Screen name="Terms" component={TermsScreen} options={{ headerShown: true, title: '利用規約' }} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ headerShown: true, title: 'プライバシーポリシー' }} />
      <Stack.Screen name="Legal" component={LegalScreen} options={{ headerShown: true, title: '特定商取引法に基づく表記' }} />
      <Stack.Screen name="History" component={ScoreHistory} options={{ headerShown: true, title: 'スコア履歴' }} />
      <Stack.Screen name="Contact" component={ContactScreen} options={{ headerShown: true, title: 'お問い合わせ' }} />
    </Stack.Navigator>
  );
}

// ── アプリの実体 ──
function InnerApp() {
  const [ready, setReady] = useState(false);
  const [firstLaunch, setFirstLaunch] = useState(null);
  const { showAuthStack, setShowAuthStack } = useContext(AuthContext);

  useEffect(() => {
    const checkFirstLaunch = async () => {
      const hasLaunched = await AsyncStorage.getItem('hasLaunched');
      if (hasLaunched === null) {
        await AsyncStorage.setItem('hasLaunched', 'true');
        setFirstLaunch(true);
      } else {
        setFirstLaunch(false);
      }
    };
    checkFirstLaunch();
  }, []);

  useEffect(() => {
    if (firstLaunch === null) return;

    const initialize = async () => {
      const localUser = await getUser();
      if (!localUser) {
        setShowAuthStack(true);
        setReady(true);
        return;
      }

      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, { credentials: 'include' });
        const data = await res.json();
        const ok = checkCanUsePremium(data.created_at, data.is_paid, data.is_free_extended);
        if (!ok) {
          await logout();
          setShowAuthStack(true);
        } else {
          setShowAuthStack(false);
        }
      } catch (err) {
        await logout();
        setShowAuthStack(true);
      } finally {
        setReady(true);
      }
    };

    initialize();
  }, [firstLaunch]);

  if (firstLaunch === null || !ready) return null;

  return (
    <NavigationContainer>
      {firstLaunch ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Auth" component={AuthStackScreens} />
        </Stack.Navigator>
      ) : showAuthStack ? (
        <AuthStackScreens />
      ) : (
        <AppStackScreens />
      )}
    </NavigationContainer>
  );
}

// ── 外部にエクスポート ──
export default function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  );
}
