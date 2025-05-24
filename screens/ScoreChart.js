import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { checkCanUsePremium } from '../utils/premiumUtils';

export default function ScoreChart() {
  const [scores, setScores] = useState([]);
  const [baseline, setBaseline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [canUse, setCanUse] = useState(false);

  useEffect(() => {
    fetch('http://192.168.0.42:5000/api/profile', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const ok = checkCanUsePremium(data.created_at, data.is_paid);
        setCanUse(ok);
      });
  }, []);

  useEffect(() => {
    if (!canUse) return;

    fetch('http://192.168.0.42:5000/api/scores', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setScores(data.scores || []);
        setBaseline(data.baseline);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ スコア取得失敗:", err);
        setLoading(false);
      });
  }, [canUse]);

  if (!canUse) return <Text style={{ color: 'gray' }}>※ グラフ機能は無料期間終了後は非表示です</Text>;
  if (loading) return <ActivityIndicator />;
  if (scores.length === 0) return <Text>スコアデータがありません</Text>;

  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        ストレススコアの推移
      </Text>
      <LineChart
        data={{
          labels: scores.map(s => s.date?.slice(5) || ''),
          datasets: [
            {
              data: scores.map(s => s.score),
              color: () => `rgba(33, 150, 243, 1)`, // 青
              strokeWidth: 2,
            },
            {
              data: scores.map(() => baseline),
              color: () => `rgba(255, 99, 132, 1)`, // 赤
              strokeWidth: 2,
            },
          ],
          legend: ["スコア", "ベースライン"],
        }}
        width={Dimensions.get('window').width - 40}
        height={220}
        yAxisSuffix="点"
        chartConfig={{
          backgroundColor: '#fff',
          backgroundGradientFrom: '#fff',
          backgroundGradientTo: '#fff',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        bezier
        style={{ borderRadius: 16 }}
      />
    </View>
  );
}
