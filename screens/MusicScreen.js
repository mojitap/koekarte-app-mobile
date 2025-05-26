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
import { Image } from 'react-native';

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
  const [currentTrack, setCurrentTrack] = useState(null);
  const soundRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      fetch('http://192.168.0.27:5000/api/profile', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          const ok = checkCanUsePremium(data.created_at, data.is_paid, data.is_free_extended);
          setCanUsePremium(ok);
          const freeTracks = ['ポジティブ', 'マインドフルネス', 'リラクゼーション'];
          setAudioList(ok ? Object.keys(audioFiles) : freeTracks);
        })
        .catch(err => {
          console.error("❌ プロフィール取得失敗:", err);
          setCanUsePremium(false);
          setAudioList(['ポジティブ', 'マインドフルネス', 'リラクゼーション']);
        });

      return () => {
        // ⏹️ 画面離脱時に音を止める
        if (soundRef.current) {
          soundRef.current.stopAsync();
          soundRef.current.unloadAsync();
          soundRef.current = null;
          setCurrentTrack(null);
        }
      };
    }, [])
  );

  const playSound = async (label) => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      const { sound } = await Audio.Sound.createAsync(audioFiles[label]);
      soundRef.current = sound;
      await sound.playAsync();
      setCurrentTrack(label);
    } catch (e) {
      console.error("❌ 音源再生エラー:", e);
      Alert.alert("再生エラー", "音源を再生できませんでした");
    }
  };

  const stopSound = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setCurrentTrack(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image source={require('../assets/koekoekarte.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.heading}>🎵 音源一覧</Text>
        </View>

        {/* 音源リスト */}
        {audioList.map((label, index) => (
          <View key={index} style={styles.trackBox}>
            <Text style={label === currentTrack ? styles.playingLabel : styles.label}>
              {label}{label === currentTrack ? '（再生中）' : ''}
            </Text>
            <Button title="▶️ 再生" onPress={() => playSound(label)} />
            {label === currentTrack && (
              <Button title="⏹️ 停止" color="red" onPress={stopSound} />
            )}
          </View>
        ))}

        {!canUsePremium && (
          <Text style={styles.notice}>※ 無料期間が終了しているため、一部音源はご利用いただけません。</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  trackBox: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  playingLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: 'green',
    fontWeight: 'bold',
  },
  notice: {
    color: 'red',
    marginTop: 20,
    textAlign: 'center',
  },
});
