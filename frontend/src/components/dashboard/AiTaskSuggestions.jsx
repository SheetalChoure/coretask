import React, { useState } from "react";
import { Sparkles, Loader2, AlertCircle, Check, X as XIcon } from "lucide-react";
import { TOKENS, FONT_DISPLAY } from "../../constants/tokens";
import Badge from "../primitives/Badge";
import * as aiApi from "../../api/ai";

const PRIORITY_TONE = { high: "danger", medium: "warning", low: "neutral" };

export default function AiTaskSuggestions({ projectId, onAccepted }) {
  const [goal, setGoal] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | error | ready
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [selected, setSelected] = useState(() => new Set());
  const [accepting, setAccepting] = useState(false);

  const handleGenerate = async () => {
    setStatus("loading");
    setError(null);
    try {
      const results = await aiApi.suggestTasks(projectId, { goal, count: 5 });
      setSuggestions(results);
      setSelected(new Set(results.map((_, i) => i)));
      setStatus("ready");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  };

  const toggle = (i) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  };

  const handleAccept = async () => {
    const chosen = suggestions.filter((_, i) => selected.has(i));
    if (chosen.length === 0) return;
    setAccepting(true);
    setError(null);
    try {
      const created = await aiApi.acceptTasks(projectId, chosen);
      onAccepted(created);
      setSuggestions([]);
      setStatus("idle");
      setGoal("");
    } catch (err) {
      setError(err.message);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <div className="rounded-2xl p-4" style={{ background: TOKENS.surfaceAlt, border: `1px solid ${TOKENS.border}` }}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={15} style={{ color: TOKENS.accent }} />
        <h3 className="text-[13.5px] font-semibold" style={{ color: TOKENS.text, fontFamily: FONT_DISPLAY }}>
          AI task suggestions
        </h3>
      </div>

      {status !== "ready" && (
        <div className="flex flex-col gap-2.5">
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder='Optional: what&apos;s the current focus? (e.g. "prep for security audit")'
            className="w-full rounded-lg px-3 py-2 text-[12.5px] outline-none"
            style={{ background: TOKENS.surface, color: TOKENS.text, border: `1px solid ${TOKENS.border}` }}
          />
          <button
            onClick={handleGenerate}
            disabled={status === "loading"}
            className="self-start flex items-center gap-2 rounded-lg px-3.5 py-2 text-[12.5px] font-medium disabled:opacity-60"
            style={{ background: TOKENS.accent, color: "#fff" }}
          >
            {status === "loading" ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {status === "loading" ? "Thinking…" : "Suggest tasks"}
          </button>
        </div>
      )}

      {status === "error" && (
        <div className="flex items-start gap-2 rounded-lg px-3 py-2 mt-2.5 text-[12.5px]" style={{ background: TOKENS.dangerSoft, color: TOKENS.danger }}>
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {status === "ready" && (
        <div className="flex flex-col gap-2.5">
          <p className="text-[11.5px]" style={{ color: TOKENS.textFaint }}>
            Uncheck anything you don't want, then add the rest as real tasks.
          </p>
          <div className="flex flex-col gap-1.5">
            {suggestions.map((s, i) => (
              <label
                key={i}
                className="flex items-start gap-2.5 rounded-lg px-3 py-2.5 cursor-pointer"
                style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}` }}
              >
                <input type="checkbox" checked={selected.has(i)} onChange={() => toggle(i)} className="mt-1" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-[13px] font-medium truncate" style={{ color: TOKENS.text }}>{s.title}</p>
                    <Badge tone={PRIORITY_TONE[s.priority] || "neutral"}>{s.priority}</Badge>
                  </div>
                  {s.description && <p className="text-[12px] mt-0.5" style={{ color: TOKENS.textMuted }}>{s.description}</p>}
                </div>
              </label>
            ))}
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg px-3 py-2 text-[12.5px]" style={{ background: TOKENS.dangerSoft, color: TOKENS.danger }}>
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={handleAccept}
              disabled={accepting || selected.size === 0}
              className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[12.5px] font-medium disabled:opacity-60"
              style={{ background: TOKENS.success, color: "#fff" }}
            >
              {accepting ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
              Add {selected.size || ""} task{selected.size === 1 ? "" : "s"}
            </button>
            <button
              onClick={() => { setStatus("idle"); setSuggestions([]); }}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-medium"
              style={{ color: TOKENS.textMuted }}
            >
              <XIcon size={13} /> Discard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
