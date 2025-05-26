// screens/RegisterScreen.js

import React, { useState } from 'react';
import {
  View, Text, TextInput, Button, StyleSheet, ScrollView, Alert
} from 'react-native';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    birthdate: '',
    gender: '',
    occupation: '',
    prefecture: '',
  });

  const handleRegister = () => {
    fetch('http://192.168.0.27:5000/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    })
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          Alert.alert('エラー', data.error);
        } else {
          Alert.alert('登録完了', 'ようこそ！ログインしました');
          navigation.navigate('Home');
        }
      })
      .catch(() => {
        Alert.alert('通信エラー', '登録に失敗しました');
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>新規登録</Text>

      <TextInput placeholder="メールアドレス" style={styles.input}
        value={form.email} onChangeText={t => setForm({ ...form, email: t })} />
      <TextInput placeholder="ユーザー名" style={styles.input}
        value={form.username} onChangeText={t => setForm({ ...form, username: t })} />
      <TextInput placeholder="パスワード" secureTextEntry style={styles.input}
        value={form.password} onChangeText={t => setForm({ ...form, password: t })} />

      {/* 他の項目も順次追加（生年月日、性別など） */}

      <Button title="登録" onPress={handleRegister} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#ccc', padding: 10,
    marginBottom: 10, borderRadius: 5
  },
});
