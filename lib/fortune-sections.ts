import type { ResponseDepth } from "@/lib/constants";

export type FortuneSectionKey =
  | "summary"
  | "core"
  | "pain"
  | "mismatch"
  | "flow"
  | "risk"
  | "today"
  | "next"
  | "hidden";

export type ParsedSection = {
  key: FortuneSectionKey;
  title: string;
  content: string;
};

export type ParseFortuneResult =
  | {
      type: "structured";
      sections: ParsedSection[];
    }
  | {
      type: "raw";
      content: string;
    };

const SECTION_META: Record<FortuneSectionKey, { title: string; icon: string }> = {
  summary: { title: "要約", icon: "①" },
  core: { title: "あなたの恋愛の核", icon: "🔮" },
  pain: { title: "いま苦しくなっている理由", icon: "🧠" },
  mismatch: { title: "相手とのズレ", icon: "💔" },
  flow: { title: "今の流れ", icon: "📅" },
  risk: { title: "いま避けるべき行動", icon: "⚠️" },
  today: { title: "今日の行動", icon: "✨" },
  next: { title: "次の確認", icon: "💬" },
  hidden: { title: "まだ見えていない本音", icon: "🔒" }
};

const ORDER: FortuneSectionKey[] = ["summary", "core", "pain", "mismatch", "flow", "risk", "today", "next", "hidden"];

const HEADING_MATCHERS: Array<{ key: FortuneSectionKey; regex: RegExp }> = [
  { key: "summary", regex: /要約/ },
  { key: "core", regex: /(あなたの恋愛の核|恋愛の核|あなたの本質|本質|性格|恋愛傾向)/ },
  { key: "pain", regex: /(いま苦しくなっている理由|苦しくなっている理由|苦しい理由)/ },
  { key: "mismatch", regex: /(相手とのズレ|ズレ|温度差)/ },
  { key: "flow", regex: /(今の流れ|今後の流れ|流れ|近未来)/ },
  { key: "risk", regex: /(いま避けるべき行動|見逃すと起きること|注意点|見落とすと)/ },
  { key: "today", regex: /(今日の行動|行動アドバイス|取るべき行動|アドバイス)/ },
  { key: "next", regex: /(次の確認|次に確認|次の質問)/ },
  { key: "hidden", regex: /(まだ見えていない本音|本音|深掘り|ロック)/ }
];

function normalizeHeadingLine(line: string): string {
  return line
    .replace(/^#{1,6}\s*/, "")
    .replace(/^[\s\-・*]+/, "")
    .replace(/^[①-⑩0-9]+[).、\s]*/, "")
    .replace(/^[【\[](.+)[】\]]$/, "$1")
    .replace(/[:：]$/, "")
    .trim();
}

function resolveSectionKey(line: string): FortuneSectionKey | null {
  const normalized = normalizeHeadingLine(line);
  for (const matcher of HEADING_MATCHERS) {
    if (matcher.regex.test(normalized)) {
      return matcher.key;
    }
  }
  return null;
}

function compactText(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function parseFortuneSections(rawText: string): ParseFortuneResult {
  const text = compactText(rawText);
  if (!text) {
    return { type: "raw", content: "" };
  }

  const lines = text.split("\n");
  const bucket: Record<FortuneSectionKey, string[]> = {
    summary: [],
    core: [],
    pain: [],
    mismatch: [],
    flow: [],
    risk: [],
    today: [],
    next: [],
    hidden: []
  };

  let current: FortuneSectionKey | null = null;
  const orphan: string[] = [];

  for (const line of lines) {
    const maybe = resolveSectionKey(line);
    if (maybe) {
      current = maybe;
      continue;
    }

    if (current) {
      bucket[current].push(line);
    } else {
      orphan.push(line);
    }
  }

  if (orphan.length > 0) {
    if (bucket.summary.length === 0) {
      bucket.summary.push(...orphan);
    } else {
      bucket.summary.unshift(...orphan);
    }
  }

  const sections = ORDER.map((key) => {
    const content = compactText(bucket[key].join("\n"));
    return {
      key,
      title: `${SECTION_META[key].icon} ${SECTION_META[key].title}`,
      content
    };
  }).filter((section) => section.content.length > 0);

  if (sections.length === 0) {
    return { type: "raw", content: text };
  }

  return {
    type: "structured",
    sections
  };
}

export function buildHiddenPreview(input: string, depth: ResponseDepth): string {
  const normalized = input.replace(/\s+/g, " ").trim();
  if (normalized.length > 0) {
    return `${normalized.slice(0, depth === "ライト" ? 76 : 96)}...`;
  }

  if (depth === "ディープ") {
    return "関係の分岐点、相手が言葉にしない本音、次に動く最適なタイミングまで整理できます。";
  }

  return "相手がまだ言葉にしていない本音と、あなたの恋愛の本当の分岐点が残っています。";
}
