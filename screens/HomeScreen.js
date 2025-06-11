import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { checkCanUsePremium } from '../utils/premiumUtils';
import { API_BASE_URL } from '../utils/config';  // ← パスが screens フォルダ内なら ../ が必要

export default function HomeScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [remainingDays, setRemainingDays] = useState(null);
  const [canUsePremium, setCanUsePremium] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetch(`${API_BASE_URL}/api/profile`, {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          setProfile(data);
          const ok = checkCanUsePremium(data.created_at, data.is_paid, data.is_free_extended);
          setCanUsePremium(ok);

          const created = new Date(data.created_at);
          const today = new Date();
          const diff = Math.floor((today - created) / (1000 * 60 * 60 * 24));
          setRemainingDays(5 - diff);
        })
        .catch(err => {
          console.error("❌ プロフィール取得失敗:", err);
        });
    }, [])
  );

  if (!profile) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>
      　 {profile.username ? `${profile.username}さんのマイページ` : 'マイページ'}
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>📧 メールアドレス：</Text>
        <Text style={styles.value}>{profile.email}</Text>

        <Text style={styles.label}>🏠 地域：</Text>
        <Text style={styles.value}>{profile.prefecture || '未設定'}</Text>

        <Text style={styles.label}>👤 性別：</Text>
        <Text style={styles.value}>{profile.gender || '未設定'}</Text>

        <Text style={styles.label}>🎂 生年月日：</Text>
        <Text style={styles.value}>{profile.birthdate || '未設定'}</Text>

        <Text style={styles.label}>💼 職業：</Text>
        <Text style={styles.value}>{profile.occupation || '未設定'}</Text>

        <Text style={styles.label}>登録日:</Text>
        <Text>{profile.created_at?.slice(0, 10)}</Text>

        <Text style={styles.label}>📝 今日のスコア:</Text>
        <Text>{profile.last_score ?? '—'} 点</Text>
      </View>

      <View style={styles.statusBox}>
        {canUsePremium ? (
          <Text style={{ color: 'green' }}>✅ 利用可能です（無料 or 有料）</Text>
        ) : (
          <Text style={{ color: 'red' }}>‼️ 利用制限中（無料期間終了）</Text>
        )}
      </View>

      <View style={{ marginTop: 20 }}>
        <Button title="録音" onPress={() => navigation.navigate('Record')} />
        <Button title="グラフ" onPress={() => navigation.navigate('Chart')} />
        <Button title="スコア履歴" onPress={() => navigation.navigate('History')} />
        <Button title="プロフィール編集" onPress={() => navigation.navigate('EditProfile')} />
        <Button title="利用規約" onPress={() => navigation.navigate('Terms')} />
        <Button title="プライバシーポリシー" onPress={() => navigation.navigate('Privacy')} />
        <Button title="特定商取法" onPress={() => navigation.navigate('Legal')} />
        <Button title="音源" onPress={() => navigation.navigate('Music')} />
        <Button title="📩 お問い合わせ" onPress={() => navigation.navigate('Contact')} />
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
    marginTop: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#444',
  },
  value: {
    fontSize: 16,
    marginBottom: 6,
    color: '#000',
  },
  statusBox: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
});
