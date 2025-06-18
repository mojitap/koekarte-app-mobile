import React, { useEffect, useState } from 'react';
import { View, Dimensions, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { API_BASE_URL } from '../utils/config';
import { getFreeDaysLeft } from '../utils/premiumUtils';

export default function ScoreChart({ range = 'all', smooth = true, profile }) {
  const [chartData, setChartData] = useState(null);

  const toDate = ts => {
    const d = new Date(ts.replace(' ', 'T'));
    return isNaN(d) ? null : d;
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/scores?range=${range}`, {
          credentials: 'include'
        });
        const { scores = [] } = await res.json();

        const raw = scores.filter(v => Number.isFinite(v.score));

        if (!raw.length || ignore) {
          setChartData(null);
          return;
        }

        const sorted = raw.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
        let data = [...sorted];

        const now = new Date();
        if (range === 'week') {
          const wk = new Date();
          wk.setDate(now.getDate() - 7);
          data = sorted.filter(v => new Date(v.date) >= wk);
        } else if (range === 'month') {
          const mo = new Date(now.getFullYear(), now.getMonth(), 1);
          data = sorted.filter(v => new Date(v.date) >= mo);
        } else if (range === 'past') {
          const mo = new Date(now.getFullYear(), now.getMonth(), 1);
          data = sorted.filter(v => new Date(v.date) < mo);
        }

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
          { data: mainSeries, strokeWidth: 2, color: () => 'rgba(75,192,192,1)' }
        ];
        const legendArr = ['ストレススコア'];

        if (baseSeries) {
          datasets.push({
            data: baseSeries, strokeWidth: 1,
            color: () => 'rgba(255,99,132,0.7)', withDots: false
          });
          legendArr.push('ベースライン');
        }

        setChartData({ labels, datasets, legend: legendArr });
      } catch (err) {
        console.error("❌ ScoreChart fetch error:", err);
        setChartData(null);
      }
    })();
  return () => { ignore = true; };
}, [range]);

  if (!chartData) {
    return <Text style={{ textAlign:'center', marginTop:20 }}>📉 データがありません</Text>;
  }

return (
  <View style={{ paddingBottom: 40 }}>
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

    {/* 凡例 */}
    <View style={{ marginTop: 16, paddingHorizontal: 20 }}>
      <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 6 }}>【スコアの目安】</Text>
      {[
        { emoji: '🟢', label: '95', desc: '非常にリラックス' },
        { emoji: '😊', label: '70-90', desc: '安定しています' },
        { emoji: '😟', label: '50-69', desc: 'やや不安定' },
        { emoji: '🔴', label: '〜49', desc: 'ストレスが高いかも' },
      ].map((row, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
          <Text style={{ width: 80 }}>{row.emoji} {row.label}</Text>
          <Text>{row.desc}</Text>
        </View>
      ))}
    </View>

    {/* 無料期間案内 */}
    {profile && !profile.is_paid && profile.created_at && (
      <View style={{
        backgroundColor: getFreeDaysLeft(profile.created_at) > 0 ? '#fefefe' : '#fff8f6',
        borderColor: getFreeDaysLeft(profile.created_at) > 0 ? '#ccc' : '#faa',
        borderWidth: 1,
        borderRadius: 6,
        padding: 12,
        margin: 20,
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
              onPress={() => Linking.openURL('https://koekarte.com/checkout')}
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
  </View>
);
