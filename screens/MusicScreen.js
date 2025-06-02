// ✅ MusicScreen.js（整理済み・説明文＋制限メッセージの条件表示あり）

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
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { getUser } from '../utils/auth';
import { API_BASE_URL } from '../utils/config';
import { checkCanUsePremium } from '../utils/premiumUtils';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const audioGroups = {
  '無料': {
    tracks: [
      { label: 'ポジティブ', file: require('../assets/audio/free/free-positive.mp3') },
      { label: 'マインドフルネス', file: require('../assets/audio/free/free-mindfulness.mp3') },
      { label: 'リラクゼーション', file: require('../assets/audio/free/free-relaxation.mp3') },
    ],
  },
  'ポジティブ': {
    tracks: [
      { label: 'ポジティブ1', file: require('../assets/audio/paid/positive1.mp3') },
      { label: 'ポジティブ2', file: require('../assets/audio/paid/positive2.mp3') },
      { label: 'ポジティブ3', file: require('../assets/audio/paid/positive3.mp3') },
      { label: 'ポジティブ4', file: require('../assets/audio/paid/positive4.mp3') },
      { label: 'ポジティブ5', file: require('../assets/audio/paid/positive5.mp3') },
    ],
  },
  'リラックス': {
    tracks: [
      { label: 'リラックス1', file: require('../assets/audio/paid/relax1.mp3') },
      { label: 'リラックス2', file: require('../assets/audio/paid/relax2.mp3') },
      { label: 'リラックス3', file: require('../assets/audio/paid/relax3.mp3') },
      { label: 'リラックス4', file: require('../assets/audio/paid/relax4.mp3') },
      { label: 'リラックス5', file: require('../assets/audio/paid/relax5.mp3') },
    ],
  },
  '瞑想': {
    tracks: [
      { label: '瞑想1', file: require('../assets/audio/paid/mindfulness1.mp3') },
      { label: '瞑想2', file: require('../assets/audio/paid/mindfulness2.mp3') },
      { label: '瞑想3', file: require('../assets/audio/paid/mindfulness3.mp3') },
      { label: '瞑想4', file: require('../assets/audio/paid/mindfulness4.mp3') },
      { label: '瞑想5', file: require('../assets/audio/paid/mindfulness5.mp3') },
    ],
  },
};

export default function MusicScreen() {
  const [canUsePremium, setCanUsePremium] = useState(false);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const soundRef = useRef(null);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const user = await getUser();
          if (!user) return;
          const res = await fetch(`${API_BASE_URL}/api/profile`, { credentials: 'include' });
          const data = await res.json();
          setCanUsePremium(checkCanUsePremium(data.created_at, data.is_paid, data.is_free_extended));
        } catch (e) {
          setCanUsePremium(false);
        }
      })();

      return () => {
        if (soundRef.current) {
          soundRef.current.stopAsync();
          soundRef.current.unloadAsync();
          soundRef.current = null;
          setCurrentTrack(null);
        }
      };
    }, [])
  );

  const toggleGroup = (group) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGroup(group === expandedGroup ? null : group);
  };

  const playSound = async (track) => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      }
      const { sound } = await Audio.Sound.createAsync(track.file, { volume: 1.0 });
      soundRef.current = sound;
      await sound.playAsync();
      setCurrentTrack(track.label);
    } catch (e) {
      console.error("❌ 再生失敗:", e);
      Alert.alert("再生エラー", "音源を再生できませんでした\n" + e.message);
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
        <Image source={require('../assets/koekoekarte.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.heading}>🎧 音源を選択</Text>

        <Text style={styles.description}>
          🎵 音声からだけでなく、音楽でも心のケアを。{"\n"}
          コエカルテでは、心の状態や目的に合わせた音源もご用意しています。録音やスコア記録とあわせてご活用ください。{"\n\n"}
          ・リラックス：緊張や不安をほぐし、副交感神経を促進{"\n"}
          ・整える・集中：思考を整え、注意を安定させる音{"\n"}
          ・気分を上げる：明るく前向きなメロディで活力をサポート{"\n\n"}
          ※音源は個人の目的や好みに応じて自由に選んでご利用いただけます。
        </Text>

        {!canUsePremium && (
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              💡 無料期間は登録日から5日間です。{"\n"}
              無料期間が終了すると以下の機能はご利用いただけません：{"\n\n"}
              ・録音とスコア分析{"\n"}
              ・全18曲の音源再生{"\n\n"}
              ご利用には有料プラン（月額300円）への移行が必要です。
            </Text>
          </View>
        )}

        {Object.entries(audioGroups).map(([group, { tracks }]) => {
          if (!canUsePremium && group !== '無料') return null;
          return (
            <View key={group} style={{ marginBottom: 20 }}>
              <TouchableOpacity onPress={() => toggleGroup(group)}>
                <Text style={styles.groupTitle}>{group} {expandedGroup === group ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {expandedGroup === group && tracks.map(track => (
                <View key={track.label} style={styles.trackBox}>
                  <Text style={track.label === currentTrack ? styles.playingLabel : styles.label}>
                    {track.label}{track.label === currentTrack ? '（再生中）' : ''}
                  </Text>
                  <Button title="▶️ 再生" onPress={() => playSound(track)} />
                  {track.label === currentTrack && (
                    <Button title="⏹️ 停止" color="red" onPress={stopSound} />
                  )}
                </View>
              ))}
            </View>
          );
        })}
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
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    color: '#555',
    lineHeight: 20,
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
  },
  trackBox: {
    marginTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
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
  noticeBox: {
    backgroundColor: '#fff5f5',
    borderWidth: 1,
    borderColor: '#faa',
    borderRadius: 6,
    padding: 15,
    marginTop: 30,
  },
  noticeText: {
    color: '#a00',
    fontSize: 14,
    textAlign: 'center',
  },
});
