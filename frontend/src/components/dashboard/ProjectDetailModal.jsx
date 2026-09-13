import React, { useEffect, useState, useCallback } from "react";
import { Pencil, Calendar, AlertCircle, Loader2, Plus, ListChecks } from "lucide-react";
import { TOKENS, STATUS_META } from "../../constants/tokens";
import Modal from "../primitives/Modal";
import Badge from "../primitives/Badge";
import ProgressBar from "../primitives/ProgressBar";
import Avatar from "../primitives/Avatar";
import ConfirmDeleteButton from "../primitives/ConfirmDeleteButton";
import TaskRow from "./TaskRow";
import TaskFormModal from "./TaskFormModal";
import { TaskRowSkeleton } from "../states/Skeletons";
import EmptyState from "../states/EmptyState";
import AiTaskSuggestions from "./AiTaskSuggestions";
import * as projectsApi from "../../api/projects";
import * as tasksApi from "../../api/tasks";

export default function ProjectDetailModal({ projectId, onClose, onEdit, onDeleted }) {
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState(null); // null = loading
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [creatingTask, setCreatingTask] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [p, t] = await Promise.all([projectsApi.getProject(projectId), tasksApi.listProjectTasks(projectId)]);
      setProject(p);
      setTasks(t);
    } catch (err) {
      setError(err.message);
    }
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  const adjustTaskCounts = (delta) => {
    setProject((p) => (p ? { ...p, taskCounts: { ...p.taskCounts, total: p.taskCounts.total + delta } } : p));
  };

  const handleToggleTask = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;
    const next = task.status === "done" ? "in-progress" : "done";
    try {
      const updated = await tasksApi.setTaskStatus(taskId, next);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      setProject((p) =>
        p ? { ...p, taskCounts: { ...p.taskCounts, done: p.taskCounts.done + (next === "done" ? 1 : -1) } } : p
      );
    } catch {
      // Swallow — an invalid transition (e.g. todo -> done directly) just
      // leaves the task unchanged; the row's checkbox reflects real state.
    }
  };

  const handleDeleteTask = async (taskId) => {
    const wasDone = tasks.find((t) => t.id === taskId)?.status === "done";
    await tasksApi.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setProject((p) =>
      p
        ? { ...p, taskCounts: { ...p.taskCounts, total: p.taskCounts.total - 1, done: p.taskCounts.done - (wasDone ? 1 : 0) } }
        : p
    );
  };

  const handleDeleteProject = async () => {
    setDeleteError(null);
    try {
      await projectsApi.deleteProject(projectId, { force: (project?.taskCounts?.total || 0) > 0 });
      onDeleted(projectId);
    } catch (err) {
      setDeleteError(err.message);
    }
  };

  const meta = project ? STATUS_META[project.status] : null;

  return (
    <Modal title={project ? project.name : "Loading…"} onClose={onClose} width={560}>
      {error && (
        <div className="flex items-start gap-2 rounded-lg px-3 py-2 text-[12.5px] mb-3" style={{ background: TOKENS.dangerSoft, color: TOKENS.danger }}>
          <AlertCircle size={14} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!project && !error && (
        <div className="flex items-center justify-center py-10">
          <Loader2 size={20} className="animate-spin" style={{ color: TOKENS.accent }} />
        </div>
      )}

      {project && (
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[13px]" style={{ color: TOKENS.textMuted }}>{project.description || "No description yet."}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                {meta && <Badge tone={meta.tone}>{meta.label}</Badge>}
                {(project.tags || []).map((t) => <Badge key={t} tone="neutral">{t}</Badge>)}
                {project.dueDate && (
                  <Badge tone="neutral"><Calendar size={11} className="inline mr-1 -mt-0.5" />{project.dueDate.slice(0, 10)}</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button onClick={() => onEdit(project)} className="flex items-center justify-center rounded-lg w-8 h-8" style={{ background: TOKENS.surfaceAlt, color: TOKENS.textMuted }} aria-label="Edit project">
                <Pencil size={14} />
              </button>
              <ConfirmDeleteButton onConfirm={handleDeleteProject} label="Delete project" size={32} />
            </div>
          </div>

          {deleteError && (
            <div className="flex items-start gap-2 rounded-lg px-3 py-2 text-[12.5px]" style={{ background: TOKENS.dangerSoft, color: TOKENS.danger }}>
              <AlertCircle size={14} className="shrink-0 mt-0.5" />
              <span>{deleteError}</span>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11.5px] font-mono" style={{ color: TOKENS.textFaint }}>
                {project.taskCounts.done}/{project.taskCounts.total} tasks done
              </span>
              <span className="text-[11.5px] font-mono font-medium" style={{ color: TOKENS.text }}>{project.progress}%</span>
            </div>
            <ProgressBar value={project.progress} size="sm" />
          </div>

          <div className="flex items-center gap-1.5">
            {(project.members || []).map((m) => <Avatar key={m.id} initials={m.initials} size={26} />)}
          </div>

          <AiTaskSuggestions
            projectId={project.id}
            onAccepted={(created) => {
              setTasks((prev) => [...created, ...(prev || [])]);
              adjustTaskCounts(created.length);
            }}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[12.5px] font-semibold" style={{ color: TOKENS.textMuted }}>Tasks</h3>
              <button
                onClick={() => setCreatingTask(true)}
                className="flex items-center gap-1 text-[12px] font-medium"
                style={{ color: TOKENS.accent }}
              >
                <Plus size={13} /> Add task
              </button>
            </div>
            {tasks === null && (
              <div className="flex flex-col gap-2">
                <TaskRowSkeleton /><TaskRowSkeleton />
              </div>
            )}
            {tasks && tasks.length === 0 && (
              <EmptyState icon={ListChecks} title="No tasks yet" message="Use AI suggestions above, or add a task manually." />
            )}
            {tasks && tasks.length > 0 && (
              <div className="flex flex-col gap-2">
                {tasks.map((t) => (
                  <TaskRow key={t.id} task={t} onToggle={handleToggleTask} onEdit={setEditingTask} onDelete={handleDeleteTask} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {creatingTask && (
        <TaskFormModal
          fixedProjectId={project.id}
          onClose={() => setCreatingTask(false)}
          onSaved={(created) => {
            setTasks((prev) => [created, ...(prev || [])]);
            adjustTaskCounts(1);
            setCreatingTask(false);
          }}
        />
      )}

      {editingTask && (
        <TaskFormModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSaved={(updated) => {
            setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
            setEditingTask(null);
          }}
        />
      )}
    </Modal>
  );
}
