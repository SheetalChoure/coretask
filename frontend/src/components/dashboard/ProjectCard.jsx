import React from "react";
import { Calendar } from "lucide-react";
import { TOKENS, FONT_DISPLAY, STATUS_META } from "../../constants/tokens";
import Badge from "../primitives/Badge";
import ProgressBar from "../primitives/ProgressBar";
import Avatar from "../primitives/Avatar";

const PROGRESS_TONE = { archived: "neutral", "on-hold": "warning", completed: "success", active: "accent" };

function dueLabel(dueDate) {
  if (!dueDate) return null;
  return new Date(dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function ProjectCard({ project, onClick }) {
  const meta = STATUS_META[project.status] || STATUS_META.active;
  const members = project.members || [];
  const counts = project.taskCounts || { total: 0, done: 0 };
  const due = dueLabel(project.dueDate);

  return (
    <div
      onClick={onClick}
      className="group rounded-2xl p-4 flex flex-col gap-3 transition-colors cursor-pointer"
      style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}` }}
      onMouseEnter={(e) => (e.currentTarget.style.borderColor = TOKENS.borderStrong)}
      onMouseLeave={(e) => (e.currentTarget.style.borderColor = TOKENS.border)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold truncate" style={{ color: TOKENS.text, fontFamily: FONT_DISPLAY }}>
            {project.name}
          </h3>
          {project.owner && (
            <p className="text-[11.5px] font-mono truncate" style={{ color: TOKENS.textFaint }}>
              owned by {project.owner.name}
            </p>
          )}
        </div>
        <Badge tone={meta.tone}>{meta.label}</Badge>
      </div>

      <p className="text-[12.5px] leading-relaxed line-clamp-2" style={{ color: TOKENS.textMuted }}>
        {project.description || "No description yet."}
      </p>

      {(project.tags || []).length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.tags.map((t) => (
            <Badge key={t} tone="neutral">{t}</Badge>
          ))}
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11.5px] font-mono" style={{ color: TOKENS.textFaint }}>
            {counts.done}/{counts.total} tasks
          </span>
          <span className="text-[11.5px] font-mono font-medium" style={{ color: TOKENS.text }}>{project.progress ?? 0}%</span>
        </div>
        <ProgressBar value={project.progress ?? 0} tone={PROGRESS_TONE[project.status] || "accent"} size="sm" />
      </div>

      <div className="flex items-center justify-between pt-1">
        <div className="flex -space-x-2">
          {members.slice(0, 3).map((m) => (
            <Avatar key={m.id} initials={m.initials} size={24} />
          ))}
          {members.length > 3 && (
            <div
              className="flex items-center justify-center rounded-full font-mono text-[10px]"
              style={{ width: 24, height: 24, background: TOKENS.surfaceAlt, color: TOKENS.textFaint, boxShadow: `0 0 0 2px ${TOKENS.surface}` }}
            >
              +{members.length - 3}
            </div>
          )}
        </div>
        {due && (
          <span className="flex items-center gap-1 text-[11.5px] font-mono" style={{ color: TOKENS.textFaint }}>
            <Calendar size={12} /> {due}
          </span>
        )}
      </div>
    </div>
  );
}
