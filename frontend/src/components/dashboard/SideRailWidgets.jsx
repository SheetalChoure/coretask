import React from "react";
import { Users } from "lucide-react";
import { TOKENS } from "../../constants/tokens";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../primitives/Avatar";
import Badge from "../primitives/Badge";

function initialsFor(name = "") {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export function ProfileSummary() {
  const { user } = useAuth();
  return (
    <div className="rounded-2xl p-4" style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}` }}>
      <div className="flex items-center gap-3 mb-3">
        <Avatar initials={initialsFor(user?.name)} size={44} />
        <div className="min-w-0">
          <p className="text-[13.5px] font-semibold truncate" style={{ color: TOKENS.text }}>{user?.name}</p>
          <p className="text-[11.5px] truncate" style={{ color: TOKENS.textFaint }}>{user?.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge tone="accent"><Users size={11} className="inline mr-1 -mt-0.5" />{user?.role}</Badge>
      </div>
    </div>
  );
}

// Edit this array to change what shows in the "This week" card
const WEEKLY_STATS = [
  { label: "Story points closed", value: "34" },
  { label: "PRs reviewed", value: "12" },
  { label: "Open bugs assigned", value: "3" },
];

export function WeeklyStats() {
  return (
    <div className="rounded-2xl p-4" style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}` }}>
      <h3 className="text-[13px] font-semibold mb-3" style={{ color: TOKENS.text }}>This week</h3>
      <div className="flex flex-col gap-2.5">
        {WEEKLY_STATS.map((row) => (
          <div key={row.label} className="flex items-center justify-between">
            <span className="text-[12.5px]" style={{ color: TOKENS.textMuted }}>{row.label}</span>
            <span className="text-[13px] font-mono font-semibold" style={{ color: TOKENS.text }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
