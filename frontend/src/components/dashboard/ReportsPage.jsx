import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { BarChart3, AlertCircle } from "lucide-react";
import { TOKENS, FONT_DISPLAY, STATUS_META, PRIORITY_META } from "../../constants/tokens";
import ProgressBar from "../primitives/ProgressBar";
import ErrorState from "../states/ErrorState";
import { Skeleton } from "../states/Skeletons";
import EmptyState from "../states/EmptyState";
import * as projectsApi from "../../api/projects";
import * as tasksApi from "../../api/tasks";
import { dueLabel } from "./TaskRow";

const STATUS_ORDER = ["todo", "in-progress", "done"];
const PRIORITY_ORDER = ["low", "medium", "high"];

const STATUS_COLORS = { todo: TOKENS.textFaint, "in-progress": TOKENS.accent, done: TOKENS.success };
const PRIORITY_COLORS = { low: TOKENS.textFaint, medium: TOKENS.warning, high: TOKENS.danger };

function ChartCard({ title, children }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}` }}>
      <h3 className="text-[13px] font-semibold mb-3" style={{ color: TOKENS.text }}>{title}</h3>
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg px-2.5 py-1.5 text-[12px]" style={{ background: TOKENS.surfaceAlt, border: `1px solid ${TOKENS.borderStrong}`, color: TOKENS.text }}>
      <p className="font-medium">{label}</p>
      <p style={{ color: TOKENS.textMuted }}>{payload[0].value} task{payload[0].value === 1 ? "" : "s"}</p>
    </div>
  );
}

export default function ReportsPage() {
  const [state, setState] = useState("loading");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);

  const load = () => {
    setState("loading");
    Promise.all([projectsApi.listProjects(), tasksApi.listAllTasks()])
      .then(([p, t]) => {
        setProjects(p);
        setTasks(t);
        setState(p.length === 0 && t.length === 0 ? "empty" : "ready");
      })
      .catch(() => setState("error"));
  };

  useEffect(load, []);

  if (state === "loading") {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-64 rounded-2xl" />
          <Skeleton className="h-64 rounded-2xl" />
        </div>
        <Skeleton className="h-48 rounded-2xl" />
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight" style={{ color: TOKENS.text, fontFamily: FONT_DISPLAY }}>Reports</h1>
        <ErrorState message="We couldn't load your report data." onRetry={load} />
      </div>
    );
  }

  if (state === "empty") {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight" style={{ color: TOKENS.text, fontFamily: FONT_DISPLAY }}>Reports</h1>
        <EmptyState icon={BarChart3} title="Nothing to report yet" message="Create a project and a few tasks, and your stats will show up here." />
      </div>
    );
  }

  const statusData = STATUS_ORDER.map((status) => ({
    name: status === "in-progress" ? "In progress" : status === "todo" ? "To do" : "Done",
    key: status,
    value: tasks.filter((t) => t.status === status).length,
  }));

  const priorityData = PRIORITY_ORDER.map((priority) => ({
    name: PRIORITY_META[priority]?.label || priority,
    key: priority,
    value: tasks.filter((t) => t.priority === priority).length,
  }));

  const overdueCount = tasks.filter((t) => dueLabel(t.dueDate) === "Overdue" && t.status !== "done").length;
  const unassignedCount = tasks.filter((t) => !t.assigneeId).length;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl md:text-2xl font-semibold tracking-tight" style={{ color: TOKENS.text, fontFamily: FONT_DISPLAY }}>
        Reports
      </h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: "Total projects", value: projects.length },
          { label: "Total tasks", value: tasks.length },
          { label: "Overdue tasks", value: overdueCount, danger: overdueCount > 0 },
          { label: "Unassigned tasks", value: unassignedCount },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl p-4" style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}` }}>
            <p className="text-2xl font-semibold tracking-tight font-mono" style={{ color: s.danger ? TOKENS.danger : TOKENS.text }}>{s.value}</p>
            <p className="text-[12.5px] mt-1" style={{ color: TOKENS.textMuted }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ChartCard title="Tasks by status">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: TOKENS.textFaint, fontSize: 11 }} axisLine={{ stroke: TOKENS.border }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: TOKENS.textFaint, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: TOKENS.surfaceAlt }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {statusData.map((d) => <Cell key={d.key} fill={STATUS_COLORS[d.key]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Tasks by priority">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={priorityData}>
              <CartesianGrid strokeDasharray="3 3" stroke={TOKENS.border} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: TOKENS.textFaint, fontSize: 11 }} axisLine={{ stroke: TOKENS.border }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: TOKENS.textFaint, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: TOKENS.surfaceAlt }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {priorityData.map((d) => <Cell key={d.key} fill={PRIORITY_COLORS[d.key]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Progress by project">
        {projects.length === 0 ? (
          <p className="text-[12.5px]" style={{ color: TOKENS.textFaint }}>No projects yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {projects.map((p) => {
              const meta = STATUS_META[p.status] || STATUS_META.active;
              return (
                <div key={p.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12.5px] font-medium truncate" style={{ color: TOKENS.text }}>{p.name}</span>
                    <span className="text-[11.5px] font-mono" style={{ color: TOKENS.textFaint }}>
                      {p.taskCounts?.done ?? 0}/{p.taskCounts?.total ?? 0} · {p.progress ?? 0}%
                    </span>
                  </div>
                  <ProgressBar value={p.progress ?? 0} tone={meta.tone === "danger" ? "danger" : meta.tone === "warning" ? "warning" : "success"} size="sm" />
                </div>
              );
            })}
          </div>
        )}
      </ChartCard>

      {overdueCount > 0 && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: TOKENS.dangerSoft, color: TOKENS.danger }}>
          <AlertCircle size={15} />
          <p className="text-[12.5px]">
            {overdueCount} task{overdueCount === 1 ? " is" : "s are"} overdue and not yet done — check the Tasks tab.
          </p>
        </div>
      )}
    </div>
  );
}
