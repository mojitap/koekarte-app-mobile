import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  Alert,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { checkCanUsePremium } from '../utils/premiumUtils';
import { Audio } from 'expo-av';

const audioFiles = {
  'ポジティブ': require('../assets/audio/free/free-positive.mp3'),
  'マインドフルネス': require('../assets/audio/free/free-mindfulness.mp3'),
  'リラクゼーション': require('../assets/audio/free/free-relaxation.mp3'),
  'ポジティブ1': require('../assets/audio/paid/positive1.mp3'),
  'ポジティブ2': require('../assets/audio/paid/positive2.mp3'),
  'ポジティブ3': require('../assets/audio/paid/positive3.mp3'),
  'ポジティブ4': require('../assets/audio/paid/positive4.mp3'),
  'ポジティブ5': require('../assets/audio/paid/positive5.mp3'),
  'リラックス1': require('../assets/audio/paid/relax1.mp3'),
  'リラックス2': require('../assets/audio/paid/relax2.mp3'),
  'リラックス3': require('../assets/audio/paid/relax3.mp3'),
  'リラックス4': require('../assets/audio/paid/relax4.mp3'),
  'リラックス5': require('../assets/audio/paid/relax5.mp3'),
  '瞑想1': require('../assets/audio/paid/mindfulness1.mp3'),
  '瞑想2': require('../assets/audio/paid/mindfulness2.mp3'),
  '瞑想3': require('../assets/audio/paid/mindfulness3.mp3'),
  '瞑想4': require('../assets/audio/paid/mindfulness4.mp3'),
  '瞑想5': require('../assets/audio/paid/mindfulness5.mp3'),
};

export default function MusicScreen() {
  const [canUsePremium, setCanUsePremium] = useState(false);
  const [audioList, setAudioList] = useState([]);
  const [nowPlaying, setNowPlaying] = useState(null);
  const soundRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      fetch('http://192.168.0.27:5000/api/profile', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          const ok = checkCanUsePremium(data.created_at, data.is_paid);
          setCanUsePremium(ok);
          if (ok) {
            setAudioList(Object.keys(audioFiles));
          } else {
            setAudioList(['ポジティブ', 'マインドフルネス', 'リラクゼーション']);
          }
        })
        .catch(err => {
          console.error("❌ プロフィール取得失敗:", err);
          setCanUsePremium(false);
          setAudioList(['ポジティブ', 'マインドフルネス', 'リラクゼーション']);
        });
    }, [])
  );

  const playSound = async (label) => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    try {
      const { sound } = await Audio.Sound.createAsync(audioFiles[label]);
      soundRef.current = sound;
      setNowPlaying(label);
      await sound.playAsync();
    } catch (e) {
      console.error("❌ 音源再生エラー:", e);
      Alert.alert("再生エラー", "音源を再生できませんでした");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>🎵 音源一覧</Text>

        {audioList.map((label, index) => (
          <View key={index} style={styles.trackBox}>
            <Text style={[styles.trackLabel, nowPlaying === label && styles.playing]}>
              {label}{nowPlaying === label ? '（再生中）' : ''}
            </Text>
            <Button title="▶️ 再生" onPress={() => playSound(label)} />
          </View>
        ))}

        {!canUsePremium && (
          <Text style={styles.notice}>
            ※ 無料期間が終了しているため、一部音源はご利用いただけません。
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  trackBox: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  trackLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  playing: {
    color: 'green',
    fontWeight: 'bold',
  },
  notice: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
});
