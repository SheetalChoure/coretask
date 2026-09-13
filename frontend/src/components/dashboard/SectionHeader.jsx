import React from "react";
import { TOKENS, FONT_DISPLAY } from "../../constants/tokens";

export default function SectionHeader({ icon: Icon, title, count, action }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color: TOKENS.textMuted }} />
        <h2 className="text-[14.5px] font-semibold" style={{ color: TOKENS.text, fontFamily: FONT_DISPLAY }}>
          {title}
        </h2>
        {typeof count === "number" && (
          <span className="text-[11.5px] font-mono rounded-full px-2 py-0.5" style={{ background: TOKENS.surfaceAlt, color: TOKENS.textFaint }}>
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  );
}
