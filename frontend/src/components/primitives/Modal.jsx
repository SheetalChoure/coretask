import React, { useEffect } from "react";
import { X } from "lucide-react";
import { TOKENS, FONT_DISPLAY } from "../../constants/tokens";

export default function Modal({ title, onClose, children, width = 480 }) {
  // Close on Escape — small thing, but expected behavior for any modal.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ background: "rgba(0,0,0,0.6)" }} onClick={onClose} />
      <div
        className="relative w-full rounded-2xl flex flex-col max-h-[90vh]"
        style={{ maxWidth: width, background: TOKENS.surface, border: `1px solid ${TOKENS.borderStrong}` }}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: TOKENS.border }}>
          <h2 className="text-[14.5px] font-semibold" style={{ color: TOKENS.text, fontFamily: FONT_DISPLAY }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center rounded-lg w-7 h-7"
            style={{ color: TOKENS.textMuted }}
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-5 py-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
