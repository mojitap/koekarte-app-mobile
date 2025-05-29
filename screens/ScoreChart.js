// ScoreChart.js
import React, { useEffect, useState } from 'react';
import { View, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function ScoreChart({ range }) {
  const [chartData, setChartData] = useState({ labels: [], datasets: [{ data: [] }] });

  useEffect(() => {
    fetch('http://192.168.0.12:5000/api/score-history', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        const scores = data.scores || [];
        if (!scores.length) return;

        // Sort by date
        const sorted = scores.sort((a, b) => new Date(a.date) - new Date(b.date));

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

        // ベースライン（最初の5回の平均）
        const firstFive = sorted.slice(0, 5);
        const baseline = Math.round(firstFive.reduce((sum, item) => sum + item.score, 0) / Math.max(firstFive.length, 1));

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

  return (
    <View>
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
          }
        }}
        bezier
        style={{ marginVertical: 8, borderRadius: 8 }}
      />
    </View>
  );
}
