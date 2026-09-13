import React, { useState, useEffect, useRef } from "react";
import { Trash2, Check, X as XIcon, Loader2 } from "lucide-react";
import { TOKENS } from "../../constants/tokens";

// A delete button that requires two clicks: the first arms a brief
// "Confirm? ✓ ✕" state, the second (on the check) actually deletes.
// Auto-disarms after a few seconds or on outside click, so it never gets
// stuck open. Deliberately not a browser confirm() popup — keeps the
// interaction inline and consistent with the rest of the UI.
export default function ConfirmDeleteButton({ onConfirm, label = "Delete", size = 26 }) {
  const [armed, setArmed] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!armed) return undefined;
    const timer = setTimeout(() => setArmed(false), 4000);
    const onOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setArmed(false);
    };
    document.addEventListener("mousedown", onOutside);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", onOutside);
    };
  }, [armed]);

  const handleConfirm = async (e) => {
    e.stopPropagation();
    setDeleting(true);
    try {
      await onConfirm();
    } finally {
      setDeleting(false);
      setArmed(false);
    }
  };

  if (armed) {
    return (
      <div ref={ref} className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
        <span className="text-[11px]" style={{ color: TOKENS.textFaint }}>Delete?</span>
        <button
          onClick={handleConfirm}
          disabled={deleting}
          aria-label={`Confirm ${label.toLowerCase()}`}
          className="flex items-center justify-center rounded-md disabled:opacity-60"
          style={{ width: 22, height: 22, background: TOKENS.dangerSoft, color: TOKENS.danger }}
        >
          {deleting ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setArmed(false); }}
          aria-label="Cancel"
          className="flex items-center justify-center rounded-md"
          style={{ width: 22, height: 22, background: TOKENS.surfaceAlt, color: TOKENS.textMuted }}
        >
          <XIcon size={12} />
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => { e.stopPropagation(); setArmed(true); }}
      aria-label={label}
      className="flex items-center justify-center rounded-lg shrink-0"
      style={{ width: size, height: size, color: TOKENS.textFaint }}
      onMouseEnter={(e) => (e.currentTarget.style.color = TOKENS.danger)}
      onMouseLeave={(e) => (e.currentTarget.style.color = TOKENS.textFaint)}
    >
      <Trash2 size={14} />
    </button>
  );
}
