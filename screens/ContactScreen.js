import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../utils/config';

export default function ContactScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!name || !email || !message) {
      Alert.alert('入力エラー', 'すべての項目を入力してください。');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert('エラー', data.error || '送信に失敗しました');
        return;
      }

      Alert.alert('送信完了', 'お問い合わせ内容を受け付けました。');
      setName('');
      setEmail('');
      setMessage('');
    } catch (error) {
      console.error('送信エラー:', error);
      Alert.alert('通信エラー', '送信に失敗しました。ネットワークを確認してください。');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>📩 お問い合わせ</Text>

      <Text style={styles.label}>お名前：</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="お名前" />

      <Text style={styles.label}>メールアドレス：</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="メールアドレス" keyboardType="email-address" />

      <Text style={styles.label}>内容：</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={message}
        onChangeText={setMessage}
        placeholder="お問い合わせ内容"
        multiline
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>送信する</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Home' })}
      >
        <Text style={styles.backButtonText}>🏠 マイページに戻る</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    marginTop: 10,
    fontSize: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginTop: 5,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});
