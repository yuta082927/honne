import type { FortuneComputationResult } from "@/lib/fortune/types";

const QUESTION_BANK = [
  "今いちばん苦しいのは、相手の気持ちが見えないことですか？",
  "返信が遅い時に強く出るのは、不安ですか、それとも怒りですか？",
  "動きたい気持ちと、傷つきたくない気持ち、どちらが強いですか？",
  "次の1通で伝えたいのは、確認ですか、それとも安心ですか？",
  "関係を進めたい気持ちと、今は整えたい気持ち、どちらが近いですか？"
] as const;

export function buildNextQuestion(analysis: FortuneComputationResult): string {
  const seed = `${analysis.self.birthDate ?? ""}-${analysis.mode}-${analysis.psychology.map((p) => p.key).join("")}`;
  let hash = 0;
  for (const c of seed) {
    hash = (hash * 31 + c.charCodeAt(0)) % 2147483647;
  }

  const idx = Math.abs(hash) % QUESTION_BANK.length;
  return QUESTION_BANK[idx];
}

export function shouldAskQuestionThisTurn(historyLength: number): boolean {
  return historyLength >= 0;
}
