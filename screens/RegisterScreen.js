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
import { saveUser, logout } from '../utils/auth';
import { API_BASE_URL } from '../utils/config';
import { checkCanUsePremium } from '../utils/premiumUtils';

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
  const [showBirthPicker, setShowBirthPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showPrefPicker, setShowPrefPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert('登録エラー', data.error || '登録に失敗しました');
        return;
      }

      // 登録成功 → 保存
      await saveUser(data);

      // 🔍 プロフィール取得 → プレミアム利用可否チェック
      const profileRes = await fetch(`${API_BASE_URL}/api/profile`, {
        credentials: 'include',
      });
      const profileData = await profileRes.json();

      const ok = checkCanUsePremium(
        profileData.created_at,
        profileData.is_paid,
        profileData.is_free_extended
      );

      if (!ok) {
        await logout();
        return Alert.alert('利用不可', '無料期間が終了しています');
      }

      // ✅ 利用可能 → メイン画面へ遷移
      Alert.alert('登録成功', 'ようこそ！', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Main' }],
            });
          }
        }
      ]);
      
    } catch (err) {
      console.error('❌ 登録通信エラー:', err);
      Alert.alert('通信エラー', 'ネットワーク接続を確認してください');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>📩 新規登録</Text>

        <TextInput style={styles.input} placeholder="メールアドレス" keyboardType="email-address" autoCapitalize="none"
          value={form.email} onChangeText={text => setForm({ ...form, email: text })} />
        <TextInput style={styles.input} placeholder="ニックネーム"
          value={form.username} onChangeText={text => setForm({ ...form, username: text })} />
        <TextInput style={styles.input} placeholder="パスワード" secureTextEntry
          value={form.password} onChangeText={text => setForm({ ...form, password: text })} />

        {/* 生年月日 Picker */}
        <Pressable onPress={() => setShowBirthPicker(true)} style={styles.input}>
          <Text>{form.birthdate || '生年月日を選択'}</Text>
        </Pressable>
        <Modal visible={showBirthPicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <View style={styles.pickerRow}>
                <Picker selectedValue={selectedYear} onValueChange={setSelectedYear} style={styles.pickerColumn}>
                  {[...Array(100)].map((_, i) => {
                    const year = (2024 - i).toString();
                    return <Picker.Item key={year} label={year} value={year} />;
                  })}
                </Picker>
                <Picker selectedValue={selectedMonth} onValueChange={setSelectedMonth} style={styles.pickerColumn}>
                  {[...Array(12)].map((_, i) => {
                    const month = String(i + 1).padStart(2, '0');
                    return <Picker.Item key={month} label={month} value={month} />;
                  })}
                </Picker>
                <Picker selectedValue={selectedDay} onValueChange={setSelectedDay} style={styles.pickerColumn}>
                  {[...Array(31)].map((_, i) => {
                    const day = String(i + 1).padStart(2, '0');
                    return <Picker.Item key={day} label={day} value={day} />;
                  })}
                </Picker>
              </View>
              <Button title="決定" onPress={() => {
                const date = `${selectedYear}-${selectedMonth}-${selectedDay}`;
                setForm({ ...form, birthdate: date });
                setShowBirthPicker(false);
              }} />
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
              <Picker selectedValue={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })} style={styles.picker}>
                <Picker.Item label="未選択" value="" />
                <Picker.Item label="男性" value="男性" />
                <Picker.Item label="女性" value="女性" />
                <Picker.Item label="その他" value="その他" />
              </Picker>
              <Button title="決定" onPress={() => setShowGenderPicker(false)} />
            </View>
          </View>
        </Modal>

        {/* 職業 */}
        <TextInput style={styles.input} placeholder="職業"
          value={form.occupation} onChangeText={text => setForm({ ...form, occupation: text })} />

        {/* 都道府県 */}
        <Pressable onPress={() => setShowPrefPicker(true)} style={styles.input}>
          <Text>{form.prefecture || '都道府県を選択'}</Text>
        </Pressable>
        <Modal visible={showPrefPicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={form.prefecture} onValueChange={v => setForm({ ...form, prefecture: v })} style={styles.picker}>
                <Picker.Item label="未選択" value="" />
                {["北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県","茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
                "新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県","静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
                "鳥取県","島根県","岡山県","広島県","山口県","徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"].map(pref => (
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
  pickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  pickerColumn: {
    flex: 1,
    height: 200,
    minWidth: 100,
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: 200,
    color: '#000',
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
