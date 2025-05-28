import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  Button,
  Alert,
  Modal,
  Pressable,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { saveUser } from '../utils/auth';

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

  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showPrefPicker, setShowPrefPicker] = useState(false);
  const [showBirthPicker, setShowBirthPicker] = useState(false);

  const [selectedYear, setSelectedYear] = useState('2000');
  const [selectedMonth, setSelectedMonth] = useState('01');
  const [selectedDay, setSelectedDay] = useState('01');

  const handleSubmit = async () => {
    const birthdate = `${selectedYear}-${selectedMonth}-${selectedDay}`;
    try {
      const res = await fetch('http://192.168.0.16:5000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, birthdate }),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('登録エラー', data.error || '登録に失敗しました');
        return;
      }
      await saveUser(data);
      Alert.alert('登録成功', 'ようこそ！', [
        {
          text: 'OK',
          onPress: () =>
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main', params: { screen: 'Home' } }],
            }),
        },
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
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="ニックネーム"
          value={form.username}
          onChangeText={(text) => setForm({ ...form, username: text })}
        />
        <TextInput
          style={styles.input}
          placeholder="パスワード"
          secureTextEntry
          value={form.password}
          onChangeText={(text) => setForm({ ...form, password: text })}
        />

        {/* 生年月日 */}
        <Pressable onPress={() => setShowBirthPicker(true)} style={styles.input}>
          <Text>{form.birthdate || '生年月日を選択'}</Text>
        </Pressable>
        <Modal visible={showBirthPicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={selectedYear}
                onValueChange={(v) => setSelectedYear(v)}
                style={styles.picker}
                itemStyle={{ color: '#000' }}
              >
                {[...Array(100)].map((_, i) => {
                  const year = (2024 - i).toString();
                  return <Picker.Item key={year} label={year} value={year} />;
                })}
              </Picker>
              <Picker
                selectedValue={selectedMonth}
                onValueChange={(v) => setSelectedMonth(v)}
                style={styles.picker}
                itemStyle={{ color: '#000' }}
              >
                {[...Array(12)].map((_, i) => {
                  const month = String(i + 1).padStart(2, '0');
                  return <Picker.Item key={month} label={month} value={month} />;
                })}
              </Picker>
              <Picker
                selectedValue={selectedDay}
                onValueChange={(v) => setSelectedDay(v)}
                style={styles.picker}
                itemStyle={{ color: '#000' }}
              >
                {[...Array(31)].map((_, i) => {
                  const day = String(i + 1).padStart(2, '0');
                  return <Picker.Item key={day} label={day} value={day} />;
                })}
              </Picker>
              <Button
                title="決定"
                onPress={() => {
                  const date = `${selectedYear}-${selectedMonth}-${selectedDay}`;
                  setForm({ ...form, birthdate: date });
                  setShowBirthPicker(false);
                }}
              />
            </View>
          </View>
        </Modal>

        {/* 性別 */}
        <Pressable onPress={() => setShowGenderPicker(true)} style={styles.input}>
          <Text>{form.gender || '性別を選択'}</Text>
        </Pressable>
        <Modal visible={showGenderPicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.gender}
                onValueChange={(value) => setForm({ ...form, gender: value })}
                style={styles.picker}
                itemStyle={{ color: '#000' }}
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
          value={form.occupation}
          onChangeText={(text) => setForm({ ...form, occupation: text })}
        />

        {/* 都道府県 */}
        <Pressable onPress={() => setShowPrefPicker(true)} style={styles.input}>
          <Text>{form.prefecture || '都道府県を選択'}</Text>
        </Pressable>
        <Modal visible={showPrefPicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={form.prefecture}
                onValueChange={(value) => setForm({ ...form, prefecture: value })}
                style={styles.picker}
                itemStyle={{ color: '#000' }}
              >
                <Picker.Item label="未選択" value="" />
                {[
                  '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県','茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
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

        <View style={styles.submitContainer}>
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
  picker: {
    width: '100%',
    height: 100,
  },
  pickerContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    margin: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitContainer: {
    marginTop: 30,
  },
  link: {
    marginTop: 30,
    color: '#007AFF',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});
