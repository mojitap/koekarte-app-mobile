import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet, ScrollView } from 'react-native';

export default function EditProfile({ navigation }) {
  const [form, setForm] = useState({
    username: '',
    birthdate: '',
    gender: '',
    occupation: '',
    prefecture: ''
  });

  useEffect(() => {
    fetch('http://192.168.0.27:5000/api/profile', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setForm(prev => ({
          ...prev,
          username: data.username || '',
          birthdate: data.birthdate || '',
          gender: data.gender || '',
          occupation: data.occupation || '',
          prefecture: data.prefecture || '',
        }));
      });
  }, []);

  const handleSubmit = () => {
    fetch('http://192.168.0.27:5000/api/update-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form)
    })
      .then(res => res.json())
      .then(data => {
        Alert.alert('成功', 'プロフィールを更新しました');
        navigation.goBack();
      })
      .catch(err => {
        Alert.alert('エラー', 'プロフィール更新に失敗しました');
      });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>プロフィール編集</Text>
      {Object.entries(form).map(([key, value]) => (
        <View key={key} style={{ marginBottom: 10 }}>
          <Text>{key}</Text>
          <TextInput
            value={value}
            onChangeText={text => setForm({ ...form, [key]: text })}
            style={styles.input}
          />
        </View>
      ))}
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
});