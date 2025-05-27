// ✅ ProfileScreen.js：マイページ画面（Web版情報とロゴ位置調整済）

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
  Alert
} from 'react-native'; // ← Alert も必要です（ログアウト後）

import { useFocusEffect } from '@react-navigation/native';
import { checkCanUsePremium } from '../utils/premiumUtils';
import { getUser, logout } from '../utils/auth'; // ← ✅ 修正ポイント

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [remainingDays, setRemainingDays] = useState(null);
  const [canUsePremium, setCanUsePremium] = useState(false);

useFocusEffect(
  React.useCallback(() => {
    getUser().then(data => {
      if (!data) {
        navigation.navigate('Login');
        return;
      }

      fetch('http://192.168.0.27:5000/api/profile', {
        credentials: 'include',
      })
        .then(async (res) => {
          const text = await res.text();

          try {
            const data = JSON.parse(text);
            setProfile(data);

            const ok = checkCanUsePremium(data.created_at, data.is_paid, data.is_free_extended);
            setCanUsePremium(ok);

            const created = new Date(data.created_at);
            const today = new Date();
            const diff = Math.floor((today - created) / (1000 * 60 * 60 * 24));
            setRemainingDays(5 - diff);
          } catch (err) {
            console.error("❌ JSON解析失敗:", err);
            console.error("📦 レスポンス内容:", text);
            navigation.navigate('Login'); // HTMLだった場合ログインへ
          }
        })
        .catch(err => {
          console.error("❌ プロフィール取得失敗:", err);
        });
    });
  }, [])
);

  if (!profile) {
    return <ActivityIndicator size="large" />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image source={require('../assets/koekoekarte.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.title}>🤵 マイページ</Text>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.label}>📧 メールアドレス:</Text>
          <Text>{profile.email}</Text>

          <Text style={styles.label}>📅 登録日:</Text>
          <Text>{profile.created_at?.slice(0, 10)}</Text>

          <Text style={styles.label}>🕛 最終記録日:</Text>
          <Text>{profile.last_recorded_at || '記録なし'}</Text>

          <Text style={styles.label}>📊 基準スコア:</Text>
          <Text>{profile.baseline || '—'} 点</Text>

          <Text style={styles.label}>📝 今日のスコア:</Text>
          <Text>{profile.today_score || '—'} 点</Text>

          <Text style={styles.label}>📉 スコア差分:</Text>
          <Text>{profile.score_deviation || '—'} 点</Text>
        </View>

        <View style={styles.statusBox}>
          {canUsePremium ? (
            <Text style={{ color: 'green' }}>✅ 利用可能です（無料 or 有料）</Text>
          ) : (
            <Text style={{ color: 'red' }}>‼️ 利用制限中（無料期間終了）</Text>
          )}
        </View>

        <View style={{ marginTop: 20 }}>
          <Text style={styles.label}>🛠 各種設定</Text>
          <Text style={styles.link} onPress={() => navigation.navigate('EditProfile')}>✏️ プロフィール編集</Text>
          <Text style={styles.link} onPress={() => navigation.navigate('Terms')}>📃 利用規約</Text>
          <Text style={styles.link} onPress={() => navigation.navigate('Privacy')}>🔒 プライバシーポリシー</Text>
          <Text style={styles.link} onPress={() => navigation.navigate('Legal')}>📜 特定商取引法</Text>
        </View>

        <View style={{ marginTop: 40 }}>
          <Text
            style={{ color: 'red', textAlign: 'center', fontSize: 16 }}
            onPress={async () => {
              await logout();
              Alert.alert('ログアウトしました');
              navigation.reset({
                index: 0,
                routes: [{ name: 'Register' }]
              });
            }}
          >
            🚪 ログアウト
          </Text>
        </View>
        
        {/* ✅ 新規登録リンク（ログインしていない場合のみ表示したいなら条件付きでもOK） */}
        <View style={{ marginTop: 40 }}>
          <Text
            style={{ color: '#007AFF', textAlign: 'center', fontSize: 16 }}
            onPress={() => navigation.navigate('Register')}
          >
            ▶ 新規登録はこちら
          </Text>
          <Text
            style={{ color: '#007AFF', textAlign: 'center', fontSize: 16 }}
            onPress={() => navigation.navigate('Login')}
          >
            🔓 ログインはこちら
          </Text>
        </View>
        <View style={{ marginTop: 30 }}>
          <Text
            style={{ color: '#007AFF', textAlign: 'center', fontSize: 16 }}
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            🔑 パスワードを忘れた方はこちら
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#fff'
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  infoBox: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fafafa',
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
