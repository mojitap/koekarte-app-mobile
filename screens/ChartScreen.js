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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { checkCanUsePremium, getFreeDaysLeft } from '../utils/premiumUtils';
import ScoreChart from './ScoreChart';
import { getUser } from '../utils/auth';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../utils/config';  // ← パスが screens フォルダ内なら ../ が必要
import { TouchableOpacity } from 'react-native';

export default function ChartScreen({ route }) {
  const navigation = useNavigation(); // ← 追加
  const [canUsePremium, setCanUsePremium] = useState(false);
  const [range, setRange] = useState('all');
  const [profile, setProfile] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      getUser().then(user => {
        if (!user) {
          Alert.alert("ログインが必要です", "", [
            { text: "OK", onPress: () => navigation.navigate('Login') }
          ]);
          return;
        }

        fetch(`${API_BASE_URL}/api/profile`, {
          credentials: 'include',
        })
          .then(res => res.json())
          .then(data => {
            const { created_at, is_paid, is_free_extended } = data;
            const ok = checkCanUsePremium(created_at, is_paid, is_free_extended);
            setCanUsePremium(ok);
            setProfile(data);
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

        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
          {[
            { label: 'すべて', value: 'all' },
            { label: '先月以前', value: 'past' },
            { label: '今月', value: 'month' },
            { label: '直近1週間', value: 'week' },
          ].map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => setRange(item.value)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: range === item.value ? '#007AFF' : '#eee',
              }}
            >
              <Text style={{ color: range === item.value ? '#fff' : '#333' }}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 16 }} />

        {/* 📣 無料期間の案内表示（グラフの上） */}
        {profile && !profile.is_paid && profile.created_at && (
          <View style={styles.noticeBox}>
            {getFreeDaysLeft(profile.created_at) > 0 ? (
              <Text style={styles.noticeText}>
                ⏰ 無料期間はあと <Text style={{ fontWeight: 'bold' }}>{getFreeDaysLeft(profile.created_at)}</Text> 日で終了します。{"\n"}
                無料期間終了後はグラフ機能をご利用いただけません。
              </Text>
            ) : (
              <Text style={[styles.noticeText, { color: '#a00' }]}>
                ⚠️ 無料期間は終了しました。グラフ機能をご利用いただくには、有料プラン（月額300円）への登録が必要です。
              </Text>
            )}
          </View>
        )}

        {canUsePremium && (
          <>
            <Text style={{ textAlign: 'center', marginTop: 20 }}>✅ Premium OK</Text>
            <ScoreChart
              key={route?.params?.refresh ?? 'static'}
              range={range}
              smooth={true}
            />
          </>
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
    marginBottom: 20,
  },
  notice: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
  noticeBox: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff8f6',
    marginBottom: 20,
  },
  noticeText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
});
