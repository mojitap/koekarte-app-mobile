// ✅ MusicScreen.js 改善版（ラベル改善 + 無料誘導文 + 再生中強調 + 有料説明）

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
  Image
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { checkCanUsePremium } from '../utils/premiumUtils';
import { Audio } from 'expo-av';
import { getUser } from '../utils/auth';

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
     let isActive = true;

     // データ取得などは副作用で
     (async () => {
       try {
         const user = await getUser();
         if (!user) {
           Alert.alert("ログインが必要です", "", [
             { text: "OK", onPress: () => navigation.navigate('Login') }
           ]);
           return;
         }

         const res = await fetch('http://192.168.0.12:5000/api/profile', {
           credentials: 'include',
         });
         const data = await res.json();

         if (isActive) {
           const ok = checkCanUsePremium(data.created_at, data.is_paid, data.is_free_extended);
           setCanUsePremium(ok);
           const freeTracks = ['ポジティブ', 'マインドフルネス', 'リラクゼーション'];
           setAudioList(ok ? Object.keys(audioFiles) : freeTracks);
         }
       } catch (err) {
         console.error("❌ プロフィール取得失敗:", err);
         if (isActive) {
           setCanUsePremium(false);
           setAudioList(['ポジティブ', 'マインドフルネス', 'リラクゼーション']);
         }
       }
     })();

     // 🎯 画面から離れた時に音声を止める
     return () => {
       isActive = false;
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
          <Text style={styles.heading}>🎧 無料で聴ける音源</Text>
          <Text style={styles.description}>
            以下の音源は、無料でいつでもご利用いただけます。
            有料プランにご登録いただくと、さらに15曲の音源が再生可能になります。
          </Text>
        </View>

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
          <View style={styles.noticeBox}>
            <Text style={styles.noticeText}>
              🔒 無料期間が終了しています。有料プラン（月額300円）に登録すると、18曲の全音源が聴けるようになります。
            </Text>
            <Button title="🎟 有料プランに登録する" onPress={() => Alert.alert('ご案内', 'Web版よりご登録ください')} />
          </View>
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
  description: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
    lineHeight: 20,
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
    marginBottom: 10,
    textAlign: 'center',
  },
});
