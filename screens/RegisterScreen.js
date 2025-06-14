// screens/RegisterScreen.js

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

const MAX_CONTENT_WIDTH = 360;

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    email: '', username: '', password: '',
    birthdate: '', gender: '', occupation: '', prefecture: ''
  });
  const [showBirthPicker, setShowBirthPicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showPrefPicker, setShowPrefPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(String(new Date().getFullYear() - 20));
  const [selectedMonth, setSelectedMonth] = useState('01');
  const [selectedDay, setSelectedDay] = useState('01');

  const openBirthPicker  = () => { setShowGenderPicker(false); setShowPrefPicker(false); setShowBirthPicker(true); };
  const openGenderPicker = () => { setShowBirthPicker(false); setShowPrefPicker(false); setShowGenderPicker(true); };
  const openPrefPicker   = () => { setShowBirthPicker(false); setShowGenderPicker(false); setShowPrefPicker(true); };

  const handleSubmit = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/register`, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        credentials:'include',
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        Alert.alert('登録エラー', data.error || '登録に失敗しました');
        return;
      }
      await saveUser(data);
      const profileRes = await fetch(`${API_BASE_URL}/api/profile`, { credentials:'include' });
      const profileData = await profileRes.json();
      const ok = checkCanUsePremium(profileData.created_at, profileData.is_paid, profileData.is_free_extended);
      if (!ok) {
        await logout();
        Alert.alert('利用不可', '無料期間が終了しています');
        return;
      }
      Alert.alert('登録成功','ようこそ！',[{
        text:'OK', onPress:() => navigation.reset({
          index:0,
          routes:[{ name:'MainTabs' }]
        })
      }]);
    } catch (err) {
      console.error(err);
      Alert.alert('通信エラー','ネットワーク接続を確認してください');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: 'center', padding: 20, minHeight: '100%' }}>
        <View style={{ width: '100%', maxWidth: MAX_CONTENT_WIDTH }}>
          <Text style={styles.heading}>📩 新規登録</Text>

          <TextInput
            style={styles.input}
            placeholder="メールアドレス"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={t => setForm(f => ({ ...f, email: t }))}
          />
          <TextInput
            style={styles.input}
            placeholder="ニックネーム"
            value={form.username}
            onChangeText={t => setForm(f => ({ ...f, username: t }))}
          />
          <TextInput
            style={styles.input}
            placeholder="パスワード"
            secureTextEntry
            value={form.password}
            onChangeText={t => setForm(f => ({ ...f, password: t }))}
          />

          {/* 生年月日 */}
          <Pressable onPress={openBirthPicker} style={[styles.input, { zIndex: 10 }]}>
            <Text style={{ color: '#000' }}>
              {form.birthdate || '生年月日を選択'}
            </Text>
          </Pressable>

          <Modal visible={showBirthPicker} transparent animationType="fade">
            <View style={[styles.modalOverlay, { justifyContent: 'center', alignItems: 'center' }]}>
              <View style={[styles.pickerContainer, {
                alignItems: 'center',
                minWidth: 380, 
                minHeight: 300
              }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end' }}>
                  {/* 年 */}
                  <View style={{ alignItems:'center', width: 120 }}>
                    <Text style={styles.birthLabel}>年</Text>
                    <Picker
                      selectedValue={selectedYear}
                      onValueChange={v => setSelectedYear(v)}
                      style={{ width: 120, height: 250 }}
                      itemStyle={{ fontSize: 20, color: '#000' }}
                    >
                      {Array.from({ length: 100 }).map((_, i) => {
                        const year = String(new Date().getFullYear() - i);
                        return <Picker.Item key={year} label={year} value={year} />;
                      })}
                    </Picker>
                  </View>
                  {/* 月 */}
                  <View style={{ alignItems:'center', width: 100 }}>
                    <Text style={styles.birthLabel}>月</Text>
                    <Picker
                      selectedValue={selectedMonth}
                      onValueChange={v => setSelectedMonth(v)}
                      style={{ width: 100, height: 250 }}
                      itemStyle={{ fontSize: 20, color: '#000' }}
                    >
                      {Array.from({ length: 12 }).map((_, i) => {
                        const month = String(i + 1).padStart(2, '0');
                        return <Picker.Item key={month} label={month} value={month} />;
                      })}
                    </Picker>
                  </View>
                  {/* 日 */}
                  <View style={{ alignItems:'center', width: 100 }}>
                    <Text style={styles.birthLabel}>日</Text>
                    <Picker
                      selectedValue={selectedDay}
                      onValueChange={v => setSelectedDay(v)}
                      style={{ width: 100, height: 250 }}
                      itemStyle={{ fontSize: 20, color: '#000' }}
                    >
                      {Array.from({ length: 31 }, (_, i) => {
                        const day = String(i + 1).padStart(2, '0');
                        return <Picker.Item key={day} label={day} value={day} />;
                      })}
                    </Picker>
                  </View>
                </View>
                <Button
                  title="決定"
                  onPress={() => {
                    setForm(f => ({
                      ...f,
                      birthdate: `${selectedYear}-${selectedMonth}-${selectedDay}`,
                    }));
                    setShowBirthPicker(false);
                  }}
                />
              </View>
            </View>
          </Modal>

          {/* 性別 */}
          <Pressable onPress={openGenderPicker} style={[styles.input, { zIndex:10 }]}>
            <Text style={{ color: form.gender ? '#000' : '#888' }}>
              {form.gender || '性別を選択'}
            </Text>
          </Pressable>
          <Modal visible={showGenderPicker} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={[styles.pickerContainer, { backgroundColor: '#fff' }]}>
                <Picker
                  selectedValue={form.gender}
                  onValueChange={v => setForm(f => ({ ...f, gender: v }))}
                  style={{ width: 220, height: 200 }}
                  itemStyle={{ color: '#000', fontSize: 18 }}
                >
                  <Picker.Item label="選択してください" value="" />
                  <Picker.Item label="男性" value="男性" />
                  <Picker.Item label="女性" value="女性" />
                  <Picker.Item label="その他" value="その他" />
                  <Picker.Item label="答えたくない" value="答えたくない" />
                </Picker>
                <Button title="決定" onPress={() => setShowGenderPicker(false)} />
              </View>
            </View>
          </Modal>

          {/* 職業 */}
          <TextInput
            style={styles.input}
            placeholder="職業"
            value={form.occupation}
            onChangeText={t=>setForm(f=>({...f,occupation:t}))}
          />

          {/* 都道府県 */}
          <Pressable onPress={openPrefPicker} style={[styles.input, { zIndex:10 }]}>
            <Text style={{ color: form.prefecture ? '#000' : '#888' }}>
              {form.prefecture || '都道府県を選択'}
            </Text>
          </Pressable>
          <Modal
            visible={showPrefPicker}
            transparent
            animationType="fade"
            onRequestClose={() => setShowPrefPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContainer, { width: 250 }]}>
                <Text style={{ fontSize: 16, marginBottom: 10 }}>都道府県を選択</Text>
                <Picker
                  selectedValue={form.prefecture}
                  onValueChange={v => setForm(f => ({ ...f, prefecture: v }))}
                  style={{ width: 220, height: 200 }}
                  itemStyle={{ color: '#000', fontSize: 16 }}
                >
                  <Picker.Item label="選択してください" value="" />
                  {[
                    "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
                    "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
                    "新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県",
                    "静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県",
                    "奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県",
                    "徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県",
                    "熊本県","大分県","宮崎県","鹿児島県","沖縄県"
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

          <Text
            style={styles.link}
            onPress={() =>
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              })
            }
          >
            ▶ すでにアカウントをお持ちの方
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex:1,
    backgroundColor:'#fff',
    paddingTop:Platform.OS==='android'?StatusBar.currentHeight:0,
  },
  heading: {
    fontSize:22,
    fontWeight:'bold',
    textAlign:'center',
    marginBottom:30,
  },
  input: {
    borderWidth:1,
    borderColor:'#ccc',
    backgroundColor:'#fff',
    padding:10,
    borderRadius:5,
    marginBottom:15,
  },
  pickerRow: {
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
    gap:10,
  },
  pickerContainer: {
    backgroundColor:'#f2f2f2',
    borderRadius:10,
    padding:10,
    margin:20,
    alignItems:'center',
    justifyContent:'center',
    maxHeight:'80%',
    minWidth: 280,
  },
  birthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  birthItem: {
    alignItems: 'center',
    width: 90, // 年:90, 月・日:70に分けてもOK
  },
  birthPicker: {
    width: 80, // 年は90、月日は70推奨
    height: 200,
    backgroundColor: '#fff',
  },
  birthLabel: {
    marginBottom: 4,
    fontSize: 14,
  },
  modalOverlay: {
    flex:1,
    backgroundColor:'rgba(0,0,0,0.4)',
    justifyContent:'center',
    alignItems:'center',
  },
  modalContainer: {
    backgroundColor:'#fff',
    borderRadius:10,
    padding:20,
    width:'90%',
    maxHeight:'80%',
    alignItems:'center',
  },
  submitContainer: {
    marginTop:30,
  },
  link: {
    marginTop:30,
    color:'#007AFF',
    textAlign:'center',
  },
  infoText: {
    fontSize: 20,
    color: '#555',
    marginBottom: 15,
    textAlign: 'left',
    lineHeight: 23,
  },
  infoPoint: {
    fontSize: 16,
    marginBottom: 6,
    color: '#444',
  },
  subheading: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 5,
    color: '#333',
  },
  bullet: {
    fontSize: 15,
    color: '#444',
    marginLeft: 8,
      marginBottom: 2,
  },
  subtext: {
    fontSize: 13,
    color: '#777',
    marginTop: 9,
    lineHeight: 18,
  },
});
