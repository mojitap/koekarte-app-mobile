// App.js

import React, { useEffect, useState, useContext } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { enableScreens } from 'react-native-screens';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthProvider, AuthContext } from './context/AuthContext';
import { getUser, logout } from './utils/auth';
import { checkCanUsePremium } from './utils/premiumUtils';
import { API_BASE_URL } from './utils/config';

import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import TermsScreen from './screens/TermsScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import LegalScreen from './screens/LegalScreen';
import ContactScreen from './screens/ContactScreen';

import ProfileScreen from './screens/ProfileScreen';
import RecordScreen from './screens/RecordScreen';
import ChartScreen from './screens/ChartScreen';
import MusicScreen from './screens/MusicScreen';
import ScoreHistory from './screens/ScoreHistory';
import EditProfile from './screens/EditProfile';

enableScreens(false);  // react-native-screens を部分的に無効化してちらつきを防止

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      lazy={false}
      detachInactiveScreens={true}
      screenOptions={({ route }) => ({
        headerShown: false,
        unmountOnBlur: false,
        animationEnabled: false,
        sceneContainerStyle: { backgroundColor: '#fff' },
        tabBarActiveTintColor: '#007AFF',
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: 'person',
            Record: 'mic',
            Chart: 'bar-chart',
            Music: 'musical-notes',
          };
          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home"   component={ProfileScreen} options={{ title: 'マイページ' }} />
      <Tab.Screen name="Record" component={RecordScreen} options={{ title: '録音' }} />
      <Tab.Screen name="Chart"  component={ChartScreen} options={{ title: 'グラフ' }} />
      <Tab.Screen name="Music"  component={MusicScreen} options={{ title: '音源' }} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  // ── 必須ステート宣言 ──
  const [isReady, setIsReady]             = useState(false);
  const [firstLaunch, setFirstLaunch]     = useState(null);                // 初回起動チェック用
  const { showAuthStack, setShowAuthStack } = useContext(AuthContext);     // 認証スタック表示フラグ

  // ── 1) 初回起動チェック ──
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

  // ── 2) 認証＆プレミアム判定 ──
  useEffect(() => {
    if (firstLaunch === null) return;   // チェック中は待機
    if (firstLaunch) {
      // 初回起動なら Welcome 画面のみ
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
        const res = await fetch(`${API_BASE_URL}/api/profile`, { credentials: 'include' });
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

  // ── ローディング表示 ──
  if (!isReady || firstLaunch === null || showAuthStack === null) {
    return (
      <View style={{ flex:1, justifyContent:'center', alignItems:'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // ── 画面遷移の振り分け ──
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
        <>
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="EditProfile" component={EditProfile} />
          <Stack.Screen name="History" component={ScoreHistory} />
          <Stack.Screen name="Terms" component={TermsScreen} />
          <Stack.Screen name="Privacy" component={PrivacyScreen} />
          <Stack.Screen name="Legal" component={LegalScreen} />
          <Stack.Screen name="Contact" component={ContactScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
