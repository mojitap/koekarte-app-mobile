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

        <View style={styles.explanationBox}>
          <Text style={styles.explanationText}>
            ※ スコアは「声の元気さ・活力」を数値化したものです。{"\n"}
            数値が高いほど、ストレスが少ない（調子が良い）傾向を示します。{"\n"}
            登録初期5回の平均（ベースライン）と比較することで、日々の変化がわかります。
          </Text>

          {!canUsePremium && (
            <Text style={styles.warningBox}>
              ⚠️ 無料期間は終了しました。録音・分析・グラフの閲覧をご希望の場合は、有料プラン（月額300円）へのご登録をお願いいたします。
            </Text>
          )}
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
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
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
  explanationBox: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  explanationText: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
  },
  warningBox: {
    fontSize: 13,
    color: '#a00',
    marginTop: 10,
    backgroundColor: '#fff0f0',
    padding: 10,
    borderRadius: 6,
  },
});
