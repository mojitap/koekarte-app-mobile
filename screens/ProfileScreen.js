// ProfileScreen.js（マイページ）- タブメニュー優先に変更

import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { checkCanUsePremium } from '../utils/premiumUtils';

export default function ProfileScreen() {
  const [profile, setProfile] = useState(null);
  const [remainingDays, setRemainingDays] = useState(null);
  const [canUsePremium, setCanUsePremium] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetch('http://192.168.0.27:5000/api/profile', {
        credentials: 'include'
      })
        .then(res => res.json())
        .then(data => {
          setProfile(data);
          const ok = checkCanUsePremium(data.created_at, data.is_paid);
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
      <Text style={styles.heading}>🤵 マイページ</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>📧 メールアドレス:</Text>
        <Text>{profile.email}</Text>

        <Text style={styles.label}>登録日:</Text>
        <Text>{profile.created_at?.slice(0, 10)}</Text>
      </View>

      <View style={styles.statusBox}>
        {canUsePremium ? (
          <Text style={{ color: 'green' }}>✅ 利用可能です（無料 or 有料）</Text>
        ) : (
          <Text style={{ color: 'red' }}>‼️ 利用制限中（無料期間終了）</Text>
        )}
      </View>

      {/* 規約・編集系のみ表示（録音・グラフ・音源はタブに任せる） */}
      <View style={{ marginTop: 20 }}>
        <Text style={styles.label}>🔧 各種設定</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('EditProfile')}>✏️ プロフィール編集</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Terms')}>📃 利用規約</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Privacy')}>🔒 プライバシーポリシー</Text>
        <Text style={styles.link} onPress={() => navigation.navigate('Legal')}>📜 特定商取引法</Text>
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
  link: {
    marginTop: 10,
    fontSize: 16,
    color: '#007AFF',
  },
});
