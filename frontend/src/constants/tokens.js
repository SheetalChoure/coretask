// ---------------------------------------------------------------------
// Design tokens — single source of truth for color, so every component
// stays visually consistent. Edit values here to re-theme the whole app.
// ---------------------------------------------------------------------

export const TOKENS = {
  bg: "#0C0E12",
  surface: "#15181E",
  surfaceAlt: "#1B1F27",
  border: "#262B34",
  borderStrong: "#343A46",
  text: "#E7E9EE",
  textMuted: "#8A93A3",
  textFaint: "#5C6472",
  accent: "#4E7FFF",
  accentSoft: "rgba(78,127,255,0.14)",
  success: "#3FB950",
  successSoft: "rgba(63,185,80,0.14)",
  warning: "#D9922B",
  warningSoft: "rgba(217,146,43,0.14)",
  danger: "#F0654A",
  dangerSoft: "rgba(240,101,74,0.14)",
};

export const FONT_IMPORT_URL =
  "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&display=swap";

export const FONT_DISPLAY = "'Space Grotesk', sans-serif";
export const FONT_BODY = "'Inter', sans-serif";
export const FONT_MONO = "'JetBrains Mono', monospace";

// Shared status → { label, tone } lookups used by badges, progress bars, icons.
// These match the real API's Project.status enum (active/on-hold/completed/archived).
export const STATUS_META = {
  active: { label: "Active", tone: "success" },
  "on-hold": { label: "On hold", tone: "warning" },
  completed: { label: "Completed", tone: "accent" },
  archived: { label: "Archived", tone: "neutral" },
};

export const PRIORITY_META = {
  high: { label: "High", tone: "danger" },
  medium: { label: "Medium", tone: "warning" },
  low: { label: "Low", tone: "neutral" },
};
