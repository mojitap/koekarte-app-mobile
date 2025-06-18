import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
  Button,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getUser } from '../utils/auth';

export default function PrivacyScreen() {
  const navigation = useNavigation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      setIsLoggedIn(!!user);
    };
    fetchUser();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>🔒 プライバシーポリシー</Text>

        <Text style={styles.paragraph}>
          本プライバシーポリシーは、音声ストレスチェックツール「コエカルテ」（以下「本サービス」）における、
          ユーザーの個人情報の取り扱い方針を定めるものです。
          ユーザーの皆さまには、本サービスをご利用いただく前に、必ずお読みいただき、
          内容をご理解のうえでご利用ください。
        </Text>

      <Text style={styles.subheading}>第1条（取得する情報）</Text>
      <Text style={styles.paragraph}>
        ・アカウント登録時に入力された情報（メールアドレス、性別、地域、生年月日など）{"\n"}
        ・本人確認のための認証データ（確認用メール送信、トークンなど）{"\n"}
        ・ログイン日時、アクセスログ、IPアドレスなどの技術情報{"\n"}
        ・音声アップロード時のファイル情報（音声内容、解析結果など）{"\n"}
        ・音源再生履歴や利用状況（再生回数、利用楽曲など）
      </Text>

      <Text style={styles.subheading}>第2条（利用目的）</Text>
      <Text style={styles.paragraph}>
        ・サービス提供、ユーザー認証、本人確認のため{"\n"}
        ・ストレススコアの解析、記録、グラフ表示などの機能提供のため{"\n"}
        ・サービス品質改善、機能向上、障害対応のため{"\n"}
        ・法令順守および不正利用防止のため{"\n"}
        ・ユーザーの利用傾向に応じたサービス改善や音源提供の最適化のため
      </Text>

      <Text style={styles.subheading}>第3条（第三者提供）</Text>
      <Text style={styles.paragraph}>
        当方は、以下の場合を除き、ユーザーの個人情報を第三者に提供いたしません。{"\n"}
        ・ユーザーの同意がある場合{"\n"}
        ・法令に基づく場合{"\n"}
        ・外部決済サービス（例：Stripe）など業務委託先と連携が必要な場合{"\n"}
        ・有料音源の提供に関して、決済処理やライセンス保護の目的で業務委託先と必要な情報を共有する場合
      </Text>

      <Text style={styles.subheading}>第4条（Cookie・アクセス解析）</Text>
      <Text style={styles.paragraph}>
        本サービスでは、利便性向上およびアクセス解析のためにCookieを使用することがあります。Google Analytics等の解析ツールを導入し、匿名の統計情報を収集することがあります。なお、Cookieの利用はユーザーのブラウザ設定により制限または無効化することが可能です。
      </Text>

      <Text style={styles.subheading}>第5条（個人情報の管理）</Text>
      <Text style={styles.paragraph}>
        ユーザーの個人情報は、セキュリティ対策を講じた上で、適切に管理・保管されます。一定期間の保存後、利用目的が終了した場合は速やかに破棄または個人を特定できない形に加工（匿名化）されます。
        本サービス内で提供される音源（無料・有料を問わず）の再生履歴等は、個人が特定されない統計情報として記録・分析されることがあります。
      </Text>

      <Text style={styles.subheading}>第6条（情報の開示・訂正・削除）</Text>
      <Text style={styles.paragraph}>
        ユーザーは、自己の情報について、照会・訂正・削除の請求を行うことができます。本人確認後、合理的な範囲で対応します。
      </Text>

      <Text style={styles.subheading}>第7条（免責事項）</Text>
      <Text style={styles.paragraph}>
        ・ユーザーが自己の責任で情報を開示した場合{"\n"}
        ・端末環境やブラウザ設定に起因する情報漏洩{"\n"}
        ・不正アクセス等、当方の責任によらない事由
      </Text>

      <Text style={styles.subheading}>第8条（プライバシーポリシーの改定）</Text>
      <Text style={styles.paragraph}>
        本ポリシーは、必要に応じて改定されることがあります。最新の内容は当サイト上で公開されます。
      </Text>

      <Text style={styles.subheading}>第9条（お問い合わせ）</Text>
      <Text style={styles.paragraph}>
        お問い合わせ先：koekarte.info@gmail.com{"\n"}
        運営者：コエカルテ運営代表
      </Text>

        <Text style={styles.date}>最終改定日：2025年06月02日</Text>

        {/* 利用規約などのリンク */}
        <View style={{ marginTop: 40, paddingBottom: 30, alignItems: 'center' }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' }}>
            <TouchableOpacity onPress={() => navigation.navigate('Terms')}>
              <Text style={styles.linkText}>利用規約</Text>
            </TouchableOpacity>
            <Text style={styles.separator}> | </Text>

            <TouchableOpacity onPress={() => navigation.navigate('Legal')}>
              <Text style={styles.linkText}>特定商取引法</Text>
            </TouchableOpacity>
            <Text style={styles.separator}> | </Text>

            <TouchableOpacity onPress={() => navigation.navigate('Contact')}>
              <Text style={styles.linkText}>お問い合わせ</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subheading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 5,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 10,
    color: '#333',
  },
  date: {
    fontSize: 13,
    color: 'gray',
    marginTop: 20,
  },
  linkText: {
    fontSize: 16,
    color: '#007bff',
    marginHorizontal: 2,
    minHeight: 24,
    textDecorationLine: 'underline',
  },
  separator: {
    fontSize: 12,
    color: '#666',
  },
});
