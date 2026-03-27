export const FORTUNE_MODES = ["総合", "動物占い", "西洋占星術", "算命学・四柱推命", "タロット", "相性"] as const;

export type FortuneMode = (typeof FORTUNE_MODES)[number];

export const FORTUNE_TYPES = [
  "animal",
  "astrology",
  "sanmeigaku",
  "shichusuimei",
  "kyuseikigaku",
  "mbti",
  "tarot",
  "compatibility",
  "general"
] as const;

export type FortuneType = (typeof FORTUNE_TYPES)[number];

export const RESPONSE_DEPTHS = ["ライト", "ディープ"] as const;

export type ResponseDepth = (typeof RESPONSE_DEPTHS)[number];

export const DEPTH_COST: Record<ResponseDepth, number> = {
  "ライト": 1,
  "ディープ": 3
};

export const GENDER_OPTIONS = ["女性", "男性", "その他", "回答しない"] as const;

export type UserGender = (typeof GENDER_OPTIONS)[number];

export const MODE_HINTS: Record<FortuneMode, string> = {
  "総合": "西洋占星術・動物占い・算命学・四柱推命骨格を統合して、今の恋愛構造を一貫して読む。",
  "動物占い": "本質タイプ、表出タイプ、意思決定傾向、距離感のクセを中心に読む。",
  "西洋占星術": "太陽・月・金星・火星（条件付きでアセンダント）から感情と恋愛反応を読む。",
  "算命学・四柱推命": "生年月日ベースで性格骨格、執着傾向、時期の流れを読む。",
  "タロット": "悩みの内容からカードを引き、現在・未来・深層心理を読む。生年月日不要。",
  "相性": "2人の生年月日を元に、感情表現・連絡テンポ・距離感のズレを本格分析する。"
};

export const DEPTH_HINTS: Record<ResponseDepth, string> = {
  "ライト": "短く端的。核心・ズレ・今日の行動を1つ出す。",
  "ディープ": "丁寧に深掘り。相手視点・1週間行動計画・言葉選びまで出す。"
};

export const DEPTH_MAX_TOKENS: Record<ResponseDepth, number> = {
  "ライト": 650,
  "ディープ": 1400
};

export const PREMIUM_CTA_TEXT = {
  title: "ディープ鑑定で関係の分岐点まで見る",
  description: "相手の本音、すれ違いの発生源、1週間の行動プランまで深掘りします。",
  primaryLabel: "ディープ鑑定を試す",
  secondaryLabel: "先行案内を受け取る"
};
