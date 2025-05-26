// ChartScreen.js（グラフ画面） - ロゴ中央表示＋スタイル統一

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { checkCanUsePremium } from '../utils/premiumUtils';
import ScoreChart from './ScoreChart';

export default function ChartScreen() {
  const [canUsePremium, setCanUsePremium] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetch('http://192.168.0.27:5000/api/profile', {
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((data) => {
          const ok = checkCanUsePremium(data.created_at, data.is_paid, data.is_free_extended);
          setCanUsePremium(ok);
        })
        .catch((err) => {
          console.error('❌ プロフィール取得失敗:', err);
          setCanUsePremium(false);
        });
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../assets/koekoekarte.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.heading}>📈 ストレススコアの推移</Text>
        </View>

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
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 20,
    backgroundColor: '#fff',
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 50,
    marginBottom: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  notice: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
  },
});
