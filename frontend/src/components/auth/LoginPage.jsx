import React, { useState } from "react";
import { GitBranch, Loader2, AlertCircle } from "lucide-react";
import { TOKENS, FONT_DISPLAY } from "../../constants/tokens";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { login, register, error, setError } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("priya@taskflow.dev");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
    } catch {
      // error is already captured in context state; nothing else to do here
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center px-4" style={{ background: TOKENS.bg }}>
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-6">
          <div
            className="flex items-center justify-center rounded-xl mb-3"
            style={{ width: 44, height: 44, background: TOKENS.accentSoft, color: TOKENS.accent }}
          >
            <GitBranch size={22} />
          </div>
          <h1 className="text-lg font-semibold" style={{ color: TOKENS.text, fontFamily: FONT_DISPLAY }}>
            CoreTask
          </h1>
          <p className="text-[13px] mt-1" style={{ color: TOKENS.textMuted }}>
            {mode === "login" ? "Sign in to your workspace" : "Create your workspace account"}
          </p>
        </div>

        <div className="rounded-2xl p-5" style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}` }}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {mode === "register" && (
              <Field label="Name">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  placeholder="Ada Lovelace"
                  style={inputStyle}
                />
              </Field>
            )}

            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                style={inputStyle}
                autoComplete="username"
              />
            </Field>

            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                style={inputStyle}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
              />
            </Field>

            {error && (
              <div
                className="flex items-start gap-2 rounded-lg px-3 py-2 text-[12.5px]"
                style={{ background: TOKENS.dangerSoft, color: TOKENS.danger }}
              >
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-lg py-2.5 text-[13px] font-medium mt-1 transition-opacity disabled:opacity-60"
              style={{ background: TOKENS.accent, color: "#fff" }}
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              {mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          {mode === "login" && (
            <p className="text-[11.5px] font-mono mt-4 text-center" style={{ color: TOKENS.textFaint }}>
              demo: priya@taskflow.dev · Password123!
            </p>
          )}
        </div>

        <p className="text-center text-[12.5px] mt-4" style={{ color: TOKENS.textMuted }}>
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setError(null);
              setMode(mode === "login" ? "register" : "login");
            }}
            className="font-medium"
            style={{ color: TOKENS.accent }}
          >
            {mode === "login" ? "Create one" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium" style={{ color: TOKENS.textMuted }}>{label}</span>
      {children}
    </label>
  );
}

const inputStyle = {
  background: TOKENS.surfaceAlt,
  color: TOKENS.text,
  border: `1px solid ${TOKENS.border}`,
  borderRadius: 8,
  padding: "9px 11px",
  fontSize: 13,
  outline: "none",
};
