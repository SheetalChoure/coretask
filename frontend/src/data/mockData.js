// ---------------------------------------------------------------------
// Mock data. Replace the exported arrays/objects with real fetch calls
// (e.g. in DashboardHome's useEffect) when wiring up a backend.
// ---------------------------------------------------------------------

export const CURRENT_USER = {
  name: "Priya Nair",
  role: "Senior Backend Engineer",
  initials: "PN",
  team: "Platform · Core Services",
};

export const PROJECTS_SEED = [
  {
    id: "p1",
    name: "Payments Gateway v3",
    repo: "core/payments-gateway",
    description: "Migrate settlement pipeline to event-driven architecture.",
    tags: ["backend", "critical"],
    progress: 72,
    tasksDone: 26,
    tasksTotal: 36,
    due: "Sep 4",
    status: "on-track",
    members: ["PN", "RK", "AS", "TL"],
  },
  {
    id: "p2",
    name: "Design System 2.0",
    repo: "web/ds-tokens",
    description: "Unify component tokens across web and mobile clients.",
    tags: ["frontend", "design"],
    progress: 41,
    tasksDone: 14,
    tasksTotal: 34,
    due: "Sep 18",
    status: "at-risk",
    members: ["AS", "MC"],
  },
  {
    id: "p3",
    name: "Observability Uplift",
    repo: "infra/otel-rollout",
    description: "Roll out OpenTelemetry tracing across all services.",
    tags: ["infra", "reliability"],
    progress: 93,
    tasksDone: 27,
    tasksTotal: 29,
    due: "Aug 27",
    status: "on-track",
    members: ["RK", "TL", "PN"],
  },
  {
    id: "p4",
    name: "Mobile Offline Sync",
    repo: "mobile/offline-sync",
    description: "Conflict-free replicated state for offline-first editing.",
    tags: ["mobile"],
    progress: 18,
    tasksDone: 4,
    tasksTotal: 22,
    due: "Oct 2",
    status: "blocked",
    members: ["MC", "JV"],
  },
  {
    id: "p5",
    name: "Internal Admin Console",
    repo: "tools/admin-console",
    description: "Give support staff self-serve refund and audit tools.",
    tags: ["internal"],
    progress: 58,
    tasksDone: 11,
    tasksTotal: 19,
    due: "Sep 10",
    status: "on-track",
    members: ["TL", "AS"],
  },
  {
    id: "p6",
    name: "Rate Limiter Rewrite",
    repo: "core/rate-limiter",
    description: "Replace token bucket with sliding-window Redis impl.",
    tags: ["backend"],
    progress: 8,
    tasksDone: 1,
    tasksTotal: 12,
    due: "Oct 14",
    status: "on-track",
    members: ["PN"],
  },
];

export const TASKS_SEED = [
  { id: "t1", title: "Add idempotency keys to settlement writes", project: "Payments Gateway v3", priority: "high", status: "in-progress", assignee: "PN", due: "Today" },
  { id: "t2", title: "Write migration rollback runbook", project: "Payments Gateway v3", priority: "medium", status: "todo", assignee: "RK", due: "Tomorrow" },
  { id: "t3", title: "Ship button + input token audit", project: "Design System 2.0", priority: "medium", status: "in-progress", assignee: "AS", due: "Today" },
  { id: "t4", title: "Deprecate legacy color variables", project: "Design System 2.0", priority: "low", status: "todo", assignee: "MC", due: "Aug 28" },
  { id: "t5", title: "Instrument checkout service spans", project: "Observability Uplift", priority: "high", status: "done", assignee: "TL", due: "Aug 21" },
  { id: "t6", title: "Set up trace sampling policy", project: "Observability Uplift", priority: "medium", status: "done", assignee: "PN", due: "Aug 20" },
  { id: "t7", title: "Resolve CRDT merge conflict on notes", project: "Mobile Offline Sync", priority: "high", status: "blocked", assignee: "JV", due: "Overdue" },
  { id: "t8", title: "Draft refund audit trail schema", project: "Internal Admin Console", priority: "medium", status: "in-progress", assignee: "TL", due: "Aug 25" },
  { id: "t9", title: "Benchmark sliding window under burst load", project: "Rate Limiter Rewrite", priority: "low", status: "todo", assignee: "PN", due: "Sep 1" },
  { id: "t10", title: "Review PR #482 — retry backoff jitter", project: "Payments Gateway v3", priority: "high", status: "todo", assignee: "RK", due: "Today" },
];

// git-style contribution heatmap: 16 weeks x 7 days, intensity 0-4
export const ACTIVITY = Array.from({ length: 16 }, () =>
  Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
);

export const NAV_ITEMS_META = [
  { key: "home", label: "Dashboard" },
  { key: "projects", label: "Projects" },
  { key: "tasks", label: "Tasks" },
  { key: "reports", label: "Reports" },
];

export const PROJECT_FILTERS = [
  { key: "all", label: "All" },
  { key: "on-track", label: "On track" },
  { key: "at-risk", label: "At risk" },
  { key: "blocked", label: "Blocked" },
];

export const TASK_FILTERS = [
  { key: "all", label: "All" },
  { key: "todo", label: "To do" },
  { key: "in-progress", label: "In progress" },
  { key: "done", label: "Done" },
  { key: "blocked", label: "Blocked" },
];
