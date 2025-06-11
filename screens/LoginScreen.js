import React, { useState, useContext } from 'react';
import {
  SafeAreaView,
  View, Text, TextInput,
  Button, Alert,
  StyleSheet, Platform, StatusBar,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { saveUser, logout } from '../utils/auth';
import { API_BASE_URL } from '../utils/config';
import { checkCanUsePremium } from '../utils/premiumUtils';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const { setShowAuthStack } = useContext(AuthContext); 

  const handleLogin = async () => {
    if (!identifier || !password) {
      return Alert.alert('エラー', 'ID（メールまたはユーザー名）とパスワードを入力してください');
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: identifier, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        return Alert.alert('ログイン失敗', data.error || 'IDまたはパスワードが間違っています');
      }

      await saveUser(data);

      const profileRes = await fetch(`${API_BASE_URL}/api/profile`, {
        credentials: 'include',
      });
      const profileData = await profileRes.json();

      const ok = checkCanUsePremium(
        profileData.created_at,
        profileData.is_paid,
        profileData.is_free_extended
      );

      if (!ok) {
        await logout();
        return Alert.alert('利用不可', '無料期間が終了しています');
      }

      setShowAuthStack(false);
      Alert.alert('ログイン成功', 'ようこそ！');

    } catch (err) {
      console.error('❌ ログイン通信エラー:', err);
      Alert.alert('通信エラー', 'サーバーに接続できませんでした');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.infoText}>
          『コエカルテ』は、声からストレス傾向を測定するセルフチェックアプリです。{"\n"}

          録音するだけで、あなたの「元気さ・活力」を数値化します。
        </Text>

        <Text style={styles.heading}>🔑 ログイン</Text>

        <TextInput
          style={styles.input}
          placeholder="メール or ユーザー名"
          autoCapitalize="none"
          value={identifier}
          onChangeText={setIdentifier}
        />
        <TextInput
          style={styles.input}
          placeholder="パスワード"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <Text style={styles.loginButtonText}>ログイン</Text>
        </TouchableOpacity>

        <Text style={styles.link} onPress={() => navigation.navigate('Register')}>
          ▶ 新規登録はこちら
        </Text>

        <Text style={styles.link} onPress={() => navigation.navigate('ForgotPassword')}>
          🔑 パスワード再設定
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,  
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,     // ✅ ボタン文字を大きく
    fontWeight: 'bold',
    textAlign: 'center',
  },
  link: {
    color: '#007AFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 12,
  },
  infoText: {
    fontSize: 23,
    color: '#555',
    marginBottom: 20,
    textAlign: 'left',
    lineHeight: 24,
  },
});
