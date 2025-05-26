import React from 'react';
import { View, ScrollView, SafeAreaView, Button } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function TermsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView>
      <ScrollView>
        <Text style={styles.heading}>📜 特定商取引法に基づく表記</Text>

      <Text style={styles.paragraph}>本表記は、音声ストレスチェックツール「コエカルテ」（以下「本サービス」）における、特定商取引法第11条に基づく情報提供のためのものです。</Text>

      <Text style={styles.subheading}>■ 運営事業者</Text>
      <Text style={styles.paragraph}>コエカルテ 運営者</Text>

      <Text style={styles.subheading}>■ 運営責任者</Text>
      <Text style={styles.paragraph}>野寺 孝彦</Text>

      <Text style={styles.subheading}>■ 所在地</Text>
      <Text style={styles.paragraph}>〒104-0061
東京都中央区銀座1丁目12番4号 N&E BLD.6F
※個人情報保護の観点から、正式な請求があった場合に限り開示いたします。</Text>

      <Text style={styles.subheading}>■ 電話番号</Text>
      <Text style={styles.paragraph}>070-4787-1041
※お電話でのサポートは行っておりません。
お問い合わせはメールフォームまたは下記メールアドレスからご連絡ください。</Text>

      <Text style={styles.subheading}>■ お問い合わせ先メールアドレス</Text>
      <Text style={styles.paragraph}>koekarte.info@gmail.com</Text>

      <Text style={styles.subheading}>■ 販売URL</Text>
      <Text style={styles.paragraph}>https://koekarte.com</Text>

      <Text style={styles.subheading}>■ 販売価格</Text>
      <Text style={styles.paragraph}>月額 300円（税込）
無料体験期間（5日間）終了後、有料プランにお申し込みいただくことで、録音・解析機能・プレミアム音源の全18曲がご利用いただけます。
※未成年の方がご利用される場合は、保護者の同意を得たうえで登録・購入を行ってください。</Text>

      <Text style={styles.subheading}>■ 商品代金以外の必要料金</Text>
      <Text style={styles.paragraph}>インターネット接続料金、通信費などはお客様のご負担となります。</Text>

      <Text style={styles.subheading}>■ お支払方法</Text>
      <Text style={styles.paragraph}>・クレジットカード（Visa / Mastercard / American Express）
・Apple Pay / Google Pay
・銀行振込（Stripe決済プラットフォームを利用）</Text>

      <Text style={styles.subheading}>■ お支払時期</Text>
      <Text style={styles.paragraph}>無料体験期間は、アカウント登録日から5日間です。
無料期間が終了すると、録音・スコア解析・グラフ閲覧など一部の機能がご利用いただけなくなります。
有料プランをご希望の場合は、ユーザーご自身の意思でお申し込みいただき、決済完了後に有料機能が開放されます。</Text>

      <Text style={styles.subheading}>■ 商品の引き渡し時期（サービス提供開始時期）</Text>
      <Text style={styles.paragraph}>決済完了後、即時に「プレミアムプラン」が適用され、全機能をご利用いただけます。</Text>

      <Text style={styles.subheading}>■ 無料会員と有料会員の違いについて</Text>
      <Text style={styles.paragraph}>本サービスには、無料会員と有料会員の区分があります。
無料会員は、一部の機能（録音・スコアの確認・グラフ閲覧）および一部の音源（3曲）をご利用いただけます。
有料会員になることで、プレミアム機能がすべて開放され、18曲の音源ライブラリをご利用いただけます。</Text>

      <Text style={styles.subheading}>■ 解約・キャンセルについて</Text>
      <Text style={styles.paragraph}>マイページまたは解約フォームからいつでも解約可能です。
解約後は、次回更新日以降の課金が停止されます。
すでに決済済みの料金については、日割り・月割りを含む返金には対応しておりません。</Text>

      <Text style={styles.subheading}>■ 返金について</Text>
      <Text style={styles.paragraph}>本サービスは音声解析および音源再生を含むデジタルサービスであるため、ユーザー都合による返金には一切対応しておりません。
音源の一部再生済み・機能利用後であっても、月額料金の返金・日割精算等はできません。</Text>

      <Text style={styles.subheading}>■ 動作環境</Text>
      <Text style={styles.paragraph}>インターネット接続が可能なPC、スマートフォン、タブレット端末
推奨ブラウザ：Google Chrome、Safari、Firefoxなど最新バージョン</Text>

      <Text style={styles.paragraph}>本サービスのご利用にあたっては、「利用規約」および「プライバシーポリシー」をご確認の上、ご同意いただく必要があります。</Text>

        <Text style={styles.paragraph}>最終更新日：2025年5月15日</Text>

        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <Button title="🏠 マイページに戻る" onPress={() => navigation.navigate('Profile')} />
        </View>
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
    marginBottom: 15,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
    color: '#333',
  },
});
