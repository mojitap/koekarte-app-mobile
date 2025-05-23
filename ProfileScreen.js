import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, ActivityIndicator } from 'react-native';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [remainingDays, setRemainingDays] = useState(null);

  useEffect(() => {
    fetch('http://192.168.0.27:5000/api/profile', {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data);
        const created = new Date(data.created_at);
        const today = new Date();
        const diff = Math.floor((today - created) / (1000 * 60 * 60 * 24));
        setRemainingDays(5 - diff);
      })
      .catch(err => {
        console.error("❌ プロフィール取得失敗:", err);
      });
  }, []);

  if (!profile) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>🤵 マイページ</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>📧 メールアドレス:</Text>
        <Text>{profile.email}</Text>

        <Text style={styles.label}>登録日:</Text>
        <Text>{profile.created_at?.slice(0, 10)}</Text>
      </View>

      <View style={styles.statusBox}>
        {profile.is_paid ? (
          <Text style={{ color: 'green' }}>✅ 有料プラン（¥300/月）をご利用中</Text>
        ) : remainingDays > 0 ? (
          <Text style={{ color: 'orange' }}>🕒 無料期間 残り {remainingDays} 日</Text>
        ) : (
          <Text style={{ color: 'red' }}>‼️ 無料期間は終了しました</Text>
        )}
      </View>

      {/* 🔁 他の画面への遷移 */}
      <View style={{ marginTop: 20 }}>
        <Button title="音楽ページへ" onPress={() => navigation.navigate('Music')} />
        <Button title="利用規約" onPress={() => navigation.navigate('Terms')} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoBox: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  label: {
    marginTop: 10,
    fontWeight: 'bold',
  },
  statusBox: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
});