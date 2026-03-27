import type { FortuneMode, ResponseDepth, UserGender } from "@/lib/constants";

export type BirthInput = {
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  gender?: UserGender;
};

export type FortuneProfileInput = {
  self: BirthInput;
  partner?: BirthInput;
  concern: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
};

export type ZodiacSign =
  | "牡羊座"
  | "牡牛座"
  | "双子座"
  | "蟹座"
  | "獅子座"
  | "乙女座"
  | "天秤座"
  | "蠍座"
  | "射手座"
  | "山羊座"
  | "水瓶座"
  | "魚座";

export type AnimalType =
  | "ライオン"
  | "ゾウ"
  | "コアラ"
  | "チーター"
  | "黒ひょう"
  | "トラ"
  | "ひつじ"
  | "サル"
  | "たぬき"
  | "こじか"
  | "オオカミ"
  | "ペガサス";

export type DayMaster = "甲" | "乙" | "丙" | "丁" | "戊" | "己" | "庚" | "辛" | "壬" | "癸";

export interface TraitBlock {
  core: string;
  love: string;
  weakness: string;
}

export interface AstrologySummary {
  sun: ZodiacSign;
  moon: ZodiacSign;
  venus: ZodiacSign;
  mars: ZodiacSign;
  sunText: string;
  moonText: string;
  venusText: string;
  marsText: string;
}

export interface FortuneProfile {
  animal: AnimalType;
  animalTraits: TraitBlock;
  dayMaster: DayMaster;
  dayMasterTraits: TraitBlock;
  astrology: AstrologySummary;
  lifePath: number;
  lifePathText: string;
  psychologyTags: string[];
}

export interface CompatibilitySummary {
  overall: string;
  conflict: string;
  goodPattern: string;
  advice: string;
}

export interface ProblemAnalysis {
  type: string;
  emotion: string;
  need: string;
}

export type WesternCore = {
  sun: ZodiacSign;
  moon: ZodiacSign;
  venus: ZodiacSign;
  mars: ZodiacSign;
  ascendant?: ZodiacSign;
  confidence: "high" | "medium" | "low";
  notes: string[];
  loveFocus: string[];
};

export type AnimalCore = {
  typeId: number;
  detailCode60: number;
  name: string;
  publicStyle: string;
  decisionStyle: string;
  distanceStyle: string;
  traits: string[];
};

export type EasternCore = {
  baseElement: "木" | "火" | "土" | "金" | "水";
  polarity: "陽" | "陰";
  relationshipDrive: "継続型" | "直感型";
  attachmentRisk: "低" | "中" | "高";
  timingFlow: "動く時期" | "整える時期";
  summary: string;
};

export type CompatibilityLens = {
  totalScore: number;
  communicationGapTags: string[];
  emotionalGapTags: string[];
  distanceGapTags: string[];
  safeBondTags: string[];
};

export type PsychologyTag = {
  key:
    | "anxiety"
    | "avoidance"
    | "dependency"
    | "approval"
    | "distance"
    | "emotion_labeling"
    | "reply_meaning"
    | "overreaction";
  label: string;
  level: "low" | "mid" | "high";
  reason: string;
};

export type CoachingPlan = {
  coreIssue: string;
  emotionalNaming: string;
  ngAction: string;
  todayAction: string;
  nextLens: string;
  weeklyPlan?: string[];
  wordingTip?: string;
  moveVsWaitHint?: string;
};

export type FortuneComputationResult = {
  mode: FortuneMode;
  depth: ResponseDepth;
  self: {
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
    gender?: UserGender;
    western?: WesternCore;
    animal?: AnimalCore;
    eastern?: EasternCore;
    zodiac?: { sign: ZodiacSign };
    shichu?: {
      heavenlyStem: string;
      earthlyBranch: string;
      element: "木" | "火" | "土" | "金" | "水";
      polarity: "陽" | "陰";
      tendency: string;
    };
  };
  partner?: {
    birthDate?: string;
    birthTime?: string;
    birthPlace?: string;
    western?: WesternCore;
    animal?: AnimalCore;
    eastern?: EasternCore;
    zodiac?: { sign: ZodiacSign };
    shichu?: {
      heavenlyStem: string;
      earthlyBranch: string;
      element: "木" | "火" | "土" | "金" | "水";
      polarity: "陽" | "陰";
      tendency: string;
    };
  };
  compatibility?: CompatibilityLens & {
    animalScore?: number;
    zodiacScore?: number;
    verdict?: string;
  };
  psychology: PsychologyTag[];
  coaching: CoachingPlan;
  integratedSummary: {
    romanticCore: string;
    painReason: string;
    mismatch: string;
    flow: string;
  };
  nextQuestion: string;
  modeSummary: string[];
  notes: string[];
};
