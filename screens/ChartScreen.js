// screens/ChartScreen.js（修正済み ChartScreen コンポーネント）
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { checkCanUsePremium, getFreeDaysLeft } from '../utils/premiumUtils';
import ScoreChart from './ScoreChart';
import { getUser } from '../utils/auth';
import { useNavigation } from '@react-navigation/native';
import { API_BASE_URL } from '../utils/config';
import { TouchableOpacity } from 'react-native';
import { Linking } from 'react-native';

export default function ChartScreen({ route }) {
  const navigation = useNavigation();
  const [canUsePremium, setCanUsePremium] = useState(false);
  const [range, setRange] = useState('all');
  const [profile, setProfile] = useState(null);

  useFocusEffect(
    React.useCallback(() => {
      getUser().then(user => {
        if (!user) {
          Alert.alert("ログインが必要です", "", [
            { text: "OK", onPress: () => navigation.navigate('Login') }
          ]);
          return;
        }

        fetch(`${API_BASE_URL}/api/profile`, {
          credentials: 'include',
        })
          .then(res => res.json())
          .then(data => {
            const { created_at, is_paid, is_free_extended } = data;
            const ok = checkCanUsePremium(created_at, is_paid, is_free_extended);
            setCanUsePremium(ok);
            setProfile(data);
          })
          .catch((err) => {
            console.error('❌ プロフィール取得失敗:', err);
            setCanUsePremium(false);
          });
      });
    }, [])
  );

  if (!profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ paddingTop: 100, alignItems: 'center' }}>
          <Text>📊 プロフィールを取得中です…</Text>
        </View>
      </SafeAreaView>
    );
  }

  const daysLeft = profile?.created_at ? getFreeDaysLeft(profile.created_at) : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Image
            source={require('../assets/koekoekarte.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.heading}>📈 ストレススコアの推移</Text>
        </View>

        <Text style={styles.description}>
          ※ スコアは「声の元気さ・活力」を数値化したものです。{"\n"}
          数値が高いほど、ストレスが少ない（調子が良い）傾向を示します。{"\n"}
          登録初期5回の平均（ベースライン）と比較することで、日々の変化がわかります。
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 20 }}>
          {[
            { label: 'すべて', value: 'all' },
            { label: '先月以前', value: 'past' },
            { label: '今月', value: 'month' },
            { label: '直近1週間', value: 'week' },
          ].map((item) => (
            <TouchableOpacity
              key={item.value}
              onPress={() => setRange(item.value)}
              style={{
                paddingVertical: 6,
                paddingHorizontal: 16,
                borderRadius: 20,
                backgroundColor: range === item.value ? '#007AFF' : '#eee',
              }}
            >
              <Text style={{ color: range === item.value ? '#fff' : '#333', fontSize: 16 }}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScoreChart range={range} profile={profile} />
        
        {/* 利用規約などのリンク */}
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

            <TouchableOpacity onPress={() => navigation.navigate('Contact')}>
              <Text style={styles.linkText}>お問い合わせ</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 18,
    color: '#444',
    lineHeight: 22,
    marginBottom: 20,
  },
  linkText: {
    fontSize: 12,
    color: '#007bff',
    marginHorizontal: 2,
    textDecorationLine: 'underline',
  },
  separator: {
    fontSize: 12,
    color: '#666',
  },
});
