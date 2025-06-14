import React, { useState, useContext } from 'react';
import {
  SafeAreaView, ScrollView, KeyboardAvoidingView,
  Text, TextInput, Alert, StyleSheet, Platform,
  StatusBar, TouchableOpacity, View
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { saveUser, logout } from '../utils/auth';
import { API_BASE_URL } from '../utils/config';
import { checkCanUsePremium } from '../utils/premiumUtils';
import { AuthContext } from '../context/AuthContext';

export default function LoginScreen() {
  const navigation = useNavigation();
  const { setShowAuthStack } = useContext(AuthContext);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]     = useState('');

  const handleLogin = async () => {
    if (!identifier || !password) {
      return Alert.alert('エラー','IDとパスワードを入力してください');
    }
    try {
      const res  = await fetch(`${API_BASE_URL}/api/login`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        credentials:'include',
        body: JSON.stringify({ email:identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        return Alert.alert('ログイン失敗', data.error || '認証エラー');
      }
      await saveUser(data);

      const pr  = await fetch(`${API_BASE_URL}/api/profile`, { credentials:'include' });
      const pd  = await pr.json();
      const ok  = checkCanUsePremium(pd.created_at, pd.is_paid, pd.is_free_extended);
      if (!ok) {
        await logout();
        return Alert.alert('利用不可','無料期間が終了しています');
      }

      // ここだけでOK。RootNavigatorがMainTabsを表示します
      setShowAuthStack(false);
      Alert.alert('ログイン成功','ようこそ！');
    } catch (err) {
      console.error(err);
      Alert.alert('通信エラー','サーバーに接続できませんでした');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS==='ios'?'padding':undefined}
        style={{flex:1}}
        keyboardVerticalOffset={Platform.OS==='ios'?44:0}
      >
        <ScrollView
          contentContainerStyle={{
            padding: 20,
            flexGrow: 1,
            paddingBottom: Platform.OS === 'android' ? 80 : 40, // ✅ ここにまとめる！
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ width: '100%', maxWidth: 360, alignSelf: 'center' }}>
            <Text style={styles.infoText}>『コエカルテ』は、声からストレス傾向を測定するセルフチェックアプリです。</Text>

            <Text style={styles.infoPoint}>🎤 録音するだけで「元気さ・活力」を数値化</Text>
            <Text style={styles.infoPoint}>📊 日々の変化をグラフで見える化</Text>
            <Text style={styles.infoPoint}>🎵 音楽でのメンタルケア機能つき</Text>

            <Text style={styles.subheading}>🌿 こんな方におすすめ</Text>
            <Text style={styles.bullet}>・気分の落ち込みや不安が増えた</Text>
            <Text style={styles.bullet}>・原因不明の不調が続いている</Text>
            <Text style={styles.bullet}>・メンタル変化を記録・振り返りたい</Text>

            <Text style={styles.subheading}>💬 ご利用中の方：</Text>
            <Text style={styles.bullet}>・療養中の方（うつ・PTSD・パニック障害など）</Text>
            <Text style={styles.bullet}>・ストレスの多い就活・仕事・育児・学業環境にある方</Text>
            <Text style={styles.bullet}>・「これはストレス？気のせい？」と感じる方</Text>

            <Text style={styles.subtext}>※ 本サービスは医療行為を目的としたものではありません。{"\n"}
            気になる症状がある方は専門機関へご相談ください。</Text>

            <View style={{ marginBottom: 8 }} />

            <Text style={styles.heading}>🔑 ログイン</Text>

            <TextInput style={styles.input} placeholder="メール or ユーザー名" autoCapitalize="none" value={identifier} onChangeText={setIdentifier} />
            <TextInput style={styles.input} placeholder="パスワード" secureTextEntry value={password} onChangeText={setPassword} />
            <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
              <Text style={styles.loginButtonText}>ログイン</Text>
            </TouchableOpacity>

            <Text style={styles.link} onPress={() => navigation.navigate('Register')}>▶ 新規登録はこちら</Text>

            <Text
              style={{ color: '#007AFF', marginTop: 20, textAlign: 'center' }}
              onPress={() => navigation.navigate('Contact')}
            >
              パスワードまたはメールアドレスを忘れた方はこちら
            </Text>

            <View style={styles.policyContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Text style={styles.policyLink} onPress={() => navigation.navigate('Terms')}>利用規約</Text>
                <Text style={styles.policySeparator}> | </Text>
                <Text style={styles.policyLink} onPress={() => navigation.navigate('Privacy')}>プライバシーポリシー</Text>
                <Text style={styles.policySeparator}> | </Text>
                <Text style={styles.policyLink} onPress={() => navigation.navigate('Legal')}>特定商取引法に基づく表記</Text>
              </View>
              <View style={{ marginTop: 6 }}>
                <Text style={styles.policyLink} onPress={() => navigation.navigate('Contact')}>お問い合わせ</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 44,
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
    fontSize: 18,
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
  policyContainer: {
    marginTop: 30,
    flexDirection: 'column',
    alignItems: 'center',
  },
  policyLink: {
    fontSize: 13,
    color: '#007AFF',
    marginHorizontal: 4,
  },
  policySeparator: {
    fontSize: 13,
    color: '#888',
  },
  infoPoint: {
    fontSize: 16,
    marginBottom: 6,
    color: '#444',
  },
  subheading: {
    fontSize: 17,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 6,
    color: '#333',
  },
  bullet: {
    fontSize: 15,
    color: '#444',
    marginLeft: 10,
    marginBottom: 4,
  },
  subtext: {
    fontSize: 13,
    color: '#777',
    marginTop: 12,
    marginBottom: 10,
    lineHeight: 18,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
});
