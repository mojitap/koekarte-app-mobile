import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Button, ScrollView, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useFocusEffect } from '@react-navigation/native';

export default function ScoreHistory() {
  const [scores, setScores] = useState([]);

  const fetchScores = useCallback(() => {
    fetch('http://192.168.0.27:5000/api/scores', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.scores)) {
          setScores(data.scores);
        } else {
          console.error("❌ 予期しないレスポンス:", data);
          Alert.alert("エラー", "サーバーからのレスポンスが不正です。");
        }
      })
      .catch(err => {
        console.error('❌ 履歴取得失敗:', err);
        Alert.alert("エラー", "スコア履歴の取得に失敗しました");
      });
  }, []);

  useFocusEffect(fetchScores);

  const exportToCSV = async () => {
    if (scores.length === 0) {
      Alert.alert("注意", "保存できるデータがありません");
      return;
    }

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
        {scores.length === 0 ? (
          <Text style={{ color: 'gray' }}>まだ記録がありません。</Text>
        ) : (
          scores.map((s, index) => (
            <Text key={index}>{s.date} - {s.score} 点</Text>
          ))
        )}
      </ScrollView>

      <Button title="📤 CSVで保存・共有" onPress={exportToCSV} />
    </View>
  );
}
