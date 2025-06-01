// ✅ ScoreChart.js（NaN対応済 + fallback処理付き）
import React, { useEffect, useState } from 'react';
import { View, Dimensions, Text } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { API_BASE_URL } from '../utils/config';

export default function ScoreChart({ range, smooth }) {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/score-history`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        const scores = data.scores || [];
        const cleaned = scores.filter(item => typeof item.score === 'number' && !isNaN(item.score));
        if (!cleaned.length) return;

        const sorted = cleaned.sort((a, b) => new Date(a.date) - new Date(b.date));
        let filtered = sorted;
        const now = new Date();

        if (range === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          filtered = sorted.filter(item => new Date(item.date) >= weekAgo);
        } else if (range === 'month') {
          const monthAgo = new Date();
          monthAgo.setMonth(now.getMonth() - 1);
          filtered = sorted.filter(item => new Date(item.date) >= monthAgo);
        }

        const labels = filtered.map(item => item.date.slice(5));
        const dataPoints = filtered.map(item => item.score);
        const firstFive = sorted.slice(0, 5);
        const baseline = Math.round(firstFive.reduce((sum, item) => sum + item.score, 0) / Math.max(firstFive.length, 1));

        if (!dataPoints.length || dataPoints.some(x => isNaN(x))) return;

        setChartData({
          labels,
          datasets: [
            {
              data: dataPoints,
              strokeWidth: 2,
              color: () => 'rgba(75,192,192,1)',
            },
            {
              data: Array(dataPoints.length).fill(baseline),
              strokeWidth: 1,
              color: () => 'rgba(255,99,132,0.7)',
              withDots: false,
            }
          ],
        });
      });
  }, [range]);

  if (!chartData) {
    return <Text style={{ textAlign: 'center', marginTop: 20 }}>📉 データがありません</Text>;
  }

  return (
    <View>
      {chartData.datasets[0].data.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20, color: '#666' }}>
          スコアデータがありません。
        </Text>
      ) : (
        <LineChart
          data={chartData}
          width={Dimensions.get('window').width - 40}
          height={220}
          chartConfig={{
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 8,
            },
            propsForDots: {
              r: '3',
              strokeWidth: '1',
              stroke: '#555',
            },
            propsForLabels: {
              rotation: '-45',
              fontSize: 10,
            },
          }}
          bezier={smooth}
          style={{ marginVertical: 8, borderRadius: 8 }}
        />
      )}
    </View>
  );
}
