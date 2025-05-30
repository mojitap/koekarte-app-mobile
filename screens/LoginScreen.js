import React, { useState } from 'react';
import {
  SafeAreaView,
  View, Text, TextInput,
  Button, Alert,
  StyleSheet, Platform, StatusBar
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { saveUser } from '../utils/auth';
import { API_BASE_URL } from '../utils/config';  // ← パスが screens フォルダ内なら ../ が必要

export default function LoginScreen() {
  const navigation = useNavigation();
  const [identifier, setIdentifier] = useState('');  // メール or ユーザー名
  const [password,   setPassword]   = useState('');

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

      // ── 認証成功 ──
      await saveUser(data);

      // ✅ 正しい画面遷移：Mainタブの中の Home（マイページ）に飛ばす
      navigation.navigate('Main', { screen: 'Home' });

      Alert.alert('ログイン成功', 'ようこそ！');
      
    } catch (err) {
      console.error('❌ ログイン通信エラー:', err);
      Alert.alert('通信エラー', 'サーバーに接続できませんでした');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
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

        <Button title="ログイン" onPress={handleLogin} />

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
  },
  heading: {
    fontSize: 24, fontWeight: 'bold', marginBottom: 30, textAlign: 'center'
  },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10,
    borderRadius: 5, marginBottom: 20,
  },
  link: {
    color: '#007AFF', marginTop: 15, textAlign: 'center'
  },
});
