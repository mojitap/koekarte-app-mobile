// MusicScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { checkCanUsePremium } from '../utils/premiumUtils';
import { Audio } from 'expo-av';

const audioFiles = {
  'free1.mp3': require('../assets/audio/free/free-positive.mp3'),
  'free2.mp3': require('../assets/audio/free/free-mindfulness.mp3'),
  'free3.mp3': require('../assets/audio/free/free-relaxation.mp3'),
  'positive1.mp3': require('../assets/audio/paid/positive1.mp3'),
  'positive2.mp3': require('../assets/audio/paid/positive2.mp3'),
  'positive3.mp3': require('../assets/audio/paid/positive3.mp3'),
  'positive4.mp3': require('../assets/audio/paid/positive4.mp3'),
  'positive5.mp3': require('../assets/audio/paid/positive5.mp3'),
  'relax1.mp3': require('../assets/audio/paid/relax1.mp3'),
  'relax2.mp3': require('../assets/audio/paid/relax2.mp3'),
  'relax3.mp3': require('../assets/audio/paid/relax3.mp3'),
  'relax4.mp3': require('../assets/audio/paid/relax4.mp3'),
  'relax5.mp3': require('../assets/audio/paid/relax5.mp3'),
  'mindfulness1.mp3': require('../assets/audio/paid/mindfulness1.mp3'),
  'mindfulness2.mp3': require('../assets/audio/paid/mindfulness2.mp3'),
  'mindfulness3.mp3': require('../assets/audio/paid/mindfulness3.mp3'),
  'mindfulness4.mp3': require('../assets/audio/paid/mindfulness4.mp3'),
  'mindfulness5.mp3': require('../assets/audio/paid/mindfulness5.mp3'),
};

export default function MusicScreen() {
  const [canUsePremium, setCanUsePremium] = useState(false);
  const [audioList, setAudioList] = useState([]);
  const soundRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      fetch('http://192.168.0.27:5000/api/profile', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          const ok = checkCanUsePremium(data.created_at, data.is_paid);
          setCanUsePremium(ok);
          if (ok) {
            setAudioList([
              'positive1.mp3', 'positive2.mp3', 'positive3.mp3',
              'relax1.mp3', 'relax2.mp3', 'relax3.mp3',
              'mindfulness1.mp3', 'mindfulness2.mp3', 'mindfulness3.mp3'
            ]);
          } else {
            setAudioList(['free1.mp3', 'free2.mp3']);
          }
        })
        .catch(err => {
          console.error("❌ プロフィール取得失敗:", err);
          setCanUsePremium(false);
          setAudioList(['free1.mp3', 'free2.mp3']);
        });
    }, [])
  );

  const playSound = async (file) => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
    try {
      const { sound } = await Audio.Sound.createAsync(audioFiles[file]);
      soundRef.current = sound;
      await sound.playAsync();
    } catch (e) {
      console.error("❌ 音源再生エラー:", e);
      Alert.alert("再生エラー", "音源を再生できませんでした");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>🎵 音源一覧</Text>
      {audioList.map((file, index) => (
        <View key={index} style={styles.trackBox}>
          <Text>{file}</Text>
          <Button title="再生" onPress={() => playSound(file)} />
        </View>
      ))}
      {!canUsePremium && (
        <Text style={{ color: 'red', marginTop: 20 }}>※ 無料期間が終了しているため、一部音源はご利用いただけません。</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  trackBox: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
});
