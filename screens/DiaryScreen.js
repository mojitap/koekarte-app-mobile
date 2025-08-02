import React, {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  AppState,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { purchaseWithApple, purchaseWithGoogle } from '../utils/purchaseUtils';
import { getUser } from '../utils/auth';
import { getFreeDaysLeft } from '../utils/premiumUtils';
import { API_BASE_URL } from '../utils/config';
import { useFocusEffect } from '@react-navigation/native';

const DiaryScreen = ({ navigation }) => {
  const recordingTimeout = useRef(null);
  const { userProfile } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [recordedDates, setRecordedDates] = useState({});
  const [canUsePremium, setCanUsePremium] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isSaving, setIsSaving] = useState(false); 
  const [uploadStatus, setUploadStatus] = useState('');

  const diaryDir = FileSystem.documentDirectory + 'diary/';
  const [markedDates, setMarkedDates] = useState({});

  const loadMarkedDates = async () => {
    const files = await FileSystem.readDirectoryAsync(diaryDir);
    const marks = {};
    files.forEach(f => {
      const dateStr = f.replace('.m4a', '');
      marks[dateStr] = { marked: true, dotColor: 'green', selectedColor: '#aef' };
    });
    setMarkedDates(marks);
  };

  const diaryFilePath = diaryDir + 'recording_diary.m4a';
  const filePathForDate = `${diaryDir}${selectedDate}.m4a`;

  useEffect(() => {
    FileSystem.makeDirectoryAsync(diaryDir, { intermediates: true }).catch(() => {});
    loadDiaryFiles();
    return () => sound && sound.unloadAsync();
  }, []);

  const saveDiaryRecording = async (uri, dateStr) => {
    const destPath = `${diaryDir}${dateStr}.m4a`;
    await FileSystem.moveAsync({ from: uri, to: destPath });
    loadMarkedDates(); // 保存後にカレンダー更新
  };

  useEffect(() => {
    getUser().then(data => {
      if (!data) return;
      fetch(`${API_BASE_URL}/api/profile`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setCanUsePremium(data.can_use_premium);
          setProfile(data);
        })
        .catch(err => {
          console.error('❌ プロフィール取得失敗:', err);
          setCanUsePremium(false);
        });
    });
  }, []);

  useEffect(() => {
  　const subscription = AppState.addEventListener('change', nextAppState => {
    　if ((nextAppState === 'inactive' || nextAppState === 'background') && recording) {
      　stopRecording();
    　}
  　});

  　return () => subscription.remove();
　}, [recording]);

  useFocusEffect(
  　useCallback(() => {
    　return () => {
      　if (recording) stopRecording();
    　};
  　}, [recording])
　);

  const getFilePath = (date) => `${diaryDir}${date}.m4a`;

  const loadDiaryFiles = async () => {
   try {
     const files = await FileSystem.readDirectoryAsync(diaryDir);
     console.log('---- diary/ フォルダの中身 ----');
     const dots = {};
     for (const file of files) {
       const info = await FileSystem.getInfoAsync(diaryDir + file);
       console.log(`ファイル: ${file}, サイズ: ${info.size}`);
       // dots処理もここで
       if (info.size > 0) {
         const date = file.replace('.m4a', '');
         dots[date] = { marked: true, dotColor: 'blue' };
       }
     }
     setRecordedDates(dots);
   } catch (e) {
     console.log('読み込みエラー', e);
   }
 };

  const startRecording = async () => {
    if (recording) {
      Alert.alert('録音中です', '録音を停止してから再度開始してください。');
      return;
    }

    if (!canUsePremium) {
      Alert.alert('利用制限', '無料期間は終了しました。有料プラン（月額300円）に登録すると録音が可能になります。', [
        { text: '有料登録する', onPress: () => handlePurchase() },
        { text: 'キャンセル', style: 'cancel' },
      ]);
      return;
    }

    // --- 当日（selectedDate）の録音ファイル存在チェック
    const filePath = getFilePath(selectedDate);
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    // ----ここが重要！----
    // "今日の日記録音ファイルが存在する場合だけ" 上書き確認を出す
    if (fileInfo.exists && fileInfo.size > 0) {
      const ok = await new Promise(resolve =>
        Alert.alert(
          "上書き確認",
          "この日の日記録音はすでに存在します。上書きしますか？",
          [
            { text: "キャンセル", style: "cancel", onPress: () => resolve(false) },
            { text: "上書きする", onPress: () => resolve(true) },
          ],
          { cancelable: false }
        )
      );
      if (!ok) return;
    }

    // 上書き確認が不要、もしくはOKされたら録音開始
    await startActualRecording();
  };

　const startActualRecording = async () => {
  　try {
    　const permission = await Audio.requestPermissionsAsync();
    　if (!permission.granted) {
      　Alert.alert('マイクのアクセスが拒否されました');
      　return;
    　}

    　await Audio.setAudioModeAsync({
      　allowsRecordingIOS: true,
      　playsInSilentModeIOS: true,
    　});

    　const newRecording = new Audio.Recording();
    　await newRecording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
    　await newRecording.startAsync();
    　setRecording(newRecording);

    　recordingTimeout.current = setTimeout(() => {
      　stopRecording();
      　Alert.alert('⏰録音終了', '録音は15秒で自動終了しました。');
    　}, 15000);
  　} catch (err) {
    　Alert.alert('録音エラー', err.message);
  　}
　};

  const stopRecording = async () => {
    try {
      clearTimeout(recordingTimeout.current);
      setIsSaving(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const newPath = getFilePath(selectedDate);

      // ★ 上書き時は事前に既存ファイルを削除
      const exists = await FileSystem.getInfoAsync(newPath);
      if (exists.exists) {
        await FileSystem.deleteAsync(newPath, { idempotent: true });
      }

      setUploadStatus('💾 保存中...');
      await FileSystem.moveAsync({ from: uri, to: newPath });
      setUploadStatus('✅ 保存完了');
      setRecording(null);
      loadDiaryFiles();
    } catch (err) {
      Alert.alert('保存エラー', err.message);
      setUploadStatus('❌ 保存に失敗しました');
    } finally {
      setIsSaving(false);
    }
  };

  const playRecording = async () => {
    try {
      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      const filePath = getFilePath(selectedDate);
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: filePath });
      setSound(newSound);
      await newSound.playAsync();
    } catch (err) {
      Alert.alert('再生エラー', err.message);
    }
  };

  const handlePurchase = async () => {
    try {
      if (Platform.OS === 'ios') {
        await purchaseWithApple();
      } else {
        await purchaseWithGoogle();
      }
    } catch (err) {
      console.error('購入エラー:', err);
      Alert.alert('エラー', '購入に失敗しました。');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>音声日記</Text>
      <Text style={styles.description}>
        「今日ちょっと疲れたかも…」そんな気持ち、文字じゃなくて「声」で残してみませんか？{"\n\n"}
        コエカルテの音声日記は、毎日15秒の声を記録できる機能です。{"\n"}
        録音はカレンダー形式で保存され、あとから聞き返すこともできます。
      </Text>

      <Calendar
        markedDates={markedDates}
        onDayPress={day => setSelectedDate(day.dateString)}
        // 前月/次月も自動
      />

      {profile && !profile.is_paid && (
        <View style={{
          backgroundColor: canUsePremium ? '#fefefe' : '#fff8f6',
          borderColor: canUsePremium ? '#ccc' : '#faa',
          borderWidth: 1,
          borderRadius: 6,
          padding: 12,
          marginVertical: 20,
        }}>
          {canUsePremium ? (
            <>
              <Text style={{ fontSize: 14, color: '#444' }}>
                無料期間中（あと {getFreeDaysLeft(profile.created_at)} 日）です。
              </Text>
              <TouchableOpacity onPress={handlePurchase} style={{ marginTop: 10 }}>
                <Text style={{ color: '#007bff', fontWeight: 'bold' }}>
                  有料プランの詳細を見る
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 14, color: '#a00', marginBottom: 10 }}>
                無料期間は終了しました。有料登録が必要です。
              </Text>
              <TouchableOpacity onPress={handlePurchase}>
                <Text style={{ fontWeight: 'bold', color: '#000', backgroundColor: '#ffc107', padding: 8, borderRadius: 5 }}>
                  今すぐ登録する
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      <View style={styles.controls}>
        {recording ? (
          <TouchableOpacity
            style={[styles.button, isSaving && { backgroundColor: '#ccc' }]}
            onPress={stopRecording}
            disabled={isSaving}
          >
            <Ionicons name="stop" size={24} color="white" />
            <Text style={styles.buttonText}>
              {isSaving ? '保存中...' : '停止'}
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={startRecording}>
            <Ionicons name="mic" size={24} color="white" />
            <Text style={styles.buttonText}>録音</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.button} onPress={playRecording}>
          <Ionicons name="play" size={24} color="white" />
          <Text style={styles.buttonText}>再生</Text>
        </TouchableOpacity>
      </View>

      {uploadStatus !== '' && (
        <Text style={{ marginTop: 10, color: '#555', fontSize: 14 }}>{uploadStatus}</Text>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ alignSelf: 'center', marginVertical: 20 }}>
        <Text style={{ fontSize: 18, color: '#6a1b9a', textDecorationLine: 'underline' }}>マイページに戻る</Text>
      </TouchableOpacity>

      <View style={{ marginTop: 40, paddingBottom: 30, alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
          <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
            <Text style={styles.linkText}>利用規約</Text>
          </TouchableOpacity>
          <Text style={styles.separator}>{' | '}</Text>

          <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
            <Text style={styles.linkText}>プライバシーポリシー</Text>
          </TouchableOpacity>
          <Text style={styles.separator}>{' | '}</Text>

          <TouchableOpacity onPress={() => navigation.navigate('Legal')}>
            <Text style={styles.linkText}>特定商取引法に基づく表記</Text>
          </TouchableOpacity>
          <Text style={styles.separator}>{' | '}</Text>

          <TouchableOpacity onPress={() => navigation.navigate('Contact')}>
            <Text style={styles.linkText}>お問い合わせ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const getToday = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split('T')[0];
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 15, lineHeight: 22, color: '#333', marginBottom: 16 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  button: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', marginTop: 5 },
  linkText: { fontSize: 16, color: '#007bff', marginHorizontal: 2, textDecorationLine: 'underline' },
  separator: { fontSize: 16, color: '#666' },
});

export default DiaryScreen;
