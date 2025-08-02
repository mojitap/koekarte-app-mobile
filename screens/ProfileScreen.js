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

import { purchaseWithApple, purchaseWithGoogle } from '../utils/purchaseUtils';
import { useFocusEffect } from '@react-navigation/native';
import { checkCanUsePremium, getFreeDaysLeft } from '../utils/premiumUtils';
import { getUser, logout } from '../utils/auth';
import { API_BASE_URL } from '../utils/config';  // ← パスが screens フォルダ内なら ../ が必要
import { Linking, TouchableOpacity } from 'react-native';

function formatBirthdate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = ('0' + (date.getMonth() + 1)).slice(-2);
  const d = ('0' + date.getDate()).slice(-2);
  return `${y}-${m}-${d}`;
}

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [canUsePremium, setCanUsePremium] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [hadProfile, setHadProfile] = useState(false); // 🔑 ログアウト済みかどうか
  const { setShowAuthStack } = useContext(AuthContext);

  const defaultDate = profile?.birthdate
    ? formatBirthdate(profile.birthdate) // "1982-07-19"
    : '';

  const formatToJST = (isoString) => {
    if (!isoString) return '未設定';
    const date = new Date(isoString);
    const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000); // +9時間
    return jstDate.toISOString().slice(0, 10); // YYYY-MM-DD 形式
  };


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
                <Text style={styles.value}>{formatBirthdate(profile.birthdate)}</Text>

                <Text style={styles.label}>💼 職業：</Text>
                <Text style={styles.value}>{profile.occupation || '未設定'}</Text>

                <Text style={styles.label}>📅 登録日:</Text>
                <Text style={styles.value}>{formatToJST(profile.created_at)}</Text>

                <Text style={styles.label}>🕛 最終記録日:</Text>
                <Text style={styles.value}>{formatToJST(profile.last_recorded)}</Text>

                <Text style={styles.label}>📊 基準スコア:</Text>
                <Text style={styles.value}>{profile.baseline || '—'} 点</Text>

                <Text style={styles.label}>📝 今日のスコア:</Text>
                <Text style={styles.value}>{profile.last_score ?? '—'} 点</Text>

                <Text style={styles.label}>📉 スコア差分:</Text>
                <Text style={styles.value}>{profile.score_deviation || '—'} 点</Text>

                <Text style={styles.label}>📝 プロフィールを編集：</Text>
                <Text
                  style={[styles.value, { color: '#007bff', textDecorationLine: 'underline' }]}
                  onPress={() => navigation.navigate('EditProfile')}
                >
                  編集画面を開く
                </Text>
            </View>

            {profile && (
              profile.is_paid ? (
                <View style={{
                  backgroundColor: '#f0fff0',
                  borderColor: '#0a0',
                  borderWidth: 1,
                  borderRadius: 6,
                  padding: 12,
                  marginBottom: 20,
                }}>
                  <Text style={{ fontSize: 16, color: '#080' }}>
                    ✅ 有料会員です（自動継続中）
                  </Text>
                </View>
              ) : (
                <View style={{
                  backgroundColor: profile.can_use_premium ? '#fefefe' : '#fff8f6',
                  borderColor: profile.can_use_premium ? '#ccc' : '#faa',
                  borderWidth: 1,
                  borderRadius: 6,
                  padding: 12,
                  marginBottom: 20,
                }}>
                  {profile.can_use_premium ? (
                    <>
                      <Text style={{ fontSize: 14, color: '#444' }}>
                        ⏰ 無料期間中です（あと {getFreeDaysLeft(profile.created_at)} 日）。{"\n"}
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
              )
            )}

            {/* 利用規約などのリンク */}
            <View style={{ marginTop: 40, paddingBottom: 30, alignItems: 'center' }}>
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

            <View style={{ height: 40 }} />
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
