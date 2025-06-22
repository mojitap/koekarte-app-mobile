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

// これを追加！
export default ScoreChart;

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
});
