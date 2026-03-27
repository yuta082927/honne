import { animalTraits } from "@/lib/fortune/animal-data";
import type { AnimalCore, AnimalType, BirthInput } from "@/lib/fortune/types";

const ANIMAL_TYPES: readonly AnimalType[] = [
  "ライオン",
  "ゾウ",
  "コアラ",
  "チーター",
  "黒ひょう",
  "トラ",
  "ひつじ",
  "サル",
  "たぬき",
  "こじか",
  "オオカミ",
  "ペガサス"
] as const;

const ANIMAL_STYLES: Record<
  AnimalType,
  { publicStyle: string; decisionStyle: string; distanceStyle: string; traits: string[] }
> = {
  ライオン: {
    publicStyle: "堂々とした存在感",
    decisionStyle: "主導して決める",
    distanceStyle: "自分から関係を動かす",
    traits: ["主導力", "自信", "責任感"]
  },
  ゾウ: {
    publicStyle: "落ち着いた信頼感",
    decisionStyle: "慎重に積み上げる",
    distanceStyle: "安定重視でじっくり近づく",
    traits: ["堅実", "誠実", "計画性"]
  },
  コアラ: {
    publicStyle: "柔らかな親しみ",
    decisionStyle: "心地よさ優先",
    distanceStyle: "自然体で距離を縮める",
    traits: ["楽観", "マイペース", "癒し"]
  },
  チーター: {
    publicStyle: "スピード感がある",
    decisionStyle: "直感で素早い",
    distanceStyle: "一気に近づきやすい",
    traits: ["直感", "行動力", "勢い"]
  },
  黒ひょう: {
    publicStyle: "洗練された魅力",
    decisionStyle: "感性で見極める",
    distanceStyle: "魅力を感じると深まる",
    traits: ["美意識", "プライド", "センス"]
  },
  トラ: {
    publicStyle: "まっすぐで誠実",
    decisionStyle: "筋を通して決める",
    distanceStyle: "誠実さで関係を作る",
    traits: ["正義感", "真面目", "信頼"]
  },
  ひつじ: {
    publicStyle: "穏やかで協調的",
    decisionStyle: "周囲との調和を重視",
    distanceStyle: "安心感を育てて近づく",
    traits: ["協調性", "優しさ", "共感"]
  },
  サル: {
    publicStyle: "明るく社交的",
    decisionStyle: "臨機応変に判断",
    distanceStyle: "会話から距離を縮める",
    traits: ["器用さ", "コミュ力", "軽やかさ"]
  },
  たぬき: {
    publicStyle: "堅実で礼儀正しい",
    decisionStyle: "実績と信頼で判断",
    distanceStyle: "急がず安定して深める",
    traits: ["安定志向", "信頼重視", "継続力"]
  },
  こじか: {
    publicStyle: "愛嬌があり親しみやすい",
    decisionStyle: "安心できるかで判断",
    distanceStyle: "愛情確認しながら近づく",
    traits: ["繊細さ", "愛され力", "素直さ"]
  },
  オオカミ: {
    publicStyle: "個性的で独立的",
    decisionStyle: "価値観を貫く",
    distanceStyle: "尊重されると心を開く",
    traits: ["独自性", "自立心", "探究心"]
  },
  ペガサス: {
    publicStyle: "自由で軽やか",
    decisionStyle: "ひらめきと感覚で決める",
    distanceStyle: "自由を保ちながら関わる",
    traits: ["自由", "創造性", "変化力"]
  }
};

function parseDate(value?: string): Date | null {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const date = new Date(Date.UTC(y, mo - 1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() + 1 !== mo || date.getUTCDate() !== d) return null;
  return date;
}

export function computeAnimalLogic(input: BirthInput): AnimalCore | undefined {
  const date = parseDate(input.birthDate);
  if (!date) return undefined;

  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();

  const typeId = ((y + m + d) % ANIMAL_TYPES.length + ANIMAL_TYPES.length) % ANIMAL_TYPES.length;
  const detailCode60 = ((y * 13 + m * 5 + d * 7) % 60 + 60) % 60 + 1;
  const name = ANIMAL_TYPES[typeId];
  const style = ANIMAL_STYLES[name];
  const block = animalTraits[name];

  return {
    typeId,
    detailCode60,
    name,
    publicStyle: style.publicStyle,
    decisionStyle: style.decisionStyle,
    distanceStyle: style.distanceStyle,
    traits: [...style.traits, block.core, block.love]
  };
}

export function compareAnimalCompatibility(
  self?: AnimalCore,
  partner?: AnimalCore
): {
  score: number;
  tags: string[];
} | undefined {
  if (!self || !partner) return undefined;

  const diff = Math.abs(self.typeId - partner.typeId);
  const shortest = Math.min(diff, ANIMAL_TYPES.length - diff);
  const score = Math.max(35, 100 - shortest * 8);

  const tags: string[] = [];
  if (shortest <= 2) {
    tags.push("距離感が噛み合いやすい");
  } else if (shortest >= 5) {
    tags.push("距離感の設計が必要");
  }

  if (self.decisionStyle !== partner.decisionStyle) {
    tags.push("意思決定のテンポ差が出やすい");
  }

  if (self.publicStyle !== partner.publicStyle) {
    tags.push("外向きの見せ方にギャップがある");
  }

  return { score, tags };
}
