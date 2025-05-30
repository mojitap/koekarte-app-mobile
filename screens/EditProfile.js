import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Button,
  Platform,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
  Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_BASE_URL } from '../utils/config';  // ← パスが screens フォルダ内なら ../ が必要

export default function EditProfile({ navigation }) {
  const [form, setForm] = useState({
    email: '',
    username: '',
    birthdate: '',
    gender: '',
    occupation: '',
    prefecture: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showPrefPicker, setShowPrefPicker] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/profile`, { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setForm({
          email: data.email || '',
          username: data.username || '',
          birthdate: data.birthdate || '',
          gender: data.gender || '',
          occupation: data.occupation || '',
          prefecture: data.prefecture || '',
        });
      })
      .catch(() => {
        Alert.alert('エラー', 'プロフィール取得に失敗しました');
      });
  }, []);

  const handleSubmit = () => {
    fetch(`${API_BASE_URL}/api/update-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(form), // ← ここで form の内容を文字列化
    })
      .then(res => res.json())
      .then(() => {
        Alert.alert('成功', 'プロフィールを更新しました');
        navigation.goBack();
      })
      .catch(() => {
        Alert.alert('エラー', 'プロフィール更新に失敗しました');
      });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.heading}>✏️ プロフィール編集</Text>

        {/* メール */}
        <View style={styles.formItem}>
          <Text style={styles.label}>メールアドレス</Text>
          <TextInput
            value={form.email}
            onChangeText={text => setForm({ ...form, email: text })}
            style={styles.input}
            placeholder="例: example@mail.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* ニックネーム */}
        <View style={styles.formItem}>
          <Text style={styles.label}>ニックネーム</Text>
          <TextInput
            value={form.username}
            onChangeText={text => setForm({ ...form, username: text })}
            style={styles.input}
            placeholder="ニックネームを入力"
          />
        </View>

        {/* 生年月日 */}
        <View style={styles.formItem}>
          <Text style={styles.label}>生年月日</Text>
          <Pressable onPress={() => setShowDatePicker(true)} style={styles.input}>
            <Text>{form.birthdate || 'タップして選択'}</Text>
          </Pressable>
        </View>
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

        {/* 性別 */}
        <View style={styles.formItem}>
          <Text style={styles.label}>性別</Text>
          <Pressable onPress={() => setShowGenderPicker(true)} style={styles.input}>
            <Text>{form.gender || 'タップして選択'}</Text>
          </Pressable>
        </View>
        <Modal visible={showGenderPicker} transparent animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
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

        {/* 職業 */}
        <View style={styles.formItem}>
          <Text style={styles.label}>職業</Text>
          <TextInput
            value={form.occupation}
            onChangeText={text => setForm({ ...form, occupation: text })}
            style={styles.input}
            placeholder="例: 学生 / 会社員 / フリーランス"
          />
        </View>

        {/* 都道府県 */}
        <View style={styles.formItem}>
          <Text style={styles.label}>都道府県</Text>
          <Pressable onPress={() => setShowPrefPicker(true)} style={styles.input}>
            <Text>{form.prefecture || 'タップして選択'}</Text>
          </Pressable>
        </View>
        <Modal visible={showGenderPicker} transparent animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Picker
                selectedValue={form.prefecture}
                onValueChange={value => setForm({ ...form, prefecture: value })}
              >
                <Picker.Item label="未選択" value="" />
                {[
                  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
                  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
                  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
                  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
                  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
                  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
                  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'
                ].map(pref => (
                  <Picker.Item key={pref} label={pref} value={pref} />
                ))}
              </Picker>
              <Button title="決定" onPress={() => setShowPrefPicker(false)} />
            </View>
          </View>
        </Modal>

        <View style={{ marginTop: 30 }}>
          <Button title="💾 保存する" onPress={handleSubmit} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    backgroundColor: '#fff',
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
  formItem: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 5,
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
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center', // ← 中央に表示されるようにする
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
});
