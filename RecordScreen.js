// screens/RecordScreen.js
import React, { useState, useRef } from 'react';
import { View, Text, Button, Alert, StyleSheet, ScrollView } from 'react-native';
import { Audio } from 'expo-av';
import { useNavigation } from '@react-navigation/native';

export default function RecordScreen() {
  const [recording, setRecording] = useState(null);
  const [status, setStatus] = useState('');
  const recordingRef = useRef(null);
  const navigation = useNavigation();

  const startRecording = async () => {
    try {
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
    setStatus('録音停止');
    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    console.log('✅ 録音ファイル:', uri);
    uploadRecording(uri);
    setRecording(null);
  };

  const uploadRecording = async (uri) => {
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
      Alert.alert("結果", text);
      navigation.navigate('Home'); // ✅ マイページ（Home）に戻る
    } catch (error) {
      console.error("❌ アップロード失敗:", error);
      Alert.alert("エラー", "アップロードに失敗しました");
    }
    setStatus('');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🎙️ 録音ページ</Text>
      <Text>{status}</Text>
      {!recording ? (
        <Button title="録音開始" onPress={startRecording} />
      ) : (
        <Button title="録音停止 & アップロード" onPress={stopRecording} />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 20,
    marginBottom: 20,
  },
});