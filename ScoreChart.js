// ScoreChart.js
import React, { useEffect, useState } from 'react';
import { View, Text, Dimensions, ActivityIndicator } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function ScoreChart() {
  const [scores, setScores] = useState([]);
  const [baseline, setBaseline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://koekarte.com/api/scores', {
      credentials: 'include'
    })
      .then(response => response.json())
      .then(data => {
        const rawScores = data.scores || [];

        const baseScores = rawScores.slice(0, 5);
        const base = baseScores.reduce((sum, s) => sum + s.score, 0) / (baseScores.length || 1);
        setBaseline(base);

        setScores(rawScores);
        setLoading(false);
      })
      .catch(error => {
        console.error('❌ スコア取得エラー:', error);
        setLoading(false);
      });
  }, []);

  if (loading) return <ActivityIndicator />;

  const chartData = {
    labels: scores.map(s => s.date.slice(5)), // MM-DD
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
      }
    ],
    legend: ["スコア", "ベースライン"],
  };

  return (
    <View>
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        ストレススコアの推移
      </Text>
      <LineChart
        data={chartData}
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
        style={{
          borderRadius: 16,
        }}
      />
    </View>
  );
}
