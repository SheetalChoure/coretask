import React from "react";
import { Zap } from "lucide-react";
import { TOKENS } from "../../constants/tokens";
import { ACTIVITY } from "../../data/mockData";

const levelColor = (lvl) => [TOKENS.surfaceAlt, "#1F6F3D", "#2B9147", "#3FB950", "#6FDE86"][lvl];

export default function ActivityHeatmap() {
  return (
    <div className="rounded-2xl p-4" style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}` }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[13px] font-semibold" style={{ color: TOKENS.text }}>Commit activity</h3>
          <p className="text-[11.5px] font-mono" style={{ color: TOKENS.textFaint }}>last 16 weeks · you</p>
        </div>
        <Zap size={15} style={{ color: TOKENS.textFaint }} />
      </div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {ACTIVITY.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((lvl, di) => (
              <div key={di} title={`${lvl} commits`} className="rounded-[2px]" style={{ width: 10, height: 10, background: levelColor(lvl) }} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[10.5px] font-mono" style={{ color: TOKENS.textFaint }}>less</span>
        {[0, 1, 2, 3, 4].map((lvl) => (
          <div key={lvl} className="rounded-[2px]" style={{ width: 9, height: 9, background: levelColor(lvl) }} />
        ))}
        <span className="text-[10.5px] font-mono" style={{ color: TOKENS.textFaint }}>more</span>
      </div>
    </div>
  );
}
