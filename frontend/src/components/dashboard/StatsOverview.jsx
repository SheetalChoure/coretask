import React from "react";
import { FolderKanban, Clock, CheckCircle2, TrendingUp } from "lucide-react";
import { TOKENS } from "../../constants/tokens";
import { dueLabel } from "./TaskRow";

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl p-4 flex flex-col gap-2 min-w-0" style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}` }}>
      <span className="flex items-center justify-center rounded-lg" style={{ width: 30, height: 30, background: TOKENS.accentSoft, color: TOKENS.accent }}>
        <Icon size={15} />
      </span>
      <p className="text-2xl font-semibold tracking-tight font-mono" style={{ color: TOKENS.text }}>{value}</p>
      <p className="text-[12.5px]" style={{ color: TOKENS.textMuted }}>{label}</p>
    </div>
  );
}

// A task counts as "completed this week" if its most recent transition into
// "done" (from statusHistory) happened within the last 7 days — this is
// real derived data, not a fabricated trend number.
function completedWithinDays(task, days) {
  if (task.status !== "done") return false;
  const history = task.statusHistory || [];
  const lastDoneEntry = [...history].reverse().find((h) => h.status === "done");
  if (!lastDoneEntry) return false;
  const elapsed = Date.now() - new Date(lastDoneEntry.changedAt).getTime();
  return elapsed <= days * 24 * 60 * 60 * 1000;
}

export default function StatsOverview({ projects, tasks }) {
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const dueToday = tasks.filter((t) => dueLabel(t.dueDate) === "Today").length;
  const doneThisWeek = tasks.filter((t) => completedWithinDays(t, 7)).length;
  const avgProgress = projects.length
    ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
    : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      <StatCard icon={FolderKanban} label="Active projects" value={activeProjects} />
      <StatCard icon={Clock} label="Tasks due today" value={dueToday} />
      <StatCard icon={CheckCircle2} label="Completed this week" value={doneThisWeek} />
      <StatCard icon={TrendingUp} label="Avg. project progress" value={`${avgProgress}%`} />
    </div>
  );
}
