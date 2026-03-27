export const numerologyTraits: Record<number, string> = {
  1: "自立心が強く、恋愛でも主導して進めたいタイプ。",
  2: "共感力が高く、相手との調和を大切にするタイプ。",
  3: "表現力があり、会話や雰囲気で恋を育てるタイプ。",
  4: "誠実で安定志向。信頼を積み上げる恋愛が得意。",
  5: "変化を好み、刺激や自由を求めるタイプ。",
  6: "愛情深く、支え合える関係を重視するタイプ。",
  7: "内省的で慎重。深い理解があると心を開くタイプ。",
  8: "現実的で行動力があり、結果につながる関係を好むタイプ。",
  9: "包容力があり、相手の気持ちを大きく受け止めるタイプ。",
  11: "直感が鋭く、心のつながりを敏感に感じ取るタイプ。",
  22: "理想を形にする力があり、長期視点で関係を育てるタイプ。",
  33: "愛情と献身が強く、相手を癒す力を持つタイプ。"
};

function parseBirthdateToDigits(birthdate: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(birthdate);
  if (!m) {
    throw new Error("Invalid birthdate format. Expected YYYY-MM-DD.");
  }
  return `${m[1]}${m[2]}${m[3]}`;
}

function sumDigits(value: string): number {
  return value.split("").reduce((sum, ch) => sum + Number(ch), 0);
}

export function getLifePath(birthdate: string): number {
  let n = sumDigits(parseBirthdateToDigits(birthdate));
  while (![1, 2, 3, 4, 5, 6, 7, 8, 9, 11, 22, 33].includes(n)) {
    n = sumDigits(String(n));
  }
  return n;
}
