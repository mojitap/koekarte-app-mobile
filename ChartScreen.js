import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import ScoreChart from './ScoreChart';

export default function ChartScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📊 ストレススコアのグラフ</Text>
      <ScoreChart />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});