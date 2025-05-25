import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';

export default function ScoreHistory() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://192.168.0.27:5000/api/score-history', {
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        setScores(data.scores || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ スコア履歴取得失敗:", err);
        setLoading(false);
      });
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>📅 ストレススコア履歴</Text>

        {loading ? (
          <ActivityIndicator size="large" />
        ) : scores.length === 0 ? (
          <Text style={styles.notice}>まだ記録がありません。</Text>
        ) : (
          scores.map((item, index) => (
            <View key={index} style={styles.item}>
              <Text style={styles.date}>{item.date}</Text>
              <Text style={styles.score}>スコア：{item.score} 点</Text>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  score: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  notice: {
    fontSize: 14,
    color: 'gray',
    textAlign: 'center',
    marginTop: 40,
  },
});
