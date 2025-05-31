// WelcomeScreen.js
import React, { useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const [showFullText, setShowFullText] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>音声でストレスチェック｜コエカルテ</Text>
      <Text style={styles.description}>
        「コエカルテ」は、声の元気さ・活力をもとにストレス傾向をスコア化する
        セルフチェックツールです。スマホやPCから簡単に録音するだけで、心の変化を
        毎日グラフで見える化できます。
      </Text>

      <View style={styles.bullets}>
        <Text>✅ 匿名OK・登録無料・スマホ対応</Text>
        <Text>✅ ストレススコアの自動分析＆記録保存</Text>
        <Text>✅ うつ・不安のセルフケアにおすすめ</Text>
        <Text>🎵 音楽でも心のケアを</Text>
      </View>

      {showFullText && (
        <View style={styles.fullText}>
          <Text>リラックス：自然音や穏やかなメロディで緊張や疲れをほぐす</Text>
          <Text>整える・集中：瞑想音やホワイトノイズで思考を整理</Text>
          <Text>気分を上げる：明るく元気が出るアコースティックBGM</Text>

          <Text style={{ marginTop: 12 }}>🌿 こんな方におすすめ：</Text>
          <Text>・気分の落ち込みや不安を感じる日が増えた</Text>
          <Text>・なんとなく不調が続いていて原因がわからない</Text>
          <Text>・日々のメンタルを記録・振り返りたい</Text>

          <Text style={{ marginTop: 12 }}>💬 ご利用いただいている方々：</Text>
          <Text>・うつ病・PTSD・パニック障害などで療養中の方</Text>
          <Text>・就活・仕事・育児・学校などでストレスを感じやすい方</Text>
          <Text>・「これはストレス？体調？気のせい？」と感じる日常の不安に</Text>

          <Text style={styles.caution}>※コエカルテは医療行為を目的としたサービスではありません。症状が気になる方は専門機関への相談をおすすめします。</Text>
        </View>
      )}

      <TouchableOpacity onPress={() => setShowFullText(!showFullText)}>
        <Text style={styles.moreButton}>{showFullText ? '▲ 閉じる' : '▼ 続きを読む'}</Text>
      </TouchableOpacity>

      <Button title="ログインへ進む" onPress={() => navigation.navigate('Login')} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  bullets: {
    marginBottom: 20,
  },
  fullText: {
    marginBottom: 20,
  },
  moreButton: {
    color: '#007AFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  caution: {
    marginTop: 12,
    fontSize: 12,
    color: '#888',
  },
});
