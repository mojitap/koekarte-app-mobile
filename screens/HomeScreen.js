import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, Button, ScrollView, StyleSheet, SafeAreaView,
  Alert, Platform, StatusBar
} from 'react-native';
import { Audio } from 'expo-av';
import ScoreChart from '../ScoreChart';
import ScoreHistory from '../ScoreHistory';
import { checkCanUsePremium } from '../utils/premiumUtils';

export default function HomeScreen() {
  const [recording, setRecording] = useState(null);
  const [score, setScore] = useState(null);
  const [status, setStatus] = useState('');
  const [canUsePremium, setCanUsePremium] = useState(false);
  const recordingRef = useRef(null);

  useEffect(() => {
    fetch('http://192.168.0.27:5000/api/profile', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const ok = checkCanUsePremium(data.created_at, data.is_paid);
        setCanUsePremium(ok);
      })
      .catch(err => {
        console.error("❌ プロフィール取得失敗:", err);
        setCanUsePremium(false);
      });
  }, []);

  const startRecording = async () => {
    if (!canUsePremium) {
      Alert.alert("録音制限", "無料期間が終了しています。有料プランをご検討ください。");
      return;
    }

    try {
      console.log('🎙️ 録音開始');
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setRecording(recording);
      setStatus('録音中...');
    } catch (err) {
      console.error('❌ 録音エラー:', err);
    }
  };

  const stopRecording = async () => {
    console.log('🛑 録音停止');
    setStatus('録音停止');
    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    console.log('✅ 録音ファイル:', uri);
    uploadRecording(uri);
    setRecording(null);
  };

  const uploadRecording = async (uri) => {
    if (!canUsePremium) {
      Alert.alert("アップロード制限", "無料期間が終了しています。有料プランをご検討ください。");
      return;
    }

    setStatus('アップロード中...');
    const formData = new FormData();
    formData.append('audio_data', {
      uri,
      name: 'recording.m4a',
      type: 'audio/m4a',
    });

    try {
      const response = await fetch('http://192.168.0.27:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      const text = await response.text();
      let data = null;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("❌ JSONパース失敗:", text);
        Alert.alert("エラー", "サーバーの応答が不正です");
        return;
      }

      if (!response.ok || !data || typeof data.score !== 'number') {
        throw new Error(`HTTP error: ${response.status}`);
      }

      setScore(data.score);
      Alert.alert("ストレススコア", `${data.score} 点`);
    } catch (error) {
      console.error("❌ アップロード失敗:", error);
      Alert.alert("エラー", "アップロードに失敗しました");
    }

    setStatus('');
  };

  return (
    <SafeAreaView style={{
      flex: 1,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
    }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>コエカルテ - 音声ストレスチェック</Text>
        <Text>{status}</Text>

        {/* 🔁 録音方法・説明 */}
        <View style={{ marginTop: 20 }}>
          <Text style={{ fontWeight: 'bold' }}>📘 使い方（録音の流れ）</Text>
          <Text>🔁 録音開始 → 録音停止 → 再生 → アップロード</Text>
          <Text>✅ 1日1回の録音で、グラフに反映されます</Text>
        </View>

        <Text style={{ marginTop: 20, fontSize: 16, fontWeight: 'bold' }}>
          🔊 以下のように話してください：
        </Text>
        <Text style={{ fontSize: 14, color: 'gray', textAlign: 'left' }}>
          ・今日は落ち着いた気持ちで過ごしました{"\n"}
          ・最近は夜によく眠れています{"\n"}
          ・一人の時間も心地よく過ごせています{"\n"}
          ・今日は特に強い不安は感じていません
        </Text>

        {/* 🔴 録音ボタン制御 */}
        {!recording ? (
          <Button title="🎙️ 録音開始" onPress={startRecording} />
        ) : (
          <Button title="🛑 録音停止 & アップロード" onPress={stopRecording} />
        )}

        {/* 🔶 スコア表示 */}
        {score !== null && (
          <View style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ fontSize: 22, fontWeight: 'bold' }}>
              ストレススコア：{score} 点
            </Text>
            <Text style={{ marginTop: 10, fontSize: 14, color: 'gray', textAlign: 'center' }}>
              ※録音が短いとスコアが正確に出ないことがあります
            </Text>
          </View>
        )}

        {/* 📈 折れ線グラフ */}
        <View style={{ marginTop: 40, width: '100%' }}>
          <ScoreChart />
        </View>

        {/* 🧾 履歴一覧 */}
        <View style={{ marginTop: 30, width: '100%' }}>
          <ScoreHistory />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    paddingTop: 40,
  },
});
