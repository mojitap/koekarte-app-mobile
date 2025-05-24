// ChartScreen.js
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView,
  ScrollView, Platform, StatusBar, Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { checkCanUsePremium } from '../utils/premiumUtils';
import ScoreChart from './ScoreChart';

export default function ChartScreen() {
  const [canUsePremium, setCanUsePremium] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetch('http://192.168.0.27:5000/api/profile', {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          const ok = checkCanUsePremium(data.created_at, data.is_paid);
          setCanUsePremium(ok);
        })
        .catch(err => {
          console.error("❌ プロフィール取得失敗:", err);
          setCanUsePremium(false);
        });
    }, [])
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={require('../assets/koekoekarte.png')} style={styles.logo} />
        <Text style={styles.heading}>📈 ストレススコアの推移</Text>

        {canUsePremium ? (
          <ScoreChart />
        ) : (
          <Text style={styles.notice}>
            ※ グラフ機能は無料期間終了後、<Text style={{ fontWeight: 'bold' }}>有料プラン専用</Text>です。
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    alignItems: 'center',
    flexGrow: 1,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  notice: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
});
