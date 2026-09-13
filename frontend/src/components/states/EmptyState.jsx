import React from "react";
import { Inbox, Plus } from "lucide-react";
import { TOKENS, FONT_DISPLAY } from "../../constants/tokens";

export default function EmptyState({ icon: Icon = Inbox, title, message, actionLabel, onAction }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center rounded-2xl py-16 px-6"
      style={{ background: TOKENS.surface, border: `1px dashed ${TOKENS.border}` }}
    >
      <div
        className="flex items-center justify-center rounded-full mb-4"
        style={{ width: 48, height: 48, background: TOKENS.surfaceAlt, color: TOKENS.textMuted }}
      >
        <Icon size={22} />
      </div>
      <h3 className="text-[15px] font-semibold mb-1" style={{ color: TOKENS.text, fontFamily: FONT_DISPLAY }}>
        {title}
      </h3>
      <p className="text-[13px] max-w-sm mb-5" style={{ color: TOKENS.textMuted }}>
        {message}
      </p>
      {actionLabel && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors"
          style={{ background: TOKENS.accent, color: "#fff" }}
        >
          <Plus size={15} /> {actionLabel}
        </button>
      )}
    </div>
  );
}
