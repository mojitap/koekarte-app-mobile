// screens/ChartScreen.js
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Linking,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';

import { API_BASE_URL } from '../utils/config';
import { getFreeDaysLeft } from '../utils/premiumUtils';

/* ────────────────────
   ① グラフだけを描く小コンポーネント
   ──────────────────── */
function ScoreChart({ range = 'all', smooth = true, profile }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/scores?range=${range}`, {
          credentials: 'include',
        });
        const { scores = [] } = await res.json();
        const raw = scores.filter(v => Number.isFinite(v.score));
        if (!raw.length || ignore) return setChartData(null);

        // 並び替え・期間フィルタ
        const sorted = raw.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
        let data = [...sorted];
        const now = new Date();
        if (range === 'week') {
          const wk = new Date(); wk.setDate(now.getDate() - 7);
          data = sorted.filter(v => new Date(v.date) >= wk);
        } else if (range === 'month') {
          const mo = new Date(now.getFullYear(), now.getMonth(), 1);
          data = sorted.filter(v => new Date(v.date) >= mo);
        } else if (range === 'past') {
          const mo = new Date(now.getFullYear(), now.getMonth(), 1);
          data = sorted.filter(v => new Date(v.date) < mo);
        }

        // ラベル・系列
        const labels = data.map(v => {
          const d = new Date(v.date);
          return `${d.getMonth() + 1}/${d.getDate()}`;
        });
        const mainSeries = data.map(v => v.score);
        const baseline = sorted.length >= 5
          ? Math.round(sorted.slice(0, 5).reduce((s, v) => s + v.score, 0) / 5)
          : null;
        const baseSeries = baseline ? data.map(() => baseline) : null;

        const datasets = [
          { data: mainSeries, strokeWidth: 2, color: () => 'rgba(75,192,192,1)' },
        ];
        const legendArr = ['ストレススコア'];

        if (baseSeries) {
          datasets.push({
            data: baseSeries, strokeWidth: 1,
            color: () => 'rgba(255,99,132,0.7)', withDots: false,
          });
          legendArr.push('ベースライン');
        }

        setChartData({ labels, datasets, legend: legendArr });
      } catch (err) {
        console.error('❌ ScoreChart fetch error:', err);
        setChartData(null);
      }
    })();
    return () => { ignore = true; };
  }, [range]);

  if (!chartData) {
    return <Text style={{ textAlign: 'center', marginTop: 20 }}>📉 データがありません</Text>;
  }

  return (
    <LineChart
      data={chartData}
      width={Dimensions.get('window').width - 40}
      height={240}
      fromZero bezier={smooth} segments={5}
      yAxisSuffix="点"
      chartConfig={{
        backgroundGradientFrom: '#fff', backgroundGradientTo: '#fff',
        decimalPlaces: 0,
        color: o => `rgba(0,0,0,${o})`,
        labelColor: o => `rgba(0,0,0,${o})`,
        propsForDots: { r: '3', strokeWidth: '1', stroke: '#555' },
        propsForLabels: { rotation: '-30', fontSize: 10 },
      }}
      style={{ marginVertical: 8, borderRadius: 8 }}
    />
  );
}

/* ────────────────────
   ② 本画面コンポーネント
   ──────────────────── */
export default function ChartScreen() {
  const [profile, setProfile] = useState(null);
  const navigation = useNavigation();

  /* プロフィール取得（無料期間判定に使用） */
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/profile`, { credentials: 'include' });
        setProfile(await res.json());
      } catch (e) {
        console.error('ChartScreen profile fetch error:', e);
      }
    })();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 80 }}
      >
        {/* ヘッダ */}
        <Text style={styles.heading}>📊 スコアグラフ</Text>

        {/* グラフ本体 */}
        <ScoreChart range="all" smooth profile={profile} />

        {/* スコア目安の凡例（ScoreChart 内に書いても可） */}
        <View style={{ marginTop: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 6 }}>【スコアの目安】</Text>
          {[
            ['🟢 95',        '非常にリラックス'],
            ['😊 70-90',    '安定しています'],
            ['😟 50-69',    'やや不安定'],
            ['🔴 〜49',     'ストレスが高いかも'],
          ].map(([label, desc]) => (
            <View key={label} style={{ flexDirection: 'row', marginBottom: 4 }}>
              <Text style={{ width: 80 }}>{label}</Text>
              <Text>{desc}</Text>
            </View>
          ))}
        </View>

        {profile && !profile.is_paid && profile.created_at && (
          <View style={{
            backgroundColor: getFreeDaysLeft(profile.created_at) > 0 ? '#fefefe' : '#fff8f6',
            borderColor: getFreeDaysLeft(profile.created_at) > 0 ? '#ccc' : '#faa',
            borderWidth: 1,
            borderRadius: 6,
            padding: 12,
            marginBottom: 20,
          }}>
            {getFreeDaysLeft(profile.created_at) > 0 ? (
              <Text style={{ fontSize: 14, color: '#444' }}>
                ⏰ 無料期間はあと <Text style={{ fontWeight: 'bold' }}>{getFreeDaysLeft(profile.created_at)}</Text> 日で終了します。{"\n"}
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


        {/* 利用規約などのリンク */}
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

/* ────────────────────
   スタイル
   ──────────────────── */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  heading: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginVertical: 20 },
  noticeBox: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  subscribeBtn: {
    backgroundColor: '#ffc107',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 40,
  },
  link: {
    fontSize: 16,
    color: '#007bff',
    textDecorationLine: 'underline',
    marginHorizontal: 6,
    paddingVertical: 6,
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
