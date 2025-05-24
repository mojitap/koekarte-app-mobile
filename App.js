// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import RecordScreen from './screens/RecordScreen';
import ProfileScreen from './screens/ProfileScreen';
import MusicScreen from './screens/MusicScreen';
import ScoreChart from './screens/ScoreChart';
import ScoreHistory from './screens/ScoreHistory';
import EditProfile from './screens/EditProfile';
import TermsScreen from './screens/TermsScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import LegalScreen from './screens/LegalScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Record') iconName = 'mic';
          else if (route.name === 'Profile') iconName = 'person';
          else if (route.name === 'Music') iconName = 'musical-notes';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'マイページ' }} />
      <Tab.Screen name="Record" component={RecordScreen} options={{ title: '録音' }} />
      <Tab.Screen name="Music" component={MusicScreen} options={{ title: '音源' }} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Chart" component={ScoreChart} options={{ title: 'グラフ' }} />
        <Stack.Screen name="History" component={ScoreHistory} options={{ title: 'スコア履歴' }} />
        <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: 'プロフィール編集' }} />
        <Stack.Screen name="Terms" component={TermsScreen} options={{ title: '利用規約' }} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'プライバシーポリシー' }} />
        <Stack.Screen name="Legal" component={LegalScreen} options={{ title: '特定商取引法' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
