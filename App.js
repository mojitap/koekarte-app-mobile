import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import { Audio } from 'expo-av';

export default function App() {
  const [recording, setRecording] = useState(null);
  const [score, setScore] = useState(null); // ✅ 追加
  const [status, setStatus] = useState('');
  const recordingRef = useRef(null);

  const startRecording = async () => {
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
    setRecording(null); // ✅ ボタンを戻すために必要
  };

  const uploadRecording = async (uri) => {
    setStatus('アップロード中...');
    const formData = new FormData();
    formData.append('audio_data', {
      uri,
      name: 'recording.m4a', // ← 明示的に拡張子を変更
      type: 'audio/m4a',
    });

    try {
      const response = await fetch('https://koekarte.com/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log("✅ スコア:", data.score);
      setScore(data.score); // ✅ スコア保存
      Alert.alert("ストレススコア", `${data.score} 点`);
    } catch (error) {
      console.error("❌ アップロード失敗:", error);
      Alert.alert("エラー", "サーバーに接続できませんでした");
    }

    setStatus('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>コエカルテ - 音声ストレスチェック</Text>
      <Text>{status}</Text>
      {!recording ? (
        <Button title="🎙️ 録音開始" onPress={startRecording} />
      ) : (
        <Button title="🛑 録音停止 & アップロード" onPress={stopRecording} />
      )}

      {score !== null && (
        <View style={{ marginTop: 20, alignItems: 'center' }}>
          <Text style={{ fontSize: 22, fontWeight: 'bold' }}>
            ストレススコア：{score} 点
          </Text>
          <Text style={{ marginTop: 10, fontSize: 14, color: 'gray', textAlign: 'center' }}>
            ※ 録音が短すぎる・無音・雑音が多い場合、極端に低いスコアが出ることがあります。
          </Text>
        </View>
      )}
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});