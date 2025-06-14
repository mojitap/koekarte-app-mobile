// screens/EditProfile.js

import React, { useState, useEffect } from 'react'
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
  KeyboardAvoidingView,
} from 'react-native'
import { Picker } from '@react-native-picker/picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import { API_BASE_URL } from '../utils/config'

export default function EditProfile({ navigation }) {
  const [form, setForm] = useState({
    email: '',
    username: '',
    birthdate: '',
    gender: '',
    occupation: '',
    prefecture: '',
  })
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showGenderPicker, setShowGenderPicker] = useState(false)
  const [showPrefPicker, setShowPrefPicker] = useState(false)

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
        })
      })
      .catch(() => {
        Alert.alert('エラー', 'プロフィール取得に失敗しました')
      })
  }, [])

  const handleSubmit = () => {
    fetch(`${API_BASE_URL}/api/update-profile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(form),
    })
      .then(() => {
        Alert.alert('成功', 'プロフィールを更新しました')
        navigation.goBack()
      })
      .catch(() => {
        Alert.alert('エラー', 'プロフィール更新に失敗しました')
      })
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 44 : 0}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>✏️ プロフィール編集</Text>

          {/* メール */}
          <View style={styles.formItem}>
            <Text style={styles.label}>メールアドレス</Text>
            <TextInput
              value={form.email}
              onChangeText={t => setForm({ ...form, email: t })}
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
              onChangeText={t => setForm({ ...form, username: t })}
              style={styles.input}
              placeholder="ニックネームを入力"
            />
          </View>

          {/* 生年月日 */}
          <View style={styles.formItem}>
            <Text style={styles.label}>生年月日</Text>
            {!showDatePicker && (
              <Pressable onPress={() => setShowDatePicker(true)} style={styles.input}>
                <Text style={{ color: form.birthdate ? '#000' : '#888' }}>
                  {form.birthdate || 'タップして選択'}
                </Text>
              </Pressable>
            )}
          </View>
          <Modal visible={showDatePicker} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <DateTimePicker
                  value={form.birthdate ? new Date(form.birthdate) : new Date(2000, 0, 1)}
                  mode="date"
                  display="spinner"
                  locale="ja-JP"
                  onChange={(_, d) => {
                    if (d) {
                      const iso = d.toISOString().split('T')[0]
                      setForm({ ...form, birthdate: iso })
                    }
                  }}
                  textColor="#000"
                  style={{ backgroundColor: '#fff', width: '100%' }}
                />
                <Button title="決定" onPress={() => setShowDatePicker(false)} />
              </View>
            </View>
          </Modal>

          {/* 性別 */}
          <View style={styles.formItem}>
            <Text style={styles.label}>性別</Text>
            <Pressable onPress={() => setShowGenderPicker(true)} style={styles.input}>
              <Text style={{ color: form.gender ? '#000' : '#888' }}>
                {form.gender || 'タップして選択'}
              </Text>
            </Pressable>
          </View>
          <Modal visible={showGenderPicker} transparent animationType="fade">
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Picker
                  selectedValue={form.gender}
                  onValueChange={v => setForm({ ...form, gender: v })}
                  itemStyle={{ fontSize: 18, color: '#000' }}
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
              onChangeText={t => setForm({ ...form, occupation: t })}
              style={styles.input}
              placeholder="例: 学生 / 会社員 / フリーランス"
            />
          </View>

          {/* 都道府県 */}
          <View style={styles.formItem}>
            <Text style={styles.label}>都道府県</Text>
            <Pressable onPress={() => setShowPrefPicker(true)} style={[styles.input, { zIndex: 10 }]}>
              <Text style={{ color: form.prefecture ? '#000' : '#888' }}>
                {form.prefecture || 'タップして選択'}
              </Text>
            </Pressable>
          </View>
          <Modal visible={showPrefPicker} transparent animationType="fade">
            <View style={styles.modalBackground}>
              <View style={styles.modalContainer}>
                <Picker
                  selectedValue={form.prefecture}
                  onValueChange={v => setForm({ ...form, prefecture: v })}
                  style={{ width: '100%', height: 200 }}
                  itemStyle={{ color: '#000' }}
                >
                  <Picker.Item label="未選択" value="" />
                  {[
                    '北海道','青森県','岩手県','宮城県','秋田県','山形県','福島県',
                    '茨城県','栃木県','群馬県','埼玉県','千葉県','東京都','神奈川県',
                    '新潟県','富山県','石川県','福井県','山梨県','長野県','岐阜県',
                    '静岡県','愛知県','三重県','滋賀県','京都府','大阪府','兵庫県',
                    '奈良県','和歌山県','鳥取県','島根県','岡山県','広島県','山口県',
                    '徳島県','香川県','愛媛県','高知県','福岡県','佐賀県','長崎県',
                    '熊本県','大分県','宮崎県','鹿児島県','沖縄県'
                  ].map(p => <Picker.Item key={p} label={p} value={p} />)}
                </Picker>
                <Button title="決定" onPress={() => setShowPrefPicker(false)} />
              </View>
            </View>
          </Modal>

          <View style={{ marginTop: 30 }}>
            <Button title="💾 保存する" onPress={handleSubmit} />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  formItem: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
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
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    width: '80%',
  },
})
