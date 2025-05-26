// screens/ForgotPasswordScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert('入力エラー', 'メールアドレスを入力してください');
      return;
    }

    try {
      const res = await fetch('http://192.168.0.27:5000/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        Alert.alert('送信エラー', data.error || '送信に失敗しました');
        return;
      }

      Alert.alert('送信完了', '再設定メールを送信しました', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (err) {
      console.error('❌ 通信エラー:', err);
      Alert.alert('通信エラー', 'ネットワーク接続を確認してください');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🔑 パスワード再設定</Text>
        <Text style={styles.description}>
          ご登録のメールアドレスを入力してください。
          パスワード再設定用のリンクをお送りします。
        </Text>

        <TextInput
          style={styles.input}
          placeholder="メールアドレス"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={setEmail}
          value={email}
        />

        <Button title="送信する" onPress={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
});
