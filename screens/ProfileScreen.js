import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
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
} from 'react-native';

import { useFocusEffect } from '@react-navigation/native';
import { checkCanUsePremium, getFreeDaysLeft } from '../utils/premiumUtils';
import { getUser, logout } from '../utils/auth';
import { API_BASE_URL } from '../utils/config';  // ← パスが screens フォルダ内なら ../ が必要

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [canUsePremium, setCanUsePremium] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [hadProfile, setHadProfile] = useState(false); // 🔑 ログアウト済みかどうか
  const { setShowAuthStack } = useContext(AuthContext);

  useFocusEffect(
    React.useCallback(() => {
      getUser().then(data => {
        if (!data) {
          setLoggedIn(false);
          if (hadProfile) {
            setProfile({}); // ログアウト後
          } else {
            setProfile(null); // 未登録
          }
          return;
        }

        setLoggedIn(true);
        setHadProfile(true);

        (async () => {
          try {
            console.log('🟢 Fetching /api/profile …');
            const res = await fetch(`${API_BASE_URL}/api/profile`, {
              method: 'GET',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
            });
            console.log('🟢 profile status:', res.status);
            const data = await res.json();
            console.log('🟢 profile data:', data);

            if (!res.ok) {
              Alert.alert('認証エラー', data.error || 'プロフィール取得に失敗しました');
              setLoggedIn(false);
              setProfile({});
              return;
            }
            setProfile(data);
            const ok = checkCanUsePremium(data.created_at, data.is_paid, data.is_free_extended);
            setCanUsePremium(ok);
          } catch (err) {
            console.error('❌ profile fetch error:', err);
            Alert.alert('通信エラー', 'サーバーに接続できませんでした');
            setLoggedIn(false);
            setProfile({});
          }
        })();
      });
    }, [])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../assets/koekoekarte.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>
            {profile && profile.username ? `${profile.username}さんのマイページ` : 'マイページ'}
          </Text>
        </View>

        {loggedIn && profile && (
          <>
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

                <Text style={styles.label}>📅 登録日:</Text>
                <Text style={styles.value}>{profile.created_at?.slice(0, 10)}</Text>

                <Text style={styles.label}>🕛 最終記録日:</Text>
                <Text style={styles.value}>{profile.last_recorded || '記録なし'}</Text>

                <Text style={styles.label}>📊 基準スコア:</Text>
                <Text style={styles.value}>{profile.baseline || '—'} 点</Text>

                <Text style={styles.label}>📝 今日のスコア:</Text>
                <Text style={styles.value}>{profile.last_score ?? '—'} 点</Text>

                <Text style={styles.label}>📉 スコア差分:</Text>
                <Text style={styles.value}>{profile.score_deviation || '—'} 点</Text>
                </View>

            <View style={styles.statusBox}>
              {profile?.is_paid ? (
                <>
                  <Text style={{ color: 'green', fontSize: 16, fontWeight: 'bold' }}>💎 有料プランをご利用中です</Text>
                  <Text style={{ marginTop: 10, color: '#444' }}>
                    ストレススコアの取得、グラフの閲覧、プレミアム音源など全ての機能をご利用いただけます。
                  </Text>
                </>
              ) : getFreeDaysLeft(profile?.created_at) > 0 ? (
                <>
                  <Text style={{ color: '#000', fontSize: 16, fontWeight: 'bold' }}>🆓 現在は <Text style={{ color: '#007AFF' }}>無料プラン</Text> をご利用中です</Text>
                  <Text style={{ marginTop: 8, color: '#444' }}>
                    ⏳ 無料期間はあと <Text style={{ fontWeight: 'bold' }}>{getFreeDaysLeft(profile?.created_at)}</Text> 日で終了します。
                    無料期間終了後は録音・分析・グラフ機能に制限がかかります。
                  </Text>
                </>
              ) : (
                <>
                  <Text style={{ color: '#a00', fontSize: 16, fontWeight: 'bold' }}>⚠️ 無料期間は終了しました</Text>
                  <Text style={{ marginTop: 8, color: '#444' }}>
                    引き続きご利用いただくには、有料プラン（月額300円）へのご登録が必要です。
                  </Text>
                </>
              )}
            </View>

            <View style={{ marginTop: 20 }}>
              <Text style={styles.label}>🛠 各種設定</Text>
              <Text style={styles.link} onPress={() => navigation.navigate('EditProfile')}>✏️ プロフィール編集</Text>
              <Text style={styles.link} onPress={() => navigation.navigate('Terms')}>📃 利用規約</Text>
              <Text style={styles.link} onPress={() => navigation.navigate('Privacy')}>🔒 プライバシーポリシー</Text>
              <Text style={styles.link} onPress={() => navigation.navigate('Legal')}>📜 特定商取引法</Text>
              <Text style={styles.link} onPress={() => navigation.navigate('Contact')}>📩 お問い合わせ</Text>
            </View>

            <View style={{ marginTop: 40 }}>
              <Text
                style={{ color: 'red', textAlign: 'center', fontSize: 16 }}
                onPress={async () => {
                  await logout();
                  Alert.alert('ログアウトしました');
                  setShowAuthStack(true);
                }}
              >
                🚪 ログアウト
              </Text>
            </View>
          </>
        )}

        {!loggedIn && profile && (
          <>
            <View style={{ marginTop: 40 }}>
              <Text
                style={{ color: '#007AFF', textAlign: 'center', fontSize: 16 }}
                onPress={() => navigation.navigate('Login')}
              >
                🔓 ログインはこちら
              </Text>
              <Text
                style={{ color: '#007AFF', textAlign: 'center', fontSize: 16, marginTop: 20 }}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                🔑 パスワードを忘れた方はこちら
              </Text>
            </View>
          </>
        )}

        {!loggedIn && !profile && (
          <>
            <View style={{ marginTop: 40 }}>
              <Text
                style={{ color: '#007AFF', textAlign: 'center', fontSize: 16 }}
                onPress={() => navigation.navigate('Register')}
              >
                ▶ 新規登録はこちら
              </Text>
              <Text
                style={{ color: '#007AFF', textAlign: 'center', fontSize: 16, marginTop: 10 }}
                onPress={() => navigation.navigate('Login')}
              >
                🔓 ログインはこちら
              </Text>
              <Text
                style={{ color: '#007AFF', textAlign: 'center', fontSize: 16, marginTop: 20 }}
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                🔑 パスワードを忘れた方はこちら
              </Text>
            </View>
          </>
        )}
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
    fontSize: 24,
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
    color: '#444',
    fontSize: 17, 
  },
  value: {
    fontSize: 17,
    marginBottom: 6,
    color: '#000',
  },
  statusBox: {
    padding: 15,
    backgroundColor: '#fefefe',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 20,
  },
  link: {
    marginTop: 10,
    fontSize: 17,
    color: '#007AFF',
  },
});
