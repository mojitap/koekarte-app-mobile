// utils/purchaseUtils.js
import * as InAppPurchases from 'expo-in-app-purchases';

export async function purchaseWithApple() {
  try {
    await InAppPurchases.connectAsync();
    await InAppPurchases.purchaseItemAsync('com.koekarte.premium');
  } catch (e) {
    throw e;
  } finally {
    await InAppPurchases.disconnectAsync();
  }
}

export async function purchaseWithGoogle() {
  try {
    await InAppPurchases.connectAsync();
    await InAppPurchases.purchaseItemAsync('com.koekarte.premium');
  } catch (e) {
    throw e;
  } finally {
    await InAppPurchases.disconnectAsync();
  }
}