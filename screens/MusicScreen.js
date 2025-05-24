// ✅ MusicScreen.js：再生中の視認性改善（背景色変更・再生中マーク）

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Button,
  Alert,
  TouchableOpacity,
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
  const [playingLabel, setPlayingLabel] = useState(null);
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
    try {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
        setPlayingLabel(null);
      }

      const { sound } = await Audio.Sound.createAsync(audioFiles[label]);
      soundRef.current = sound;
      setPlayingLabel(label);
      await sound.playAsync();

      sound.setOnPlaybackStatusUpdate(status => {
        if (status.didJustFinish) {
          setPlayingLabel(null);
        }
      });
    } catch (e) {
      console.error("❌ 音源再生エラー:", e);
      Alert.alert("再生エラー", "音源を再生できませんでした");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>🎵 音源一覧</Text>
      {audioList.map((label, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.trackBox, playingLabel === label && styles.playingBox]}
          onPress={() => playSound(label)}
        >
          <Text style={styles.labelText}>{label}</Text>
          <Text style={styles.playText}>{playingLabel === label ? '▶️ 再生中' : '▶️ 再生'}</Text>
        </TouchableOpacity>
      ))}

      {!canUsePremium && (
        <Text style={styles.notice}>※ 無料期間が終了しているため、一部音源はご利用いただけません。</Text>
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
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  playingBox: {
    backgroundColor: '#e6f7ff',
  },
  labelText: {
    fontSize: 16,
  },
  playText: {
    fontSize: 14,
    color: '#007AFF',
  },
  notice: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
});
