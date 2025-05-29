// ✅ ChartScreen.js（グラフ画面の全コード：期間指定＋説明文＋滑らか表現対応）

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
  Button,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { checkCanUsePremium } from '../utils/premiumUtils';
import ScoreChart from './ScoreChart';
import { getUser } from '../utils/auth';
import { useNavigation } from '@react-navigation/native';

export default function ChartScreen() {
  const navigation = useNavigation(); // ← 追加
  const [canUsePremium, setCanUsePremium] = useState(false);
  const [range, setRange] = useState('all'); // all / week / month

  useFocusEffect(
    React.useCallback(() => {
      getUser().then(user => {
        if (!user) {
          Alert.alert("ログインが必要です", "", [
            { text: "OK", onPress: () => navigation.navigate('Login') }
          ]);
          return;
        }

        fetch('http://192.168.0.12:5000/api/profile', {
          credentials: 'include',
        })
          .then(res => res.json())
          .then(data => {
            const { created_at, is_paid, is_free_extended } = data;
            const ok = checkCanUsePremium(created_at, is_paid, is_free_extended);
            setCanUsePremium(ok);
          })
          .catch((err) => {
            console.error('❌ プロフィール取得失敗:', err);
            setCanUsePremium(false);
          });
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

        <Text style={styles.description}>
          ※ スコアは「声の元気さ・活力」を数値化したものです。{"\n"}
          数値が高いほど、ストレスが少ない（調子が良い）傾向を示します。{"\n"}
          登録初期5回の平均（ベースライン）と比較することで、日々の変化がわかります。
        </Text>

        <View style={styles.rangeButtons}>
          <Button title="🗓 直近1週間" onPress={() => setRange('week')} />
          <Button title="📅 今月" onPress={() => setRange('month')} />
          <Button title="📊 すべて" onPress={() => setRange('all')} />
        </View>

        {canUsePremium ? (
          <ScoreChart range={range} smooth={true} />
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
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 13,
    color: '#444',
    lineHeight: 20,
    marginBottom: 20,
  },
  rangeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  notice: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
  },
});
