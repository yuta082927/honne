import type { FortuneComputationResult } from "@/lib/fortune/types";

function safeText(value: string): string {
  return value.trim().replace(/\n{3,}/g, "\n\n");
}

export function buildStructuredFallback(input: {
  concern: string;
  analysis: FortuneComputationResult;
}): string {
  const summary = input.analysis.integratedSummary;
  const coaching = input.analysis.coaching;
  const compatibility = input.analysis.compatibility;
  const shortConcern = input.concern.slice(0, 60);

  return safeText(`### 要約
「${shortConcern}」というご相談ですね。占術データをもとに、今の状況と取れる行動を整理します。

### あなたの恋愛の核
${summary.romanticCore}
感情と行動のバランスを保ちながら関係を築こうとする傾向があります。

### いま苦しくなっている理由
${summary.painReason}
${summary.mismatch}

### いま避けるべき行動
${coaching.ngAction}
焦りから動くほど、相手との距離が開きやすい局面です。

### 今日の行動
${coaching.todayAction}

### 次の確認
${coaching.nextLens}
${compatibility?.communicationGapTags[0] ? `特に「${compatibility.communicationGapTags[0]}」を意識すると整理しやすいです。` : ""}`.trim());
}

export function ensureStructuredSections(
  text: string,
  fallback: string
): string {
  const normalized = text.trim();

  // 空なら fallback
  if (!normalized) return fallback;

  // 100文字以上あれば有効な応答とみなす
  // タロット・総合は散文形式のためキーワードチェックをしない
  if (normalized.length >= 100) return normalized;

  return fallback;
}
