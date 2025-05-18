// EditProfile.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';

export default function EditProfile() {
  const [form, setForm] = useState({
    username: '',
    birthdate: '',
    gender: '',
    occupation: '',
    prefecture: '',
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch('https://koekarte.com/api/update_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // ✅ Cookieログイン維持
        body: JSON.stringify(form),
      });

      const data = await response.json();
      if (response.ok) {
        Alert.alert("完了", data.message || "プロフィールを更新しました");
      } else {
        Alert.alert("エラー", data.error || "更新に失敗しました");
      }
    } catch (err) {
      console.error("❌ 通信エラー:", err);
      Alert.alert("エラー", "通信エラーが発生しました");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>プロフィール編集</Text>
      {["username", "birthdate", "gender", "occupation", "prefecture"].map((field) => (
        <TextInput
          key={field}
          style={styles.input}
          placeholder={field}
          value={form[field]}
          onChangeText={(text) => handleChange(field, text)}
        />
      ))}
      <Button title="更新する" onPress={handleSubmit} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
  },
});