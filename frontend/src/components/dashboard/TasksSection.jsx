import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ListChecks, Plus, Search } from "lucide-react";
import { TOKENS } from "../../constants/tokens";
import { TASK_FILTERS } from "../../constants/filters";
import SectionHeader from "./SectionHeader";
import FilterBar from "./FilterBar";
import TaskRow, { dueLabel } from "./TaskRow";
import TaskFormModal from "./TaskFormModal";
import EmptyState from "../states/EmptyState";
import ErrorState from "../states/ErrorState";
import { TaskRowSkeleton } from "../states/Skeletons";
import * as tasksApi from "../../api/tasks";
import * as projectsApi from "../../api/projects";

const PRIORITY_RANK = { high: 0, medium: 1, low: 2 };

export default function TasksSection({ search }) {
  const [state, setState] = useState("loading"); // loading | ready | empty | error
  const [tasks, setTasks] = useState([]);
  const [projectsById, setProjectsById] = useState({});
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("priority");
  const [creating, setCreating] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const load = useCallback(() => {
    setState("loading");
    Promise.all([tasksApi.listAllTasks(), projectsApi.listProjects()])
      .then(([taskData, projectData]) => {
        setTasks(taskData);
        setProjectsById(Object.fromEntries(projectData.map((p) => [p.id, p])));
        setState(taskData.length ? "ready" : "empty");
      })
      .catch(() => setState("error"));
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleTask = useCallback(async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const next = task.status === "done" ? "in-progress" : "done";
    try {
      const updated = await tasksApi.setTaskStatus(id, next);
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch {
      // An invalid transition (e.g. todo -> done directly) just leaves the
      // task unchanged — the checkbox reflects the real persisted state.
    }
  }, [tasks]);

  const deleteTask = useCallback(async (id) => {
    await tasksApi.deleteTask(id);
    setTasks((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (next.length === 0) setState("empty");
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    let list = tasks
      .filter((t) => filter === "all" || t.status === filter)
      .filter((t) => {
        const projectName = projectsById[t.projectId]?.name || "";
        return (
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          projectName.toLowerCase().includes(search.toLowerCase())
        );
      });
    if (sort === "priority") list = [...list].sort((a, b) => PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]);
    if (sort === "due") {
      list = [...list].sort((a, b) => {
        const aOverdue = dueLabel(a.dueDate) === "Overdue" ? -1 : 0;
        const bOverdue = dueLabel(b.dueDate) === "Overdue" ? -1 : 0;
        return aOverdue - bOverdue;
      });
    }
    return list;
  }, [tasks, filter, search, sort, projectsById]);

  const effectiveState = state === "ready" && filtered.length === 0 && tasks.length > 0 ? "filtered-empty" : state;
  const projectOptions = Object.values(projectsById);

  return (
    <section>
      <SectionHeader
        icon={ListChecks}
        title="Tasks"
        count={state === "ready" ? filtered.length : undefined}
        action={
          <button
            onClick={() => setCreating(true)}
            disabled={projectOptions.length === 0}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium disabled:opacity-50"
            style={{ background: TOKENS.surfaceAlt, color: TOKENS.text, border: `1px solid ${TOKENS.border}` }}
            title={projectOptions.length === 0 ? "Create a project first" : undefined}
          >
            <Plus size={14} /> New task
          </button>
        }
      />
      <div className="mb-3">
        <FilterBar
          filters={TASK_FILTERS}
          active={filter}
          setActive={setFilter}
          sort={sort}
          setSort={setSort}
          sortOptions={[
            { value: "priority", label: "Sort: Priority" },
            { value: "due", label: "Sort: Due date" },
          ]}
        />
      </div>

      {effectiveState === "loading" && (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => <TaskRowSkeleton key={i} />)}
        </div>
      )}
      {effectiveState === "error" && <ErrorState message="We couldn't fetch your tasks." onRetry={load} />}
      {effectiveState === "empty" && (
        <EmptyState
          icon={ListChecks}
          title="No tasks yet"
          message="Break your projects down into tasks to track daily progress."
          actionLabel={projectOptions.length > 0 ? "New task" : undefined}
          onAction={() => setCreating(true)}
        />
      )}
      {effectiveState === "filtered-empty" && (
        <EmptyState icon={Search} title="No tasks match" message="Try a different search term or clear the active filter." />
      )}
      {effectiveState === "ready" && (
        <div className="flex flex-col gap-2">
          {filtered.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              onToggle={toggleTask}
              projectName={projectsById[t.projectId]?.name}
              onEdit={setEditingTask}
              onDelete={deleteTask}
            />
          ))}
        </div>
      )}

      {creating && (
        <TaskFormModal
          projects={projectOptions}
          onClose={() => setCreating(false)}
          onSaved={(created) => {
            setTasks((prev) => [created, ...prev]);
            setState((s) => (s === "empty" ? "ready" : s));
            setCreating(false);
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
    </section>
  );
}
