import React from "react";
import { TOKENS } from "../../constants/tokens";

export default function ProgressBar({ value, tone = "accent", size = "md" }) {
  const color =
    tone === "success" ? TOKENS.success
    : tone === "warning" ? TOKENS.warning
    : tone === "danger" ? TOKENS.danger
    : TOKENS.accent;
  const h = size === "sm" ? "h-1.5" : "h-2";
  return (
    <div className={`w-full ${h} rounded-full overflow-hidden`} style={{ background: TOKENS.surfaceAlt }}>
      <div
        className={`${h} rounded-full transition-all duration-700 ease-out`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}
