import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'react-native'; // 👈 追加

import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import MusicScreen from './screens/MusicScreen';
import TermsScreen from './screens/TermsScreen';
import PrivacyScreen from './screens/PrivacyScreen';
import LegalScreen from './screens/LegalScreen';
import EditProfile from './screens/EditProfile';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerTitle: () => (
              <Image
                source={require('./assets/koekoekarte.png')}
                style={{ width: 120, height: 40, resizeMode: 'contain' }}
              />
            ),
            headerStyle: {
              backgroundColor: '#ffffff',
            },
          }}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Music" component={MusicScreen} />
        <Stack.Screen name="Terms" component={TermsScreen} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} />
        <Stack.Screen name="Legal" component={LegalScreen} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
