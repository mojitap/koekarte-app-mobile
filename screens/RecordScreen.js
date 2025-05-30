import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,   // ✅ ← これを追加！
  Alert,
  ScrollView,
  Image
} from 'react-native';
import { Audio } from 'expo-av';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { checkCanUsePremium } from '../utils/premiumUtils';
import { getUser } from '../utils/auth';
import { API_BASE_URL } from '../utils/config';  // ← パスが screens フォルダ内なら ../ が必要

export default function RecordScreen() {
  const navigation = useNavigation();
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [score, setScore] = useState(null);
  const [status, setStatus] = useState('');
  const [canUsePremium, setCanUsePremium] = useState(false);
  const recordingRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      getUser().then(user => {
        if (!user) {
          // ✅ 未ログインならログイン画面に遷移
          Alert.alert("ログインが必要です", "", [
            { text: "OK", onPress: () => navigation.navigate('Login') }
          ]);
          return;
        }

        fetch(`${API_BASE_URL}/api/profile`, {
          credentials: 'include',
        })
          .then(res => res.json())
          .then(data => {
            const ok = checkCanUsePremium(data.created_at, data.is_paid, data.is_free_extended);
            setCanUsePremium(ok);
          })
          .catch(err => {
            console.error("❌ プロフィール取得失敗:", err);
            setCanUsePremium(false);
          });
      });
    }, [])
  );

  const startRecording = async () => {
    if (!canUsePremium) {
      Alert.alert("録音制限", "無料期間が終了しています。有料プランをご検討ください。");
      return;
    }
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

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
    setRecording(null);
    setRecordingUri(uri);
    setStatus('再生またはアップロードが可能です');
  };

  const playRecording = async () => {
    if (!recordingUri) return;
    try {
      if (sound) {
        await sound.unloadAsync();
        setSound(null);
      }
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: recordingUri });
      setSound(newSound);
      await newSound.playAsync();
    } catch (err) {
      console.error("❌ 再生エラー:", err);
    }
  };

  const uploadRecording = async () => {
    if (!recordingUri || !canUsePremium) {
      Alert.alert("アップロード制限", "録音が存在しないか、利用制限中です。");
      return;
    }
    setStatus('アップロード中...');
    const formData = new FormData();
    formData.append('audio_data', {
      uri: recordingUri,
      name: 'recording.m4a',
      type: 'audio/m4a',
    });
    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData,
      });
      const text = await response.text();
      const data = JSON.parse(text);
      if (!response.ok || typeof data.score !== 'number') {
        throw new Error(`HTTP error: ${response.status}`);
      }
      setScore(data.score);
      Alert.alert("ストレススコア", `${data.score} 点`);
      navigation.navigate('Main', { screen: 'Home' });
    } catch (error) {
      console.error("❌ アップロード失敗:", error);
      Alert.alert("エラー", "アップロードに失敗しました");
    }
    setStatus('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../assets/koekoekarte.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.heading}>🎙️ 音声ストレスチェック</Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <Text style={styles.subtitle}>📘 録音の流れ（使い方）</Text>
          <Text style={styles.paragraph}>🔁 「録音開始」→「録音停止」→「再生で確認」→「アップロード」</Text>
          <Text style={styles.paragraph}>▶️ 再生ボタンで録音内容を確認できます</Text>
          <Text style={styles.paragraph}>✅ 確認せずにアップロードしても構いません</Text>
          <Text style={styles.paragraph}>🔁 アップロードしなければ録音は何回でもやり直し可能です</Text>
          <Text style={styles.paragraph}>🎯 より正確なストレス分析のためには、<Text style={{ fontWeight: 'bold' }}>1回の録音</Text>が理想です</Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.subtitle}>🗣️ 以下の6つの文章を順番に読み上げてください</Text>
          <Text style={styles.example}>
            ・今日は落ち着いた気持ちで過ごしました{"\n"}
            ・人との関わりに安心感を感じています{"\n"}
            ・最近は夜によく眠れています{"\n"}
            ・体の調子も比較的安定しています{"\n"}
            ・一人の時間も心地よく過ごせています{"\n"}
            ・今日は特に強い不安は感じていません
          </Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.notice}>
            ※現在のスコアは「声の大きさ・元気さ・活力」などに反応しやすい傾向があります。{"\n"}
            小声やささやき声で録音した場合、実際の気分に関係なくスコアが低く表示されることがあります。
          </Text>
        </View>

        <Text style={styles.label}>🔁 録音 → 再生 → アップロード</Text>
        {!recording && (
          <>
            <Button title="🎙️ 録音開始" onPress={startRecording} />
            {recordingUri && <Button title="▶️ 再生" onPress={playRecording} />}
            {recordingUri && <Button title="⬆️ アップロード" onPress={uploadRecording} />}
          </>
        )}
        {recording && (
          <Button title="🛑 録音停止" onPress={stopRecording} />
        )}

        {score !== null && (
          <Text style={styles.score}>ストレススコア：{score} 点</Text>
        )}
        <Text style={styles.status}>{status}</Text>
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
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 120,
    height: 50,
    marginBottom: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  example: {
    fontSize: 14,
    color: '#444',
    backgroundColor: '#f7f7f7',
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
    lineHeight: 22,
  },
  notice: {
    fontSize: 12,
    color: '#aa0000',
    backgroundColor: '#fff3f3',
    padding: 10,
    borderRadius: 6,
    lineHeight: 18,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 20,
  },
  score: {
    marginTop: 20,
    fontSize: 20,
    color: 'green',
    textAlign: 'center',
  },
  status: {
    marginTop: 10,
    textAlign: 'center',
  },
});
