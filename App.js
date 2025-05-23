import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import ScoreChart from './screens/ScoreChart';
import ScoreHistory from './screens/ScoreHistory';
import EditProfile from './screens/EditProfile';
import TermsScreen from './screens/TermsScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import LegalScreen from './screens/LegalScreen';
import MusicScreen from './screens/MusicScreen';

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
        <Stack.Screen name="Terms" component={TermsScreen} options={{ title: '利用規約' }} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: 'プライバシーポリシー' }} />
        <Stack.Screen name="Legal" component={LegalScreen} options={{ title: '特定商取引法' }} />
        <Stack.Screen name="Music" component={MusicScreen} options={{ title: '音源' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
