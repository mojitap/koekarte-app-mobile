import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  ScrollView,
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
      .catch((err) => {
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>プロフィール編集</Text>

      <View style={{ marginBottom: 15 }}>
        <Text>生年月日</Text>
        <TextInput
          value={form.birthdate}
          onChangeText={(text) => setForm({ ...form, birthdate: text })}
          style={styles.input}
          placeholder="例: 1990-01-01"
        />
      </View>

      <View style={{ marginBottom: 15 }}>
        <Text>性別</Text>
        <Picker
          selectedValue={form.gender}
          onValueChange={(itemValue) => setForm({ ...form, gender: itemValue })}
          style={styles.picker}
        >
          <Picker.Item label="未選択" value="" />
          <Picker.Item label="男性" value="男性" />
          <Picker.Item label="女性" value="女性" />
          <Picker.Item label="その他" value="その他" />
        </Picker>
      </View>

      <View style={{ marginBottom: 15 }}>
        <Text>職業</Text>
        <TextInput
          value={form.occupation}
          onChangeText={(text) => setForm({ ...form, occupation: text })}
          style={styles.input}
          placeholder="例：会社員 / "学生"
        />
      </View>

      <View style={{ marginBottom: 15 }}>
        <Text>都道府県</Text>
        <Picker
          selectedValue={form.prefecture}
          onValueChange={(itemValue) => setForm({ ...form, prefecture: itemValue })}
          style={styles.picker}
        >
          <Picker.Item label="北海道" value="北海道" />
          <Picker.Item label="青森県" value="青森県" />
          <Picker.Item label="岩手県" value="岩手県" />
          <Picker.Item label="宮城県" value="宮城県" />
          <Picker.Item label="秋田県" value="秋田県" />
          <Picker.Item label="山形県" value="山形県" />
          <Picker.Item label="福島県" value="福島県" />
          <Picker.Item label="茨城県" value="茨城県" />
          <Picker.Item label="栃木県" value="栃木県" />
          <Picker.Item label="群馬県" value="群馬県" />
          <Picker.Item label="埼玉県" value="埼玉県" />
          <Picker.Item label="千葉県" value="千葉県" />
          <Picker.Item label="東京都" value="東京都" />
          <Picker.Item label="神奈川県" value="神奈川県" />
          <Picker.Item label="新潟県" value="新潟県" />
          <Picker.Item label="富山県" value="富山県" />
          <Picker.Item label="石川県" value="石川県" />
          <Picker.Item label="福井県" value="福井県" />
          <Picker.Item label="山梨県" value="山梨県" />
          <Picker.Item label="長野県" value="長野県" />
          <Picker.Item label="岐阜県" value="岐阜県" />
          <Picker.Item label="静岡県" value="静岡県" />
          <Picker.Item label="愛知県" value="愛知県" />
          <Picker.Item label="三重県" value="三重県" />
          <Picker.Item label="滋賀県" value="滋賀県" />
          <Picker.Item label="京都府" value="京都府" />
          <Picker.Item label="大阪府" value="大阪府" />
          <Picker.Item label="兵庫県" value="兵庫県" />
          <Picker.Item label="奈良県" value="奈良県" />
          <Picker.Item label="和歌山県" value="和歌山県" />
          <Picker.Item label="鳥取県" value="鳥取県" />
          <Picker.Item label="島根県" value="島根県" />
          <Picker.Item label="岡山県" value="岡山県" />
          <Picker.Item label="広島県" value="広島県" />
          <Picker.Item label="山口県" value="山口県" />
          <Picker.Item label="徳島県" value="徳島県" />
          <Picker.Item label="香川県" value="香川県" />
          <Picker.Item label="愛媛県" value="愛媛県" />
          <Picker.Item label="高知県" value="高知県" />
          <Picker.Item label="福岡県" value="福岡県" />
          <Picker.Item label="佐賀県" value="佐賀県" />
          <Picker.Item label="長崎県" value="長崎県" />
          <Picker.Item label="熊本県" value="熊本県" />
          <Picker.Item label="大分県" value="大分県" />
          <Picker.Item label="宮崎県" value="宮崎県" />
          <Picker.Item label="鹿児島県" value="鹿児島県" />
          <Picker.Item label="沖縄県" value="沖縄県" />
        </Picker>
      </View>

      <Button title="保存する" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 5,
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    height: 44,
  },
});
