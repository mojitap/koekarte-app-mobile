import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen.js';
import ProfileScreen from './screens/ProfileScreen.js';
import ScoreChart from './screens/ScoreChart.js';
import ScoreHistory from './screens/ScoreHistory.js';
import EditProfile from './screens/EditProfile.js';
import TermsScreen from './screens/TermsScreen.js';
import PrivacyScreen from './screens/PrivacyScreen.js';
import LegalScreen from './screens/LegalScreen.js';
import MusicScreen from './screens/MusicScreen.js';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'ホーム' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'マイページ' }} />
        <Stack.Screen name="Chart" component={ScoreChart} options={{ title: 'グラフ' }} />
        <Stack.Screen name="History" component={ScoreHistory} options={{ title: 'スコア履歴' }} />
        <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: 'プロフィール編集' }} />
        <Stack.Screen name="Terms" component={Terms} options={{ title: '利用規約' }} />
        <Stack.Screen name="Privacy" component={Privacy} options={{ title: 'プライバシーポリシー' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'ホーム' }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'マイページ' }} />
        <Stack.Screen name="Chart" component={ScoreChart} options={{ title: 'グラフ' }} />
        <Stack.Screen name="History" component={ScoreHistory} options={{ title: 'スコア履歴' }} />
        <Stack.Screen name="EditProfile" component={EditProfile} options={{ title: 'プロフィール編集' }} />
        <Stack.Screen name="Terms" component={Terms} options={{ title: '利用規約' }} />
        <Stack.Screen name="Privacy" component={Privacy} options={{ title: 'プライバシーポリシー' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
