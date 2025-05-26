// utils/auth.js
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (e) {
    console.error('❌ ユーザー情報の保存に失敗しました', e);
  }
};

export const getUser = async () => {
  try {
    const json = await AsyncStorage.getItem('user');
    return json != null ? JSON.parse(json) : null;
  } catch (e) {
    console.error('❌ ユーザー情報の取得に失敗しました', e);
    return null;
  }
};

export const clearUser = async () => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (e) {
    console.error('❌ ユーザー情報の削除に失敗しました', e);
  }
};

export const logout = async () => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (e) {
    console.error("❌ ログアウトエラー:", e);
  }
};
