"use client";

import { Fragment } from "react";
import type { ResponseDepth } from "@/lib/constants";
import { buildHiddenPreview, parseFortuneSections, type FortuneSectionKey } from "@/lib/fortune-sections";

type FortuneResponseCardProps = {
  text: string;
  depth: ResponseDepth;
  onSelectDeep: () => void;
  canSelectDeep: boolean;
};

const SECTION_STYLE: Record<FortuneSectionKey, string> = {
  summary: "border-violet/40 bg-[rgba(168,139,250,0.12)]",
  core:    "border-[rgba(168,139,250,0.25)] bg-[rgba(124,58,237,0.1)]",
  pain:    "border-[rgba(168,139,250,0.25)] bg-[rgba(124,58,237,0.1)]",
  mismatch:"border-[rgba(168,139,250,0.25)] bg-[rgba(124,58,237,0.1)]",
  flow:    "border-[rgba(168,139,250,0.25)] bg-[rgba(124,58,237,0.1)]",
  risk:    "border-[rgba(245,158,11,0.35)] bg-[rgba(245,158,11,0.08)]",
  today:   "border-violet/40 bg-[rgba(124,58,237,0.18)]",
  next:    "border-[rgba(168,139,250,0.25)] bg-[rgba(124,58,237,0.1)]",
  hidden:  "border-violet-glow/40 bg-[rgba(168,139,250,0.12)]"
};

function renderBlocks(content: string) {
  const blocks = content.split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);

  return blocks.map((block, blockIndex) => {
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const isBullet = lines.every((line) => /^([-*・]\s+|\d+[.)]\s+)/.test(line));

    if (isBullet) {
      return (
        <ul key={`ul-${blockIndex}`} className="list-disc space-y-1 pl-5 text-sm leading-relaxed text-star">
          {lines.map((line, lineIndex) => (
            <li key={`li-${blockIndex}-${lineIndex}`}>{line.replace(/^([-*・]\s+|\d+[.)]\s+)/, "")}</li>
          ))}
        </ul>
      );
    }

    return (
      <p key={`p-${blockIndex}`} className="whitespace-pre-wrap text-sm leading-relaxed text-star">
        {lines.map((line, lineIndex) => (
          <Fragment key={`line-${blockIndex}-${lineIndex}`}>
            {line}
            {lineIndex < lines.length - 1 ? <br /> : null}
          </Fragment>
        ))}
      </p>
    );
  });
}

function LockedDeepCard({
  depth,
  preview,
  onSelectDeep,
  canSelectDeep
}: {
  depth: ResponseDepth;
  preview: string;
  onSelectDeep: () => void;
  canSelectDeep: boolean;
}) {
  return (
    <article className={`relative overflow-hidden rounded-2xl border px-4 py-4 shadow-sm ${SECTION_STYLE.hidden}`}>
      <h4 className="text-sm font-semibold text-star">🔒 まだ見えていない本音</h4>
      <p className="mt-2 text-sm leading-relaxed text-starsub">{buildHiddenPreview(preview, depth)}</p>

      <div className="pointer-events-none absolute inset-x-0 bottom-16 h-20 bg-gradient-to-t from-[#0d0a1a] to-transparent" />

      <div className="mt-4 rounded-xl p-3 backdrop-blur" style={{ border: "1px solid rgba(168,139,250,0.3)", background: "rgba(255,255,255,0.05)" }}>
        <p className="text-sm font-semibold text-star">あなたの恋愛の「本当の分岐点」を知る</p>
        <p className="mt-1 text-xs text-starsub">相手が言葉にしていない本音と、次に動くべきタイミングを詳しく確認できます。</p>
        <button
          type="button"
          onClick={onSelectDeep}
          disabled={!canSelectDeep}
          className="mt-3 rounded-xl bg-gradient-to-r from-violet to-violet-soft px-4 py-2 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          ディープ鑑定で続きを見る（3回分）
        </button>
      </div>
    </article>
  );
}

export function FortuneResponseCard({ text, depth, onSelectDeep, canSelectDeep }: FortuneResponseCardProps) {
  const parsed = parseFortuneSections(text);

  if (parsed.type === "raw") {
    if (depth === "ライト") {
      return (
        <div className="space-y-3">
          <article className="rounded-2xl border px-4 py-4 shadow-sm" style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(168,139,250,0.3)" }}>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-star">{parsed.content}</p>
          </article>
          <LockedDeepCard depth={depth} preview={parsed.content} onSelectDeep={onSelectDeep} canSelectDeep={canSelectDeep} />
        </div>
      );
    }

    return (
      <article className="rounded-2xl border px-4 py-4 shadow-sm" style={{ background: "rgba(124,58,237,0.12)", border: "1px solid rgba(168,139,250,0.3)" }}>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-star">{parsed.content}</p>
      </article>
    );
  }

  const hasHidden = parsed.sections.some((section) => section.key === "hidden");

  return (
    <div className="space-y-3">
      {parsed.sections.map((section) => {
        if (section.key === "hidden") {
          const isDeep = depth === "ディープ";

          if (isDeep) {
            return (
              <article key={section.key} className={`rounded-2xl border px-4 py-4 shadow-sm ${SECTION_STYLE.hidden}`}>
                <h4 className="text-sm font-semibold text-star">{section.title}</h4>
                <div className="mt-2 space-y-2">{renderBlocks(section.content)}</div>
              </article>
            );
          }

          return (
            <LockedDeepCard
              key={section.key}
              depth={depth}
              preview={section.content}
              onSelectDeep={onSelectDeep}
              canSelectDeep={canSelectDeep}
            />
          );
        }

        return (
          <article key={section.key} className={`rounded-2xl border px-4 py-4 shadow-sm ${SECTION_STYLE[section.key]}`}>
            <h4 className="text-sm font-semibold text-star">{section.title}</h4>
            <div className="mt-2 space-y-2">{renderBlocks(section.content)}</div>
          </article>
        );
      })}

      {depth === "ライト" && !hasHidden ? (
        <LockedDeepCard depth={depth} preview={text} onSelectDeep={onSelectDeep} canSelectDeep={canSelectDeep} />
      ) : null}
    </div>
  );
}

