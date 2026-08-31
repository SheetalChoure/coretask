import React from "react";
import { Filter } from "lucide-react";
import { TOKENS } from "../../constants/tokens";

export default function FilterBar({ filters, active, setActive, sort, setSort, sortOptions }) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      <div className="flex items-center gap-1.5 shrink-0">
        <Filter size={13} style={{ color: TOKENS.textFaint }} />
      </div>
      {filters.map((f) => {
        const isActive = active === f.key;
        return (
          <button
            key={f.key}
            onClick={() => setActive(f.key)}
            className="shrink-0 rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors"
            style={{
              background: isActive ? TOKENS.accent : TOKENS.surface,
              color: isActive ? "#fff" : TOKENS.textMuted,
              border: `1px solid ${isActive ? TOKENS.accent : TOKENS.border}`,
            }}
          >
            {f.label}
          </button>
        );
      })}
      {sortOptions && (
        <div className="ml-auto shrink-0">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            aria-label="Sort by"
            className="rounded-lg pl-2.5 pr-7 py-1.5 text-[12.5px] font-medium outline-none appearance-none"
            style={{ background: TOKENS.surface, color: TOKENS.textMuted, border: `1px solid ${TOKENS.border}` }}
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
