import React from 'react';
import {
  View,
  ScrollView,
  SafeAreaView,
  Button,
  Text,
  StyleSheet,
  Platform,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function TermsScreen() {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>📃 利用規約</Text>

        <Text style={styles.paragraph}>
          この利用規約（以下「本規約」といいます）は、ストレスチェックツール「コエカルテ」（以下「本サービス」といいます）の提供条件および利用者（以下「ユーザー」といいます）と提供者（以下「当方」といいます）との間の権利義務関係を定めるものです。本サービスをご利用いただく前に、本規約をよくお読みください。
        </Text>

        <Text style={styles.subheading}>第1条（適用）</Text>
        <Text style={styles.paragraph}>
          1. 本規約は、ユーザーが本サービスを利用する際の一切の行為に適用されます。
          2. 当方が本サービス上で随時掲載する追加規定やポリシーも、本規約の一部を構成します。
        </Text>

        <Text style={styles.subheading}>第2条（アカウント登録および本人確認）</Text>
        <Text style={styles.paragraph}>
          1. 本サービスの利用にあたり、ユーザーは所定の登録手続を経てアカウントを作成する必要があります。
          2. 登録には、メールアドレス、パスワード、性別、地域、生年月日などの情報が必要となります。
          3. 本人確認のため、登録メールアドレスへの確認メールを受信・承認する必要があります。
        </Text>

      <Text style={styles.subheading}>第3条（サービス内容）</Text>
      <Text style={styles.paragraph}>
        1. 本サービスは、ユーザーが音声をアップロードすることにより、音声解析を通じてストレス傾向を可視化するウェブツールです。
        2. 提供する結果は、医療行為に該当するものではなく、健康状態の診断・確定を行うものではありません。
        3. 継続的な使用・記録により、ユーザーの傾向変化やストレス推移を視覚的に把握できる設計です。
        4. 本サービスでは、リラックスや感情安定を目的とした音源を提供しています。
        5. 無料プランでは一部の音源（3曲）のみ再生可能で、有料プランに登録することで追加の音源（15曲）を含む計18曲が再生可能となります。
      </Text>

      <Text style={styles.subheading}>第4条（禁止事項）</Text>
      <Text style={styles.paragraph}>
        ユーザーは、以下の行為をしてはなりません：
        他人のメールアドレスや情報を使用して登録する行為、サービス内容や提供インフラへの不正アクセスや改ざん、自動化された方法での連続アクセスやデータ取得、法令または公序良俗に反する行為、その他、当方が不適切と判断する行為。
      </Text>

      <Text style={styles.subheading}>第5条（料金・支払）</Text>
      <Text style={styles.paragraph}>
        1. 本サービスは「5日間の無料期間」後に自動で有料（月額課金）へ移行する形式を採用しています。
        2. Stripeを通じて決済が行われ、クレジットカード、Apple Pay、Google Payなどが利用可能です。
        3. 決済方法の詳細は、マイページまたは購入画面にて確認可能です。
        4. 有料プランの開始日は登録日を基準に計算されます。
        5. 有料プランでは音声記録、分析結果の閲覧、リラクゼーション音源（全18曲）の再生が可能となります。
      </Text>

      <Text style={styles.subheading}>第6条（キャンセル・解約）</Text>
      <Text style={styles.paragraph}>
        1. 解約はマイページまたは専用フォームからいつでも行うことができます。
        2. 解約後は次回請求日以降の課金が停止され、既に支払い済の利用料は返金されません。
      </Text>

      <Text style={styles.subheading}>第7条（サービスの一時停止・終了）</Text>
      <Text style={styles.paragraph}>
        以下の場合、ユーザーへの通知なしに本サービスを停止・終了することがあります：
        ・システム保守・災害等の不可抗力・サービス継続が困難と判断された場合。
        停止・終了による損害について当方は責任を負いません。
      </Text>

      <Text style={styles.subheading}>第8条（知的財産権）</Text>
      <Text style={styles.paragraph}>
        1. 本サービスおよびコンテンツの著作権は当方または正当な権利者に帰属します。
        2. 無断転載・商用利用は禁止します。
        3. 提供音源は個人利用に限り、複製・再配布は禁止されます。
      </Text>

      <Text style={styles.subheading}>第9条（免責事項）</Text>
      <Text style={styles.paragraph}>
        1. 本サービスは医療的診断を提供するものではありません。
        2. 利用結果に基づく判断による損害、端末や通信環境による障害について、当方は責任を負いません。
      </Text>

      <Text style={styles.subheading}>第10条（個人情報の取扱い）</Text>
      <Text style={styles.paragraph}>
        当方は、ユーザーの個人情報をプライバシーポリシーに基づき適切に管理・運用します。
      </Text>

      <Text style={styles.subheading}>第11条（利用規約の変更）</Text>
      <Text style={styles.paragraph}>
        1. 本規約は、当方の判断により、ユーザーへの通知なしに変更されることがあります。
        2. 変更後もサービスの利用を継続した場合、同意したものとみなします。
      </Text>

      <Text style={styles.subheading}>第12条（準拠法・裁判管轄）</Text>
      <Text style={styles.paragraph}>
        1. 本規約は日本法に準拠します。
        2. 紛争については東京地方裁判所を専属的管轄裁判所とします。
      </Text>

        <Text style={styles.paragraph}>最終改定日：2025年5月15日</Text>

        <View style={{ marginTop: 30, alignItems: 'center' }}>
          <Button
            title="🏠 マイページに戻る"
            onPress={() => navigation.navigate('Main', { screen: 'Home' })}
          />
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subheading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    color: '#333',
  },
});
