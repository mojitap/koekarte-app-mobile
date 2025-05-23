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
        setCanUse(checkCanUsePremium(data.created_at, data.is_paid));
      });
  }, []);

  useEffect(() => {
    if (!canUse) return;

    fetch('http://192.168.0.42:5000/api/profile')
      .then(response => response.json())
      .then(data => {
        let rawScores = (data.scores || []).filter(s => isFinite(s.score));
        const base = rawScores.slice(0, 5).reduce((sum, s) => sum + s.score, 0) / (rawScores.length || 1);
        setBaseline(base);
        setScores(rawScores);
        setLoading(false);
      })
      .catch(error => {
        console.error('❌ スコア取得エラー:', error);
        setLoading(false);
      });
  }, [canUse]);

  if (!canUse) return <Text style={{ color: 'gray' }}>※スコアグラフは無料期間終了後は非表示です</Text>;
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
              color: () => `rgba(134, 65, 244, 1)`,
              strokeWidth: 2,
            },
            {
              data: scores.map(() => baseline),
              color: () => `rgba(255, 99, 132, 1)`,
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
          backgroundGradientFrom: '#f7f7f7',
          backgroundGradientTo: '#f7f7f7',
          decimalPlaces: 0,
          color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        }}
        bezier
        style={{ borderRadius: 16 }}
      />
    </View>
  );
}
