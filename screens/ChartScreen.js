// ChartScreen.js（グラフ画面の本体）
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
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { checkCanUsePremium, getFreeDaysLeft } from '../utils/premiumUtils';
import ScoreChart from './ScoreChart';
import { getUser } from '../utils/auth';
import { API_BASE_URL } from '../utils/config';

export default function ChartScreen({ route }) {
  const navigation = useNavigation();
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

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ paddingTop: 100, alignItems: 'center' }}>
          <Text>📊 プロフィールを取得中です…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const daysLeft = profile?.created_at ? getFreeDaysLeft(profile.created_at) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
              <Text style={{ color: range === item.value ? '#fff' : '#333', fontSize: 16 }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScoreChart range={range} profile={profile} />

        <View style={{ marginTop: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 6 }}>【スコアの目安】</Text>
          {[
            ['🟢 95', '非常にリラックス'],
            ['😊 70-90', '安定しています'],
            ['😟 50-69', 'やや不安定'],
            ['🔴 〜49', 'ストレスが高いかも'],
          ].map(([label, desc]) => (
            <View key={label} style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ width: 80 }}>{label}</Text>
              <Text>{desc}</Text>
            </View>
          ))}
        </View>

        {!canUsePremium && daysLeft !== null && (
          <View style={{
            backgroundColor: daysLeft > 0 ? '#fefefe' : '#fff8f6',
            borderColor: daysLeft > 0 ? '#ccc' : '#faa',
            borderWidth: 1,
            borderRadius: 6,
            padding: 12,
            marginTop: 20,
          }}>
            {daysLeft > 0 ? (
              <Text style={{ fontSize: 14, color: '#444' }}>
                ⏰ 無料期間はあと <Text style={{ fontWeight: 'bold' }}>{daysLeft}</Text> 日で終了します。{"\n"}
                無料期間終了後は録音・分析・スコアグラフ・音源ライブラリの利用に制限がかかります。
              </Text>
            ) : (
              <>
                <Text style={{ fontSize: 14, color: '#a00', marginBottom: 10 }}>
                  ⚠️ 無料期間は終了しました。録音やグラフ機能をご利用いただくには、有料プラン（月額300円）への登録が必要です。
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Linking.openURL('https://koekarte.com/checkout');
                  }}
                  style={{
                    backgroundColor: '#ffc107',
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 5,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text style={{ fontWeight: 'bold', color: '#000' }}>
                    🎟 今すぐ有料登録する
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

        <View style={{ marginTop: 40, paddingBottom: 30, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
              <Text style={styles.linkText}>利用規約</Text>
            </TouchableOpacity>
            <Text style={styles.separator}> | </Text>

            <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
              <Text style={styles.linkText}>プライバシーポリシー</Text>
            </TouchableOpacity>
            <Text style={styles.separator}> | </Text>

            <TouchableOpacity onPress={() => navigation.navigate('Legal')}>
              <Text style={styles.linkText}>特定商取引法</Text>
            </TouchableOpacity>
            <Text style={styles.separator}> | </Text>

            <TouchableOpacity onPress={() => navigation.navigate('Contact')}>
              <Text style={styles.linkText}>お問い合わせ</Text>
            </TouchableOpacity>
          </View>
        </View>

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
    fontSize: 26,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 18,
    color: '#444',
    lineHeight: 22,
    marginBottom: 20,
  },
  linkText: {
    fontSize: 18,
    color: '#007bff',
    marginHorizontal: 2,
    textDecorationLine: 'underline',
  },
  separator: {
    fontSize: 16,
    color: '#666',
  },
});
