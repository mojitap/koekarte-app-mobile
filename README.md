# コエカルテ - React Native モバイルアプリ

🧠 **「声からストレス傾向を測る」自己チェックツール**
- Flask × React Native × Expo を活用した音声分析アプリ
- 無料5日間＋プレミアム音源（18曲）提供

---

## 📲 機能一覧

- 🎙 録音 & ストレススコア分析（1日1回）
- 📈 スコアのグラフ表示（ベースライン比較）
- 📤 スコア履歴をCSVで保存・共有
- 🧑‍💼 プロフィール編集
- 🎵 音楽プレイヤー（無料3曲 / 有料15曲）
- 💳 Stripeによる有料プラン切替（予定）

---

## 🧑‍💻 技術構成

| 項目 | 内容 |
|------|------|
| フロント | React Native (Expo) |
| バックエンド | Flask (Python) |
| 音声分析 | pyAudioAnalysis / librosa |
| データ保存 | PostgreSQL (Render) |
| 音源 | mp3形式（assets/audio 配下） |
| 支払い | Stripe（サブスクリプション） |
| 認証 | Flask-Login + メール認証 |

---

## 🚀 起動方法（ローカル）

```bash
# Expo CLI の導入（初回のみ）
npm install -g expo-cli

# 依存のインストール
npm install

# アプリ起動
npx expo start
