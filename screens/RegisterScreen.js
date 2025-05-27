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
  SafeAreaView,
  Modal,
  Pressable,
  Platform,
  StatusBar
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { saveUser } from '../utils/auth';

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

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showPrefPicker, setShowPrefPicker] = useState(false);

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

      await saveUser(data);

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

        <Pressable onPress={() => setShowDatePicker(true)} style={styles.input}>
          <Text>{form.birthdate || '生年月日を選択'}</Text>
        </Pressable>
        <Modal visible={showDatePicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <DateTimePicker
                value={form.birthdate ? new Date(form.birthdate) : new Date(2000, 0, 1)}
                mode="date"
                display="spinner"
                locale="ja-JP"
                onChange={(event, selectedDate) => {
                  if (selectedDate) {
                    const iso = selectedDate.toISOString().split('T')[0];
                    setForm({ ...form, birthdate: iso });
                  }
                }}
              />
              <Button title="決定" onPress={() => setShowDatePicker(false)} />
            </View>
          </View>
        </Modal>

        <Pressable onPress={() => setShowGenderPicker(true)} style={styles.input}>
          <Text>{form.gender || '性別を選択'}</Text>
        </Pressable>
        <Modal visible={showGenderPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Picker
                selectedValue={form.gender}
                onValueChange={value => setForm({ ...form, gender: value })}
              >
                <Picker.Item label="未選択" value="" />
                <Picker.Item label="男性" value="男性" />
                <Picker.Item label="女性" value="女性" />
                <Picker.Item label="その他" value="その他" />
              </Picker>
              <Button title="決定" onPress={() => setShowGenderPicker(false)} />
            </View>
          </View>
        </Modal>

        <TextInput
          style={styles.input}
          placeholder="職業"
          onChangeText={(text) => setForm({ ...form, occupation: text })}
        />

        <Pressable onPress={() => setShowPrefPicker(true)} style={styles.input}>
          <Text>{form.prefecture || '都道府県を選択'}</Text>
        </Pressable>
        <Modal visible={showPrefPicker} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Picker
                selectedValue={form.prefecture}
                onValueChange={value => setForm({ ...form, prefecture: value })}
              >
                <Picker.Item label="未選択" value="" />
                {['北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
                  '新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県','静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県','奈良県','和歌山県',
                  '鳥取県','島根県','岡山県','広島県','山口県','徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県','熊本県','大分県','宮崎県','鹿児島県','沖縄県'
                 ].map(pref => (
                  <Picker.Item key={pref} label={pref} value={pref} />
                ))}
              </Picker>
              <Button title="決定" onPress={() => setShowPrefPicker(false)} />
            </View>
          </View>
        </Modal>

        <View style={{ marginTop: 30 }}>
          <Button title="登録する" onPress={handleSubmit} />
        </View>

        <Text style={{ marginTop: 30, color: '#007AFF', textAlign: 'center' }} onPress={() => navigation.navigate('Login')}>
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
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
});
