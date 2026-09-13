import React from "react";
import { TOKENS } from "../../constants/tokens";

const HUES = ["#4E7FFF", "#3FB950", "#D9922B", "#B072E8", "#F0654A", "#2BB8C9"];

export default function Avatar({ initials, size = 28 }) {
  const hue = HUES[(initials?.charCodeAt(0) || 0) % HUES.length];
  return (
    <div
      className="flex items-center justify-center rounded-full font-mono font-medium shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.36,
        background: `${hue}22`,
        color: hue,
        boxShadow: `0 0 0 2px ${TOKENS.surface}`,
      }}
    >
      {initials}
    </div>
  );
}
