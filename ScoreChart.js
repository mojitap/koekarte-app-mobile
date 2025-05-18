// ScoreChart.js
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function ScoreChart() {
  const [scores, setScores] = useState([]);
  const [baseline, setBaseline] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('https://koekarte.com/api/scores', {
      credentials: 'include'  // Cookieログイン用
    })
      .then(response => response.json())
      .then(data => {
        const rawScores = data.scores;
        const baseScores = rawScores.slice(0, 5);
        const base = baseScores.reduce((sum, s) => sum + s.score, 0) / baseScores.length;
        setBaseline(base);

        // スコアに baseline を追加
        const withBaseline = rawScores.map(s => ({ ...s, baseline: base }));
        setScores(withBaseline);
        setLoading(false);
      })
      .catch(error => {
        console.error('❌ スコア取得エラー:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <ActivityIndicator />;
  }

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>ストレススコアの推移</Text>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={scores}>
          <XAxis dataKey="date" />
          <YAxis domain={[0, 100]} />
          <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="score" stroke="#82ca9d" name="スコア" />
          <Line type="monotone" dataKey="baseline" stroke="#8884d8" name="ベースライン" strokeDasharray="4 4" />
        </LineChart>
      </ResponsiveContainer>
    </View>
  );
}