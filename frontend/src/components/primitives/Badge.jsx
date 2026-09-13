import React from "react";
import { TOKENS } from "../../constants/tokens";

export default function Badge({ tone = "neutral", children, mono = false }) {
  const tones = {
    neutral: { bg: TOKENS.surfaceAlt, fg: TOKENS.textMuted, bd: TOKENS.border },
    accent: { bg: TOKENS.accentSoft, fg: TOKENS.accent, bd: "transparent" },
    success: { bg: TOKENS.successSoft, fg: TOKENS.success, bd: "transparent" },
    warning: { bg: TOKENS.warningSoft, fg: TOKENS.warning, bd: "transparent" },
    danger: { bg: TOKENS.dangerSoft, fg: TOKENS.danger, bd: "transparent" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium leading-none ${mono ? "font-mono" : ""}`}
      style={{ background: t.bg, color: t.fg, border: `1px solid ${t.bd}` }}
    >
      {children}
    </span>
  );
}
