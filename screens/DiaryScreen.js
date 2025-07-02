import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { purchaseWithApple, purchaseWithGoogle } from '../utils/purchaseUtils';
import { getUser } from '../utils/auth';
import { getFreeDaysLeft } from '../utils/premiumUtils';
import { API_BASE_URL } from '../utils/config';

const DiaryScreen = () => {
  const { userProfile } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [recordedDates, setRecordedDates] = useState({});
  const [canUsePremium, setCanUsePremium] = useState(false);
  const [profile, setProfile] = useState(null);

  const diaryDir = FileSystem.documentDirectory + 'diary/';

  useEffect(() => {
    FileSystem.makeDirectoryAsync(diaryDir, { intermediates: true }).catch(() => {});
    loadDiaryFiles();
    return () => sound && sound.unloadAsync();
  }, []);

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

  const getFilePath = (date) => `${diaryDir}${date}.m4a`;

  const loadDiaryFiles = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(diaryDir);
      const dots = {};
      files.forEach(file => {
        const date = file.replace('.m4a', '');
        dots[date] = { marked: true, dotColor: 'blue' };
      });
      setRecordedDates(dots);
    } catch (e) {
      console.log('読み込みエラー', e);
    }
  };

  const startRecording = async () => {
    if (!canUsePremium) {
      Alert.alert(
        '利用制限',
        '無料期間は終了しました。有料プラン（月額300円）に登録すると録音が可能になります。',
        [
          {
            text: '有料登録する',
            onPress: () => handlePurchase(),
          },
          { text: 'キャンセル', style: 'cancel' },
        ]
      );
      return;
    }

    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      Alert.alert('録音エラー', err.message);
    }
  };

  const stopRecording = async () => {
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      const newPath = getFilePath(selectedDate);
      await FileSystem.moveAsync({ from: uri, to: newPath });
      setRecording(null);
      loadDiaryFiles();
    } catch (err) {
      Alert.alert('保存エラー', err.message);
    }
  };

  const playRecording = async () => {
    try {
      const filePath = getFilePath(selectedDate);
      const { sound } = await Audio.Sound.createAsync({ uri: filePath });
      setSound(sound);
      await sound.playAsync();
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
    <View style={styles.container}>
      <Text style={styles.title}>音声日記</Text>

      <Text style={styles.description}>
        「今日ちょっと疲れたかも…」そんな気持ち、文字じゃなくて「声」で残してみませんか？{"\n\n"}
        コエカルテの音声日記は、毎日15秒の声を記録できる機能です。{"\n"}
        録音はカレンダー形式で保存され、あとから聞き返すこともできます。
      </Text>

      <Calendar
        markedDates={{ ...recordedDates, [selectedDate]: { selected: true, selectedColor: 'orange' } }}
        onDayPress={(day) => setSelectedDate(day.dateString)}
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
                ⏰ 無料期間中（あと {getFreeDaysLeft(profile.created_at)} 日）です。
              </Text>
              <TouchableOpacity onPress={handlePurchase} style={{ marginTop: 10 }}>
                <Text style={{ color: '#007bff', fontWeight: 'bold' }}>
                  🎟 有料プランの詳細を見る
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={{ fontSize: 14, color: '#a00', marginBottom: 10 }}>
                ⚠️ 無料期間は終了しました。有料登録が必要です。
              </Text>
              <TouchableOpacity onPress={handlePurchase}>
                <Text style={{ fontWeight: 'bold', color: '#000', backgroundColor: '#ffc107', padding: 8, borderRadius: 5 }}>
                  🎟 今すぐ登録する
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}

      <View style={styles.controls}>
        {recording ? (
          <TouchableOpacity style={styles.button} onPress={stopRecording}>
            <Ionicons name="stop" size={24} color="white" />
            <Text style={styles.buttonText}>停止</Text>
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
    </View>
  );
};

const getToday = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  description: { fontSize: 15, lineHeight: 22, color: '#333', marginBottom: 16 },
  controls: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  button: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', marginTop: 5 },
});

export default DiaryScreen;
