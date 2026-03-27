# AI占いくん MVP

恋愛特化のAI占いWebアプリ（Next.js App Router + Supabase + OpenAI）の最小実装です。

## 主な機能

- トップページでカテゴリ選択 + 悩み入力
- 占い結果表示（カテゴリ / 本文）
- 匿名セッションIDベースの無料回数制限（デフォルト3回）
- 無料上限到達時のプレミアム導線UI
- Supabaseに利用ログ保存

## 技術スタック

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Supabase
- OpenAI API

## セットアップ

1. 依存関係をインストール

```bash
npm install
```

2. 環境変数を設定

`.env.example` をコピーして `.env.local` を作成し、値を設定してください。

3. SupabaseでSQLを実行

`supabase/schema.sql` を Supabase SQL Editor で実行してください。

4. 開発サーバー起動

```bash
npm run dev
```

5. ブラウザで確認

`http://localhost:3000`

## API

- `GET /api/usage` 利用回数の取得
- `POST /api/fortune` 占い結果生成 + 回数消費 + ログ保存
- `GET /api/fortune/:id` セッションに紐づく占い結果取得

## Vercelデプロイ

1. Vercelにプロジェクトを接続
2. `.env.example` の環境変数をVercel側に設定
3. Deploy

## MVPでの割り切り

- 認証なし
- 決済なし（CTAのみ仮実装）
- 管理画面なし

将来、Stripe / LINE連携や会員化を追加しやすい構成です。