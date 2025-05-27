// screens/RegisterScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView  // ✅ これを追加！
} from 'react-native';

import { saveUser } from '../utils/auth';  // ✅ 追加

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    birthdate: '',
    gender: '',
    occupation: '',
    prefecture: ''
  });

  const handleSubmit = async () => {
    try {
      const res = await fetch('http://192.168.0.27:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        Alert.alert('登録エラー', data.error || '登録に失敗しました');
        return;
      }

      await saveUser(data);  // ✅ ユーザー情報をローカルに保存

      Alert.alert('登録成功', 'ようこそ！', [
        { text: 'OK', onPress: () => navigation.navigate('Main', { screen: 'Home' }) },
      ]);
    } catch (err) {
      console.error('❌ 登録通信エラー:', err);
      Alert.alert('通信エラー', 'ネットワーク接続を確認してください');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>📩 新規登録</Text>

        <TextInput
          style={styles.input}
          placeholder="メールアドレス"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={(text) => setForm({ ...form, email: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="ニックネーム"
          onChangeText={(text) => setForm({ ...form, username: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="パスワード"
          secureTextEntry
          onChangeText={(text) => setForm({ ...form, password: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="生年月日（YYYY-MM-DD）"
          onChangeText={(text) => setForm({ ...form, birthdate: text })}
        //>
        <TextInput
          style={styles.input}
          placeholder="性別"
          onChangeText={(text) => setForm({ ...form, gender: text })}
        //>
        <TextInput
          style={styles.input}
          placeholder="職業"
          onChangeText={(text) => setForm({ ...form, occupation: text })}
        //>
        <TextInput
          style={styles.input}
          placeholder="都道府県"
          onChangeText={(text) => setForm({ ...form, prefecture: text })}
        //>
        <View style={{ marginTop: 20 }}>
          <Button title="登録する" onPress={handleSubmit} />
        </View>

        <Text style={styles.link} onPress={() => navigation.navigate('Login')}>
          ▶ すでにアカウントをお持ちの方
        </Text>
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
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    padding: 10,
    marginBottom: 15,
    borderRadius: 5,
  },
  link: {
    marginTop: 20,
    color: '#007AFF',
    textAlign: 'center',
  },
});
