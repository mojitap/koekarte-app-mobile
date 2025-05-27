// App.js
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { getUser } from './utils/auth'; // ✅ 追加

import ProfileScreen from './screens/ProfileScreen';
import RecordScreen from './screens/RecordScreen';
import ChartScreen from './screens/ChartScreen';
import MusicScreen from './screens/MusicScreen';
import EditProfile from './screens/EditProfile';
import TermsScreen from './screens/TermsScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import LegalScreen from './screens/LegalScreen';
import ScoreHistory from './screens/ScoreHistory';
import RegisterScreen from './screens/RegisterScreen'; // ✅ 追加
import ForgotPasswordScreen from './screens/ForgotPasswordScreen'; // ← 上部に追加
import LoginScreen from './screens/LoginScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'person';
          else if (route.name === 'Record') iconName = 'mic';
          else if (route.name === 'Chart') iconName = 'bar-chart';
          else if (route.name === 'Music') iconName = 'musical-notes';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={ProfileScreen} options={{ title: 'マイページ' }} />
      <Tab.Screen name="Record" component={RecordScreen} options={{ title: '録音' }} />
      <Tab.Screen name="Chart" component={ChartScreen} options={{ title: 'グラフ' }} />
      <Tab.Screen name="Music" component={MusicScreen} options={{ title: '音源' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    getUser().then(user => {
      console.log('📦 ローカル保存されたユーザー:', user);
      setInitialRoute(user ? 'Main' : 'Register');
    });
  }, []);

  if (!initialRoute) return null; // ローディング中

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: 'プロフィール編集' }} />
        <Stack.Screen name="Terms" component={TermsScreen} options={{ title: '利用規約' }} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'プライバシーポリシー' }} />
        <Stack.Screen name="Legal" component={LegalScreen} options={{ title: '特定商取引法に基づく表記' }} />
        <Stack.Screen name="History" component={ScoreHistory} options={{ title: 'スコア履歴' }} />
        <Stack.Screen name="Register" component={RegisterScreen} options={{ title: '新規登録' }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'パスワード再設定' }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'ログイン' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
