import React, { useEffect, useState, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { AuthContext } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const DiaryScreen = () => {
  const { userProfile } = useContext(AuthContext);
  const canUsePremium = userProfile?.can_use_premium;
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [recording, setRecording] = useState(null);
  const [sound, setSound] = useState(null);
  const [recordedDates, setRecordedDates] = useState({});

  const diaryDir = FileSystem.documentDirectory + 'diary/';

  useEffect(() => {
    FileSystem.makeDirectoryAsync(diaryDir, { intermediates: true }).catch(() => {});
    loadDiaryFiles();
    return () => sound && sound.unloadAsync();
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

  if (!canUsePremium) {
    return (
      <View style={styles.restrictedBox}>
        <Text style={styles.restrictedText}>音声日記は有料プランでご利用いただけます。</Text>
        <TouchableOpacity>
          <Text style={styles.link}>有料プランに登録する</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>音声日記</Text>
      <Calendar
        markedDates={{ ...recordedDates, [selectedDate]: { selected: true, selectedColor: 'orange' } }}
        onDayPress={(day) => setSelectedDate(day.dateString)}
      />
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
  controls: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 },
  button: { backgroundColor: '#3b82f6', padding: 12, borderRadius: 10, alignItems: 'center' },
  buttonText: { color: '#fff', marginTop: 5 },
  restrictedBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  restrictedText: { fontSize: 16, textAlign: 'center', marginBottom: 10 },
  link: { color: '#007AFF', textDecorationLine: 'underline' },
});

export default DiaryScreen;