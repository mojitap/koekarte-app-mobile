import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import { Audio } from 'expo-av';

const freeTracks = [
  { title: 'Free - Positive', file: require('../assets/audio/free/free-positive.mp3') },
  { title: 'Free - Mindfulness', file: require('../assets/audio/free/free-mindfulness.mp3') },
  { title: 'Free - Relaxation', file: require('../assets/audio/free/free-relaxation.mp3') },
];

const paidTracks = [
  { title: 'Premium - Positive 1', file: require('../assets/audio/paid/positive1.mp3') },
  { title: 'Premium - Positive 2', file: require('../assets/audio/paid/positive2.mp3') },
  { title: 'Premium - Relax 1', file: require('../assets/audio/paid/relax1.mp3') },
  { title: 'Premium - Relax 2', file: require('../assets/audio/paid/relax2.mp3') },
  { title: 'Premium - Relax 3', file: require('../assets/audio/paid/relax3.mp3') },
  { title: 'Premium - Relax 4', file: require('../assets/audio/paid/relax4.mp3') },
  { title: 'Premium - Relax 5', file: require('../assets/audio/paid/relax5.mp3') },
  { title: 'Premium - Positive 3', file: require('../assets/audio/paid/positive3.mp3') },
  { title: 'Premium - Positive 4', file: require('../assets/audio/paid/positive4.mp3') },
  { title: 'Premium - Positive 5', file: require('../assets/audio/paid/positive5.mp3') },
  { title: 'Premium - Mindfulness 1', file: require('../assets/audio/paid/mindfulness1.mp3') },
  { title: 'Premium - Mindfulness 2', file: require('../assets/audio/paid/mindfulness2.mp3') },
  { title: 'Premium - Mindfulness 3', file: require('../assets/audio/paid/mindfulness3.mp3') },
  { title: 'Premium - Mindfulness 4', file: require('../assets/audio/paid/mindfulness4.mp3') },
  { title: 'Premium - Mindfulness 5', file: require('../assets/audio/paid/mindfulness5.mp3') },
];

export default function MusicScreen() {
  const [sound, setSound] = useState(null);
  const [canUsePremium, setCanUsePremium] = useState(false);

  useEffect(() => {
    fetch('http://192.168.0.27:5000/api/profile', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        const created = new Date(data.created_at);
        const today = new Date();
        const diff = Math.floor((today - created) / (1000 * 60 * 60 * 24));
        const free = diff < 5;
        setCanUsePremium(data.is_paid || free);
      });
  }, []);

  const playSound = async (track) => {
    if (sound) await sound.unloadAsync();
    const { sound: newSound } = await Audio.Sound.createAsync(track);
    setSound(newSound);
    await newSound.playAsync();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: 'bold' }}>🎵 無料音源</Text>
      {freeTracks.map((t, i) => (
        <View key={i} style={{ marginVertical: 10 }}>
          <Button title={t.title} onPress={() => playSound(t.file)} />
        </View>
      ))}

      <Text style={{ fontSize: 22, fontWeight: 'bold', marginTop: 30 }}>🔒 プレミアム音源</Text>
      {canUsePremium ? (
        paidTracks.map((t, i) => (
          <View key={i} style={{ marginVertical: 10 }}>
            <Button title={t.title} onPress={() => playSound(t.file)} />
          </View>
        ))
      ) : (
        <Text style={{ color: 'gray' }}>※有料プランか、無料期間中のみ再生可能です</Text>
      )}
    </ScrollView>
  );
}