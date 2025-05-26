import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

export default function EditProfile({ navigation }) {
  const [form, setForm] = useState({
    username: '',
    birthdate: '',
    gender: '',
    occupation: '',
    prefecture: '',
  });

  useEffect(() => {
    fetch('http://192.168.0.27:5000/api/profile', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => {
        setForm({
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
    fetch('http://192.168.0.27:5000/api/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    })
      .then((res) => res.json())
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

        <View style={styles.formItem}>
          <Text style={styles.label}>ニックネーム</Text>
          <TextInput
            value={form.username}
            onChangeText={(text) => setForm({ ...form, username: text })}
            style={styles.input}
            placeholder="ニックネームを入力"
          />
        </View>

        <View style={styles.formItem}>
          <Text style={styles.label}>生年月日</Text>
          <TextInput
            value={form.birthdate}
            onChangeText={(text) => setForm({ ...form, birthdate: text })}
            style={styles.input}
            placeholder="例: 1990-01-01"
          />
        </View>

        <View style={styles.formItem}>
          <Text style={styles.label}>性別</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={form.gender}
              onValueChange={(itemValue) => setForm({ ...form, gender: itemValue })}
            >
              <Picker.Item label="未選択" value="" />
              <Picker.Item label="男性" value="男性" />
              <Picker.Item label="女性" value="女性" />
              <Picker.Item label="その他" value="その他" />
            </Picker>
          </View>
        </View>

        <View style={styles.formItem}>
          <Text style={styles.label}>職業</Text>
          <TextInput
            value={form.occupation}
            onChangeText={(text) => setForm({ ...form, occupation: text })}
            style={styles.input}
            placeholder="例: 学生 / 会社員 / フリーランス"
          />
        </View>

        <View style={styles.formItem}>
          <Text style={styles.label}>都道府県</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={form.prefecture}
              onValueChange={(itemValue) => setForm({ ...form, prefecture: itemValue })}
            >
              <Picker.Item label="未選択" value="" />
              {[
                '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
                '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
                '新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県',
                '静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県',
                '奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県',
                '徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県',
                '熊本県','大分県','宮崎県','鹿児島県','沖縄県',
              ].map((pref) => (
                <Picker.Item key={pref} label={pref} value={pref} />
              ))}
            </Picker>
          </View>
        </View>

        <Button title="💾 保存する" onPress={handleSubmit} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    backgroundColor: '#fff',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: '#fff',
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
  picker: {
    height: 48,
    backgroundColor: '#f9f9f9',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
    minHeight: 48,
    justifyContent: 'center',
  },
});
