// ✅ React Native: CSV保存 + 表示機能
// ScoreHistory.js
import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export default function ScoreHistory() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    fetch('https://koekarte.com/api/scores', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setScores(data.scores);
      })
      .catch(err => {
        console.error('❌ 履歴取得失敗:', err);
      });
  }, []);

  const exportToCSV = async () => {
    const header = '日付,スコア\n';
    const rows = scores.map(s => `${s.date},${s.score}`).join('\n');
    const csv = header + rows;

    const fileUri = FileSystem.documentDirectory + 'scores.csv';
    await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });

    await Sharing.shareAsync(fileUri);
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold', marginBottom: 10 }}>📅 スコア履歴一覧</Text>
      <ScrollView style={{ maxHeight: 300 }}>
        {scores.map((s, index) => (
          <Text key={index}>{s.date} - {s.score} 点</Text>
        ))}
      </ScrollView>
      <Button title="📤 CSVで保存・共有" onPress={exportToCSV} />
    </View>
  );
}
