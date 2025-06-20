import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
  StatusBar,
  SafeAreaView,
  Button,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../utils/config';
import { getUser } from '../utils/auth';

export default function ContactScreen() {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      setIsLoggedIn(!!user);
    };
    fetchUser();
  }, []);

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
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>📩 お問い合わせ</Text>

        <Text style={styles.label}>お名前：</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="お名前" />

        <Text style={styles.label}>メールアドレス：</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="メールアドレス"
          keyboardType="email-address"
        />

        <Text style={{ marginBottom: 12, color: '#333', fontSize: 15 }}>
          お問い合わせ内容をご記入ください。{"\n"}
          {"\n"}
          ※パスワードまたはメールアドレスをお忘れの方は、{"\n"}
          「パスワード再発行希望」と記載し、{"\n"}
          ご登録時の「ユーザー名・生年月日・都道府県」など{"\n"}
          覚えている限り、ご入力ください。{"\n"}
          確認でき次第、サポートよりご案内します。{"\n"}
        </Text>

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

        <View style={{ marginTop: 40, paddingBottom: 30, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
              <Text style={styles.linkText}>利用規約</Text>
            </TouchableOpacity>
            <Text style={styles.separator}> | </Text>

            <TouchableOpacity onPress={() => navigation.navigate('Privacy')}>
              <Text style={styles.linkText}>プライバシーポリシー</Text>
            </TouchableOpacity>
            <Text style={styles.separator}> | </Text>

            <TouchableOpacity onPress={() => navigation.navigate('Legal')}>
              <Text style={styles.linkText}>特定商取引法</Text>
            </TouchableOpacity>
            <Text style={styles.separator}> | </Text>

          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
    backgroundColor: '#fff',
  },
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
  linkText: {
    fontSize: 14,
    color: '#007bff',
    marginHorizontal: 2,
    minHeight: 24,
    textDecorationLine: 'underline',
  },
  separator: {
    fontSize: 16,
    color: '#666',
  },
});
