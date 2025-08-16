import { useTranslation } from 'react-i18next';
import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ScrollView,
  AppState,
  Image,
  SafeAreaView,
  StatusBar,
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

// ── ヘルパー関数はコンポーネント外 ──
const getToday = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().split('T')[0];
};

const DiaryScreen = ({ navigation }) => {
  // 1) state / ref / 定数 宣言
  const diaryDir            = FileSystem.documentDirectory + 'diary/';
  const [recordedDates, setRecordedDates] = useState({});
  const [markedDates,   setMarkedDates]   = useState({});
  const [selectedDate,  setSelectedDate]  = useState(getToday());
  const [recording,     setRecording]     = useState(null);
  const [sound,         setSound]         = useState(null);
  const [canUsePremium, setCanUsePremium] = useState(false);
  const [profile,       setProfile]       = useState(null);
  const [isSaving,      setIsSaving]      = useState(false);
  const [uploadStatus,  setUploadStatus]  = useState('');
  const [countdown,     setCountdown]     = useState(15);
  const { t, i18n } = useTranslation();
  const isJa = i18n.language?.startsWith('ja');

  const recordingTimeout  = useRef(null);
  const countdownInterval = useRef(null);
  const stoppingRef       = useRef(false);
  const { userProfile }   = useContext(AuthContext);

  // 2) 関数定義
  const getFilePath = date => {
    let path = `${diaryDir}${date}.m4a`;
    return path.startsWith('file://') ? path : 'file://' + path;
  };

  const loadDiaryFiles = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(diaryDir);
      const dots = {};
      for (const file of files) {
        const info = await FileSystem.getInfoAsync(diaryDir + file);
        if (info.size > 0) {
          const day = file.replace('.m4a', '');
          dots[day] = { marked: true, dotColor: 'blue' };
        }
      }
      setRecordedDates(dots);
    } catch (e) {
      console.log('loadDiaryFiles error:', e);
    }
  };

  const loadMarkedDates = async () => {
    try {
      const files = await FileSystem.readDirectoryAsync(diaryDir);
      const marks = {};
      files.forEach(f => {
        const day = f.replace('.m4a', '');
        marks[day] = { marked: true, dotColor: 'green', selectedColor: '#aef' };
      });
      setMarkedDates(marks);
    } catch (e) {
      console.log('loadMarkedDates error:', e);
    }
  };

  const saveDiaryRecording = async (uri, dateStr) => {
    const dest = `${diaryDir}${dateStr}.m4a`;
    await FileSystem.moveAsync({ from: uri, to: dest });
    loadMarkedDates();
  };

  const uploadToServer = async (fileUri, overwrite = true) => {
    try {
      const form = new FormData();
      form.append('audio_data', {
        uri: fileUri,
        name: 'diary.m4a',
        // iOSは audio/mp4, Androidは端末により audio/3gpp 等になることあり。汎用でOK。
        type: Platform.OS === 'ios' ? 'audio/mp4' : 'audio/mpeg',
      });

      const res = await fetch(
        `${API_BASE_URL}/api/upload?overwrite=${overwrite ? 'true' : 'false'}`,
        {
          method: 'POST',
          body: form,
          credentials: 'include', // ← Flask-Login セッションCookie同送
          // Content-Type は FormData が自動付与するので付けない！
        }
      );

      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || 'upload failed');
      return json.playback_url || json.audio_url || json.url || null;
    } catch (e) {
      console.log('uploadToServer error:', e);
      return null;
    }
  };

  const startActualRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert(t('diary.micDenied'));
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      setCountdown(15);
      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
      await rec.startAsync();
      setRecording(rec);

      countdownInterval.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownInterval.current);
            stopRecording();
            Alert.alert(t('diary.autoStopTitle'), t('diary.autoStopMessage'));
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (e) {
      Alert.alert(t('diary.saveError'), e.message);
    }
  };

  const startRecording = async () => {
    if (recording) {
      Alert.alert(
        t('diary.recordingInProgressTitle'),
        t('diary.recordingInProgressMessage')
      );
      return;
    }
    if (!canUsePremium) {
      Alert.alert(
        t('diary.usageLimitTitle'),
        t('diary.usageLimitMessage'),
        [
          { text: t('diary.subscribe'), onPress: () => handlePurchase() },
          { text: t('diary.cancel'), style: 'cancel' },
        ]
      );
      return;
    }

    // ── 日記ファイルの存在チェック ──
    const path = getFilePath(selectedDate);
    const info = await FileSystem.getInfoAsync(path);

    // 初回（exists===false）のときは何もしない
    if (info.exists && info.size > 0) {
      // 同日２回目なら上書き確認ダイアログを出す
      const ok = await new Promise(res =>
        Alert.alert(
          t('diary.overwriteTitle'),
          t('diary.overwriteMessage'),
          [
            { text: t('diary.cancel'), style: 'cancel', onPress: () => res(false) },
            { text: t('diary.overwrite'), onPress: () => res(true) },
          ],
          { cancelable: false }
        )
      );
      if (!ok) return;
    }

    // 上書きOK または 初回なら、実際の録音開始へ
    await startActualRecording();
  };

  const stopRecording = async () => {
    if (!recording || stoppingRef.current) return;
    stoppingRef.current = true;
    clearInterval(countdownInterval.current);

    try {
      setIsSaving(true);

      await recording.stopAndUnloadAsync();
      const uri  = recording.getURI();
      const dest = getFilePath(selectedDate);

      // 既存ファイルがあれば削除してから移動
      const ex = await FileSystem.getInfoAsync(dest);
      if (ex.exists) {
        await FileSystem.deleteAsync(dest, { idempotent: true });
      }

      // ① 端末ローカルに保存
      setUploadStatus(t('diary.saving'));
      await FileSystem.moveAsync({ from: uri, to: dest });
      setUploadStatus(t('diary.saved'));
      setRecording(null);
      loadDiaryFiles();

      // ② サーバーへアップロード（同日2回目は overwrite=true でOK）
      setUploadStatus(t('diary.uploading') || 'Uploading...');
      const serverUrl = await uploadToServer(dest, true);
      if (serverUrl) {
        setUploadStatus(t('diary.uploaded') || 'Uploaded');
      } else {
        setUploadStatus(t('diary.uploadFailed') || 'Upload failed');
      }
    } catch (e) {
      Alert.alert(t('diary.saveError'), e.message);
      setRecording(null);
    } finally {
      setIsSaving(false);
      stoppingRef.current = false;
    }
  };

  const playRecording = async (dateParam) => {
    try {
      const dateToUse = dateParam || selectedDate;
      const uri = getFilePath(dateToUse);
      const info = await FileSystem.getInfoAsync(uri);

      let playUri = null;

      if (info.exists && info.size > 0) {
        // ローカルがあればそれを再生
        playUri = uri;
      } else {
        // ローカルが無ければサーバーから（by-date API を使う）
        const res = await fetch(`${API_BASE_URL}/api/diary/by-date?date=${dateToUse}`, { credentials:'include' });
        const json = await res.json();
        if (json?.item?.playback_url) playUri = json.item.playback_url;
      }

      if (!playUri) {
        Alert.alert(t('diary.playError'), t('diary.noFileForThisDay'));
        return;
      }

      // 再生モードへ
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      if (sound) {
        await sound.stopAsync();
        await sound.unloadAsync();
        setSound(null);
      }
      const { sound: snd } = await Audio.Sound.createAsync({ uri: playUri });
      setSound(snd);
      await snd.playAsync();
    } catch (e) {
      Alert.alert(t('diary.playError'), e.message);
    }
  };

  const handlePurchase = async () => {
    try {
      Platform.OS === 'ios' ? await purchaseWithApple() : await purchaseWithGoogle();
    } catch (e) {
      Alert.alert(t('diary.purchaseFailed'), e.message)
    }
  };

  // 3) useEffect / useFocusEffect
  useEffect(() => {
    FileSystem.makeDirectoryAsync(diaryDir, { intermediates: true }).catch(() => {});
    loadDiaryFiles();
    // クリーンアップでは「再生用 sound」だけアンロード
    return () => {
      if (sound) {
        sound.unloadAsync().catch(() => {});
      }
    };
  }, []);

  useEffect(() => {
    getUser().then(u => {
      if (!u) return;
      fetch(`${API_BASE_URL}/api/profile`, { credentials: 'include' })
        .then(r => r.json())
        .then(d => { setCanUsePremium(d.can_use_premium); setProfile(d); })
        .catch(() => setCanUsePremium(false));
    });
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', next => {
      if ((next === 'background' || next === 'inactive') && recording) stopRecording();
    });
    return () => sub.remove();
  }, [recording]);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.stopAsync().catch(() => {});
        sound.unloadAsync().catch(() => {});
      }
    };
  }, [sound]);

  // 4) JSX
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Image source={require('../assets/koekoekarte.png')} style={styles.logo} />
        <Text style={styles.heading}>{t('diary.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        {/* ▼ ここから追加（または diary.description の代わりに） */}
        <Text style={styles.title}>{t('diary.voiceTitle')}</Text>
        <Text style={styles.description}>{t('diary.voiceIntro')}</Text>
        {/* ▲ ここまで追加 */}

        <Calendar
          monthFormat={t('diary.calendarMonthFormat')}
          markedDates={markedDates}
          onDayPress={day => { 
            setSelectedDate(day.dateString);
            // タップ＝即再生したい場合は↓を有効化
            // playRecording(day.dateString);
          }}
        />

        {profile && !profile.is_paid && (
          <View style={{
            backgroundColor: canUsePremium ? '#fefefe' : '#fff8f6',
            borderColor: canUsePremium ? '#ccc' : '#faa',
            borderWidth: 1, borderRadius: 6, padding: 12, marginVertical: 20,
          }}>
            {canUsePremium ? (
              <>
                {t('diary.premiumInfo', { days: getFreeDaysLeft(profile.created_at) })}
                <TouchableOpacity onPress={handlePurchase}>
                  <Text style={styles.link}>{t('diary.viewPremium')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity onPress={handlePurchase}>
                <Text style={styles.link}>{t('diary.subscribeNow')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {recording && <Text style={styles.countdown}>{t('diary.remaining', { seconds: countdown })}</Text>}

        <View style={styles.controls}>
          {recording ? (
            <TouchableOpacity onPress={stopRecording} style={styles.button}>
              <Ionicons name="stop" size={24} color="white" />
              <Text style={styles.btnText}>{isSaving ? t('diary.saving') : t('diary.stop')}</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={startRecording} style={styles.button}>
              <Ionicons name="mic" size={24} color="white" />
              <Text style={styles.btnText}>{t('diary.record')}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={playRecording} style={styles.button}>
            <Ionicons name="play" size={24} color="white" />
            <Text style={styles.btnText}>{t('diary.play')}</Text>
          </TouchableOpacity>
        </View>

        {uploadStatus !== '' && <Text style={styles.upload}>{uploadStatus}</Text>}

        <View style={styles.footer}>
          {[
            { key: 'terms',   screen: 'Terms'   },
            { key: 'privacy', screen: 'Privacy' },
            ...(isJa ? [{ key: 'legal', screen: 'Legal' }] : []),
            { key: 'contact', screen: 'Contact' },
          ].map((item, i, arr) => (
            <React.Fragment key={item.key}>
              <TouchableOpacity onPress={() => navigation.navigate(item.screen)}>
                <Text style={styles.linkText}>{t(`diary.${item.key}`)}</Text>
              </TouchableOpacity>
              {i < arr.length - 1 && <Text style={styles.sep}> | </Text>}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1, backgroundColor: '#fff',
    paddingTop: Platform.OS==='android' ? StatusBar.currentHeight : 0,
  },
  header: { alignItems:'center', marginBottom:8 },
  logo:   { width:80, height:80, marginBottom:8 },
  heading:{ fontSize:26,fontWeight:'bold' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  container:{ padding:20, paddingBottom:40 },
  description:{ fontSize:15, lineHeight:22, color:'#333', marginBottom:16 },
  countdown:{ fontSize:32, color:'#ff5722', textAlign:'center', marginTop:16 },
  controls:{ flexDirection:'row', justifyContent:'space-around', marginTop:20 },
  button:{ backgroundColor:'#3b82f6', padding:12, borderRadius:10, alignItems:'center' },
  btnText:{ color:'#fff', marginTop:5 },
  upload:{ marginTop:10, color:'#555', fontSize:14 },
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',        // ← 行を折り返す
    justifyContent: 'center',
    paddingBottom: 30,
    marginTop: 40,
    },
  linkText: {
    fontSize: 16,
    color: '#007bff',
    textDecorationLine: 'underline',
    marginHorizontal: 4,
    flexShrink: 1,            // ← 必要に応じて短くなる
    textAlign: 'center',      // ← 折り返し時に中央寄せ
    },
    sep: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 4,
    },
  link:{ color:'#007bff', fontWeight:'bold', marginTop:10 },
});

export default DiaryScreen;
