// ✅ MusicScreen.js（修正済み・再生制御あり）

import React, { useState, useRef, useEffect } from 'react';
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
import { purchaseWithApple, purchaseWithGoogle } from '../utils/purchaseUtils';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-audio';
import { getUser } from '../utils/auth';
import { API_BASE_URL } from '../utils/config';
import { checkCanUsePremium, getFreeDaysLeft } from '../utils/premiumUtils';
import { Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';

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
      { label: 'ポジティブ1', file: require('../assets/audio/paid/positive1.mp3'), isPremium: true },
      { label: 'ポジティブ2', file: require('../assets/audio/paid/positive2.mp3'), isPremium: true },
      { label: 'ポジティブ3', file: require('../assets/audio/paid/positive3.mp3'), isPremium: true },
      { label: 'ポジティブ4', file: require('../assets/audio/paid/positive4.mp3'), isPremium: true },
      { label: 'ポジティブ5', file: require('../assets/audio/paid/positive5.mp3'), isPremium: true },
    ],
  },
  'リラックス': {
    tracks: [
      { label: 'リラックス1', file: require('../assets/audio/paid/relax1.mp3'), isPremium: true },
      { label: 'リラックス2', file: require('../assets/audio/paid/relax2.mp3'), isPremium: true },
      { label: 'リラックス3', file: require('../assets/audio/paid/relax3.mp3'), isPremium: true },
      { label: 'リラックス4', file: require('../assets/audio/paid/relax4.mp3'), isPremium: true },
      { label: 'リラックス5', file: require('../assets/audio/paid/relax5.mp3'), isPremium: true },
    ],
  },
  '瞑想': {
    tracks: [
      { label: '瞑想1', file: require('../assets/audio/paid/mindfulness1.mp3'), isPremium: true },
      { label: '瞑想2', file: require('../assets/audio/paid/mindfulness2.mp3'), isPremium: true },
      { label: '瞑想3', file: require('../assets/audio/paid/mindfulness3.mp3'), isPremium: true },
      { label: '瞑想4', file: require('../assets/audio/paid/mindfulness4.mp3'), isPremium: true },
      { label: '瞑想5', file: require('../assets/audio/paid/mindfulness5.mp3'), isPremium: true },
    ],
  },
};

export default function MusicScreen() {
  const [canUsePremium, setCanUsePremium] = useState(null);
  const [profile, setProfile] = useState(null);
  const [expandedGroup, setExpandedGroup] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const soundRef = useRef(null);
  const navigation = useNavigation();

  const playSound = async (track) => {
    if (canUsePremium !== true && track.isPremium) {
      Alert.alert("🔒 有料音源", "この音源は有料プラン専用です。プランをご確認ください。");
      return;
    }

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

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: false,
            staysActiveInBackground: false,
            playsInSilentModeIOS: true,
            shouldDuckAndroid: true,
            playThroughEarpieceAndroid: false,
          });

          const user = await getUser();
          if (!user) return;

          const res = await fetch(`${API_BASE_URL}/api/profile`, { credentials: 'include' });
          const data = await res.json();

          console.log("🎵 MusicScreen の profile データ:", data);
          const ok = checkCanUsePremium(data.created_at, data.is_paid, data.is_free_extended);
          console.log("🟢 checkCanUsePremium:", ok);

          setCanUsePremium(data.can_use_premium);
          setProfile(data);
        } catch (e) {
          console.error("❌ MusicScreen useFocusEffect エラー:", e);
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

  const toggleGroup = (group) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedGroup(group === expandedGroup ? null : group);
  };

  const stopSound = async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
      setCurrentTrack(null);
    }
  };

  const [daysLeft, setDaysLeft] = useState(null);

  useEffect(() => {
    if (profile) {
      setCanUsePremium(profile.can_use_premium);
      setDaysLeft(getFreeDaysLeft(profile.created_at));
    }
  }, [profile]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 20, alignItems: 'center' }}
      >
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

        <View style={{ height: 16 }} />

        {Object.entries(audioGroups).map(([group, { tracks }]) => {
          if (canUsePremium === false && group !== '無料') return null;
          if (canUsePremium === null && group !== '無料') return null;
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

        {/* 利用規約などのリンク */}
        {canUsePremium !== null && !profile?.is_paid && (
          <View style={{
            backgroundColor: canUsePremium ? '#fefefe' : '#fff8f6',
            borderColor: canUsePremium ? '#ccc' : '#faa',
            borderWidth: 1,
            borderRadius: 6,
            padding: 12,
            marginBottom: 20,
          }}>
            {canUsePremium && daysLeft !== null ? (
              <>
                <Text style={{ fontSize: 14, color: '#444' }}>
                  ⏰ 無料期間中です（あと {daysLeft} 日）。{"\n"}
                  終了後は録音やグラフなどの機能に制限がかかります。
                </Text>
                <TouchableOpacity
                  onPress={handlePurchase}
                  style={{
                    marginTop: 10,
                    backgroundColor: '#e0f0ff',
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 5,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text style={{ fontWeight: 'bold', color: '#007bff' }}>
                    🎟 有料プランの詳細を見る
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontSize: 14, color: '#a00', marginBottom: 10 }}>
                  ⚠️ 無料期間は終了しました。有料登録が必要です。
                </Text>
                <TouchableOpacity
                  onPress={handlePurchase}
                  style={{
                    backgroundColor: '#ffc107',
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 5,
                    alignSelf: 'flex-start',
                  }}
                >
                  <Text style={{ fontWeight: 'bold', color: '#000' }}>
                    🎟 今すぐ登録する
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
              <Text style={styles.linkText}>利用規約</Text>
            </TouchableOpacity>
            <Text style={styles.separator}>{" | "}</Text>

            <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
              <Text style={styles.linkText}>プライバシーポリシー</Text>
            </TouchableOpacity>
            <Text style={styles.separator}>{" | "}</Text>

            <TouchableOpacity onPress={() => navigation.navigate('Legal')}>
              <Text style={styles.linkText}>特定商取引法</Text>
            </TouchableOpacity>
            <Text style={styles.separator}>{" | "}</Text>

            <TouchableOpacity onPress={() => navigation.navigate('Contact')}>
              <Text style={styles.linkText}>お問い合わせ</Text>
            </TouchableOpacity>
          </View>
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
    fontSize: 18,
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  groupTitle: {
    fontSize: 20,
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
    marginBottom: 16,
  },
  noticeText: {
    color: '#a00',
    fontSize: 16,
    textAlign: 'center',
  },
  linkText: {
    fontSize: 18,
    color: '#007bff',
    marginHorizontal: 2,
    textDecorationLine: 'underline',
  },
  separator: {
    fontSize: 16,
    color: '#666',
  },
});
