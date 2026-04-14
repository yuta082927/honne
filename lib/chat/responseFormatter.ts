import type { FortuneComputationResult } from "@/lib/fortune/types";

function safeText(value: string): string {
  return value.trim().replace(/\n{3,}/g, "\n\n");
}

export function buildStructuredFallback(input: {
  depth?: "ライト" | "ディープ";
  concern: string;
  analysis: FortuneComputationResult;
}): string {
  const summary = input.analysis.integratedSummary;
  const coaching = input.analysis.coaching;
  const compatibility = input.analysis.compatibility;
  const shortConcern = input.concern.slice(0, 60);
  const isLight = input.depth === "ライト";

  if (isLight) {
    return safeText(`### 要約
「${shortConcern}」というご相談ですね。占術データをもとに、今の状況を整理します。

### あなたの恋愛の核
${summary.romanticCore}
感情と行動のバランスを保ちながら関係を築こうとする傾向があります。

### いま苦しくなっている理由
${summary.painReason}
${summary.mismatch}

### いま避けるべき行動
${coaching.ngAction}
焦りから動くほど、相手との距離が開きやすい局面です。

### 次の確認
${coaching.nextLens}
${compatibility?.communicationGapTags[0] ? `特に「${compatibility.communicationGapTags[0]}」を意識すると整理しやすいです。` : ""}
今のあなたが一番守りたいものは何ですか？`.trim());
  }

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

  // 見出し構造がある場合は短文でも有効とみなす
  const hasStructuredHeading =
    normalized.includes("### 要約") ||
    normalized.includes("### あなたの恋愛の核") ||
    normalized.includes("### 次の確認");
  if (hasStructuredHeading) return normalized;

  // 散文でも40文字以上あれば有効とみなす（100文字閾値だとfallback化しやすい）
  if (normalized.length >= 40) return normalized;

  return fallback;
}
