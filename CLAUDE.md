# AI占いくん — Claude Code ガイド

## プロジェクト概要
- AIであることを全面開示した透明な占いサービス
- ターゲット: 20〜35代女性（恋愛・キャリア・人間関係）
- コンセプト: 「AIです。だから安い。だから正直。だから24時間。」

## 技術スタック
- フロント: Next.js 14 / Tailwind CSS
- バックエンド: Next.js API Routes
- DB: Supabase（RLS設定済み）
- AI: OpenAI API（Responses API使用）

## 重要ファイル
- lib/fortune/prompt.ts — 占術プロンプト定義
- lib/fortune/tarot-data.ts — タロットカードデータ（22枚）
- lib/prompts.ts — プロンプト組み立て・resolveType・buildSystemPrompt
- lib/chat/responseFormatter.ts — 出力整形
- lib/openai.ts — OpenAI API呼び出し

## プロンプト設計の原則
- 散文のみ（箇条書き・見出し・絵文字禁止）
- 断定口調（「〜かもしれません」禁止）
- 深層の怖れを冒頭で言い当てる
- 問いで締める
- 500〜600文字

## 絶対に戻してはいけない設定
- responseFormatter.ts の ensureStructuredSections()
  （100文字以上あればそのまま返す設計）
- BRAND_PRINCIPLES（絵文字・箇条書き禁止）
- buildSystemPrompt() の skipSectionFormat
  （tarot・generalはSECTION_FORMAT不使用）

## 現在の占術一覧
総合・動物占い・西洋占星術・算命学四柱推命・タロット・相性・近日追加予定

## デプロイ
- Vercel（未デプロイ）
- 本番前にSupabaseのsupabase db pushが必要
