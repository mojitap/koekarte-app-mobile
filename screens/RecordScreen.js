import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Audio } from 'expo-av';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { checkCanUsePremium } from '../utils/premiumUtils';
import { getUser } from '../utils/auth';
import { API_BASE_URL } from '../utils/config';
import * as FileSystem from 'expo-file-system';

export default function RecordScreen() {
  const navigation = useNavigation();
  const [submitted, setSubmitted] = useState(false);

  // ハイブリッド処理用ジョブID
  const [detailJobId, setDetailJobId] = useState(null);
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [recordingUri, setRecordingUri] = useState(null);
  const [score, setScore] = useState(null);
  const [dotCount, setDotCount] = useState(0);
  const [status, setStatus] = useState('');
  const [canUsePremium, setCanUsePremium] = useState(false);
  const recordingRef = useRef(null);

  // ログイン状態と利用可否チェック
  useFocusEffect(
    React.useCallback(() => {
      getUser().then((user) => {
        if (!user) {
          Alert.alert('ログインが必要です', '', [
            { text: 'OK', onPress: () => navigation.navigate('Login') },
          ]);
          return;
        }
        fetch(`${API_BASE_URL}/api/profile`, { credentials: 'include' })
          .then((res) => res.json())
          .then((data) => {
            const ok = checkCanUsePremium(
              data.created_at,
              data.is_paid,
              data.is_free_extended
            );
            setCanUsePremium(ok);
          })
          .catch((err) => {
            console.error('❌ プロフィール取得失敗:', err);
            setCanUsePremium(false);
          });
      });
      return () => {
        if (sound) {
          sound.stopAsync();
          sound.unloadAsync();
        }
      };
    }, [sound])
  );

  // 録音中ドットアニメ
  useEffect(() => {
    let iv;
    if (status === '録音中...') {
      iv = setInterval(() => setDotCount((p) => (p + 1) % 4), 500);
    } else {
      setDotCount(0);
    }
    return () => clearInterval(iv);
  }, [status]);

  // 詳細解析結果のポーリング
  useEffect(() => {
    if (!detailJobId) return;
    const iv = setInterval(async () => {
      const res = await fetch(
        `${API_BASE_URL}/api/upload/result/${detailJobId}`,
        { credentials: 'include' }
      );
      const j = await res.json();
      if (j.status === 'done') {
        setScore(j.score);
        clearInterval(iv);
      }
    }, 3000);
    return () => clearInterval(iv);
  }, [detailJobId]);

  const startRecording = async () => {
    if (!canUsePremium) {
      Alert.alert('録音制限', '無料期間が終了しています。有料プランをご検討ください。');
      return;
    }
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          '録音許可が必要です',
          '録音機能を使うにはマイクのアクセスを許可してください。'
        );
        return;
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
      await new Promise((r) => setTimeout(r, 2000));
      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 256000,
          volume: 1.0,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MAX,
          sampleRate: 44100,
          numberOfChannels: 1,
          bitRate: 320000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
          volume: 1.0,
        },
      };
      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      recordingRef.current = recording;
      setRecording(recording);
      setStatus('録音中...');
    } catch (e) {
      console.error('❌ 録音エラー:', e);
      Alert.alert('エラー', '録音の開始に失敗しました。');
    }
  };

  const stopRecording = async () => {
    setStatus('録音停止');
    await recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
    const uri = recording.getURI();
    setRecording(null);
    setRecordingUri(uri);
    setStatus('再生またはアップロードが可能です');
    try {
      const info = await FileSystem.getInfoAsync(uri);
      console.log('📦 録音ファイルURI:', uri);
      console.log('📏 録音ファイルサイズ:', info.size);
      if (info.size < 5000)
        Alert.alert('注意', '録音ファイルが小さすぎます。');
    } catch (e) {
      console.error('❌ ファイル情報取得エラー:', e);
    }
  };

  const playRecording = async () => {
    if (!recordingUri) return;
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
      });
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: recordingUri },
        { shouldPlay: false }
      );
      await newSound.setStatusAsync({ volume: 1.0 });
      setSound(newSound);
      await newSound.playAsync();
    } catch (e) {
      console.error('❌ 再生エラー:', e);
    }
  };

  const uploadRecording = async () => {
    if (!recordingUri || !canUsePremium) {
      Alert.alert("アップロード制限", "録音が存在しないか、利用制限中です。");
      return;
    }

    setStatus('アップロード中...');
    const uri = recordingUri.startsWith('file://')
      ? recordingUri
      : `file://${recordingUri}`;
    const fd = new FormData();
    fd.append('audio_data', { uri, name: 'recording.m4a', type: 'audio/m4a' });
    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        credentials: 'include',
        body: fd,
      });
      const ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        const text = await res.text();
        throw new Error('非JSONレスポンス: ' + text);
      }
      const { quick_score, job_id } = await res.json();
      setScore(quick_score);
      setDetailJobId(job_id);
      Alert.alert('ストレススコア', `${quick_score} 点`);
      navigation.navigate('Chart', { refresh: Date.now() });
    } catch (e) {
      console.error('❌ アップロード失敗:', e);
      Alert.alert('エラー', 'アップロードに失敗しました');
    }
    setStatus('');
  };

  // フィードバック送信関数
  const submitFeedback = async (userScore) => {
    try {
      await fetch(`${API_BASE_URL}/api/feedback`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ internal: score, user: userScore }),
      });
      Alert.alert('ご協力ありがとうございました！');
      setSubmitted(true);  // ★送信済みにフラグを立てる
    } catch (e) {
      console.error('❌ フィードバック送信エラー:', e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* ヘッダー */}
        <View style={styles.header}>
          <Image
            source={require('../assets/koekoekarte.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.heading}>🎙️ 音声ストレスチェック</Text>
        </View>

        {/* 説明文章 */}
        <View style={{ marginTop: 20 }}>
          <Text style={styles.subtitle}>
            🗣️ 録音開始ボタンをクリックして、以下の6つの文章を順番に読み上げてください
          </Text>
          <Text style={styles.example}>
            ・今日は落ち着いた気持ちで過ごしました{'\n'}
            ・人との関わりに安心感を感じています{'\n'}
            ・最近は夜によく眠れています{'\n'}
            ・体の調子も比較的安定しています{'\n'}
            ・一人の時間も心地よく過ごせています{'\n'}
            ・今日は特に強い不安は感じていません
          </Text>
        </View>

        {/* ボタン群 */}
        <View style={styles.buttonGroup}>
          {/* <Text style={styles.label}>🔁 録音 → 再生 → アップロード</Text> ←消してOK */}
          {!recording && (
            <>
              <TouchableOpacity
                style={[
                  styles.recordButton,
                  sound && styles.recordButtonDisabled,
                ]}
                onPress={startRecording}
                disabled={!!sound}
              >
                <Text style={styles.recordButtonText}>🎙️ 録音開始</Text>
              </TouchableOpacity>
              {recordingUri && (
                <Button title="▶️ 再生" onPress={playRecording} />
              )}
              {sound && (
                <Button
                  title="⏹️ 再生停止"
                  onPress={async () => {
                    await sound.stopAsync();
                    await sound.unloadAsync();
                    setSound(null);
                  }}
                />
              )}
              {recordingUri && (
                <Button
                  title="⬆️ アップロード"
                  onPress={uploadRecording}
                />
              )}
            </>
          )}
          {recording && (
            <Button title="🛑 録音停止" onPress={stopRecording} />
          )}

          {/* スコア表示 */}
          {score !== null && (
            <Text style={styles.score}>
              ストレススコア：{score} 点
            </Text>
          )}

          {/* フィードバックUI */}
          {score !== null && !submitted && (
            <View style={{
              flexDirection: 'column',
              alignItems: 'flex-start',
              marginTop: 10,
            }}>
              <Text style={{ marginBottom: 10, textAlign: 'center' }}>
                このスコアは妥当でしたか？{'\n'}★を選んでください
              </Text>
                {[1, 2, 3, 4, 5].map(n => (
                  <TouchableOpacity
                    key={n}
                    onPress={() => submitFeedback(n)}
                    style={{ marginVertical: 6 }}
                  >
                    <Text style={{ fontSize: 24 }}>{'★'.repeat(n)}</Text>
                  </TouchableOpacity>
              ))}
            </View>
          )}

          {/* 録音中インジケータ */}
          {status === '録音中...' && (
            <Text style={styles.recordingStatus}>
              🔴 録音中{typeof dotCount === 'number' ? '.'.repeat(dotCount) : ''}
            </Text>
          )}
        </View>

        {/* 注意文 */}
        {score !== null && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.notice}>
              ※現在のスコアは「声の大きさ・元気さ・活力」に反応しやすい傾向があります。{'\n'}
              小声やささやき声で録音した場合、実際の気分に関係なくスコアが低く表示されることがあります。
            </Text>
          </View>
        )}

        {/* 録音フロー説明 */}
        <View style={{ marginTop: 10 }}>
          <Text style={styles.subtitle}>📘 録音の流れ（使い方）</Text>
          <Text style={styles.paragraph}>
            🔁 「録音開始」→「録音停止」→「再生で確認」→「アップロード」
          </Text>
          <Text style={styles.paragraph}>
            ▶️ 再生ボタンで録音内容を確認できます
          </Text>
          <Text style={styles.paragraph}>
            ✅ 確認せずにアップロードしても構いません
          </Text>
          <Text style={styles.paragraph}>
            🔁 アップロードしなければ録音は何回でもやり直し可能です
          </Text>
          <Text style={styles.paragraph}>
            🎯 より正確なストレス分析のためには、
            <Text style={{ fontWeight: 'bold' }}>1回の録音</Text>が理想です
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight
        : 0,
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
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 10,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  example: {
    fontSize: 18,
    color: '#444',
    backgroundColor: '#f7f7f7',
    padding: 10,
    borderRadius: 6,
    marginTop: 5,
    lineHeight: 26,
  },
  buttonGroup: {
    marginTop: 20,
    marginBottom: 10,
    gap: 10,
  },
  recordButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignItems: 'center',
    marginVertical: 10,
  },
  recordButtonDisabled: {
    backgroundColor: '#ccc',
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  score: {
    marginTop: 20,
    fontSize: 20,
    color: 'green',
    textAlign: 'center',
  },
  recordingStatus: {
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  notice: {
    fontSize: 16,
    color: '#aa0000',
    backgroundColor: '#fff3f3',
    padding: 10,
    borderRadius: 6,
    lineHeight: 24,
  },
  paragraph: {
    fontSize: 18,
    marginBottom: 6,
    color: '#333',
    lineHeight: 24,
  },
});
