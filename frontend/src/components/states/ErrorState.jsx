import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { TOKENS, FONT_DISPLAY } from "../../constants/tokens";

export default function ErrorState({ message, onRetry }) {
  return (
    <div
      className="flex flex-col items-center justify-center text-center rounded-2xl py-16 px-6"
      style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.dangerSoft}` }}
    >
      <div
        className="flex items-center justify-center rounded-full mb-4"
        style={{ width: 48, height: 48, background: TOKENS.dangerSoft, color: TOKENS.danger }}
      >
        <AlertTriangle size={22} />
      </div>
      <h3 className="text-[15px] font-semibold mb-1" style={{ color: TOKENS.text, fontFamily: FONT_DISPLAY }}>
        Couldn't load this view
      </h3>
      <p className="text-[13px] max-w-sm mb-5" style={{ color: TOKENS.textMuted }}>
        {message || "The request failed. Check your connection and try again."}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-medium transition-colors"
        style={{ background: TOKENS.surfaceAlt, color: TOKENS.text, border: `1px solid ${TOKENS.borderStrong}` }}
      >
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );
}
