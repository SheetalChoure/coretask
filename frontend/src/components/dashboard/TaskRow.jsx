import React from "react";
import { CircleDot, CheckCircle2, CircleDashed, Pencil } from "lucide-react";
import { TOKENS, PRIORITY_META } from "../../constants/tokens";
import Badge from "../primitives/Badge";
import Avatar from "../primitives/Avatar";
import ConfirmDeleteButton from "../primitives/ConfirmDeleteButton";

const TASK_STATUS_META = {
  todo: { label: "To do", icon: CircleDashed, tone: "neutral" },
  "in-progress": { label: "In progress", icon: CircleDot, tone: "accent" },
  done: { label: "Done", icon: CheckCircle2, tone: "success" },
};

// Turns an ISO due date into a short label ("Today", "Aug 28", "Overdue"),
// derived from the real dueDate the API returns.
function dueLabel(dueDate) {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDue = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const diffDays = Math.round((startOfDue - startOfToday) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "Overdue";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  return due.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// `projectName` is optional — pass it in list views that span multiple
// projects (e.g. the global Tasks tab); omit it inside a single project's
// detail view where repeating the name would be redundant.
// `onEdit`/`onDelete` are optional — omit either to hide that action.
export default function TaskRow({ task, onToggle, projectName, onEdit, onDelete }) {
  const sMeta = TASK_STATUS_META[task.status] || TASK_STATUS_META.todo;
  const pMeta = PRIORITY_META[task.priority] || PRIORITY_META.medium;
  const StatusIcon = sMeta.icon;
  const due = dueLabel(task.dueDate);
  const overdue = due === "Overdue";

  return (
    <div
      className="group flex items-center gap-3 px-4 py-3 rounded-xl transition-colors"
      style={{ background: TOKENS.surface, border: `1px solid ${TOKENS.border}` }}
    >
      <button
        onClick={() => onToggle(task.id)}
        aria-label={task.status === "done" ? "Mark as not done" : "Mark as done"}
        className="shrink-0"
        style={{ color: sMeta.tone === "success" ? TOKENS.success : TOKENS.textFaint }}
      >
        <StatusIcon size={18} />
      </button>

      <div className="min-w-0 flex-1">
        <p
          className="text-[13px] font-medium truncate"
          style={{ color: task.status === "done" ? TOKENS.textFaint : TOKENS.text, textDecoration: task.status === "done" ? "line-through" : "none" }}
        >
          {task.title}
        </p>
        {projectName && <p className="text-[11.5px] font-mono truncate" style={{ color: TOKENS.textFaint }}>{projectName}</p>}
      </div>

      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <Badge tone={pMeta.tone}>{pMeta.label}</Badge>
        {due && <Badge tone={overdue ? "danger" : "neutral"} mono>{due}</Badge>}
      </div>

      {task.assignee ? (
        <Avatar initials={task.assignee.initials} size={26} />
      ) : (
        <div
          className="flex items-center justify-center rounded-full shrink-0"
          style={{ width: 26, height: 26, border: `1px dashed ${TOKENS.borderStrong}`, color: TOKENS.textFaint }}
          title="Unassigned"
        >
          <span className="text-[10px]">?</span>
        </div>
      )}

      {(onEdit || onDelete) && (
        <div className="flex items-center gap-0.5 shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(task)}
              aria-label="Edit task"
              className="flex items-center justify-center rounded-lg"
              style={{ width: 26, height: 26, color: TOKENS.textFaint }}
              onMouseEnter={(e) => (e.currentTarget.style.color = TOKENS.accent)}
              onMouseLeave={(e) => (e.currentTarget.style.color = TOKENS.textFaint)}
            >
              <Pencil size={13} />
            </button>
          )}
          {onDelete && <ConfirmDeleteButton onConfirm={() => onDelete(task.id)} label="Delete task" />}
        </div>
      )}
    </div>
  );
}

export { TASK_STATUS_META, dueLabel };
