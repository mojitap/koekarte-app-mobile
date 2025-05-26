import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { checkCanUsePremium } from '../utils/premiumUtils';

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [remainingDays, setRemainingDays] = useState(null);
  const [canUsePremium, setCanUsePremium] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      fetch('http://192.168.0.27:5000/api/profile', { credentials: 'include' })
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

  if (!profile) return <Text>読み込み中...</Text>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={require('../assets/koekoekarte.png')} style={styles.logo} />

      <Text style={styles.title}>🤵 マイページ</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>📧 メールアドレス</Text>
        <Text style={styles.text}>{profile.email}</Text>

        <Text style={styles.label}>🗓 登録日</Text>
        <Text style={styles.text}>{profile.created_at?.slice(0, 10)}</Text>
      </View>

      <View style={[styles.noticeBox, canUsePremium ? styles.okBox : styles.alertBox]}>
        {canUsePremium ? (
          <Text style={styles.okText}>✅ 利用可能です（無料 or 有料）</Text>
        ) : (
          <Text style={styles.alertText}>❗ 利用制限中（無料期間終了）</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛠 各種設定</Text>
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
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoBox: {
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    marginBottom: 20,
  },
  label: {
    fontWeight: 'bold',
    marginTop: 10,
  },
  text: {
    marginBottom: 5,
  },
  noticeBox: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  okBox: {
    backgroundColor: '#e0f7e9',
  },
  alertBox: {
    backgroundColor: '#fff1f1',
  },
  okText: {
    color: 'green',
  },
  alertText: {
    color: 'red',
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 10,
  },
  link: {
    color: '#007AFF',
    marginBottom: 10,
  },
});
