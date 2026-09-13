import React, { useState, useEffect } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import { TOKENS } from "../../constants/tokens";
import Modal from "../primitives/Modal";
import * as tasksApi from "../../api/tasks";
import * as usersApi from "../../api/users";

const inputStyle = {
  background: TOKENS.surfaceAlt,
  color: TOKENS.text,
  border: `1px solid ${TOKENS.border}`,
  borderRadius: 8,
  padding: "9px 11px",
  fontSize: 13,
  outline: "none",
  width: "100%",
};

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[12px] font-medium" style={{ color: TOKENS.textMuted }}>{label}</span>
      {children}
    </label>
  );
}

// `projects` is the list of { id, name } to choose from. If `fixedProjectId`
// is given (creating from inside a project's own view), the picker is
// hidden and every task goes straight to that project.
// Pass `task` to edit an existing task instead of creating a new one —
// the project picker is hidden either way in that case, since a task's
// project can't be changed from this form.
export default function TaskFormModal({ projects, fixedProjectId, task, onClose, onSaved }) {
  const isEdit = Boolean(task);
  const [projectId, setProjectId] = useState(fixedProjectId || task?.projectId || projects?.[0]?.id || "");
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || "");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 10) : "");
  const [users, setUsers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    usersApi.listUsers().then(setUsers).catch(() => setUsers([]));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isEdit && !projectId) {
      setError("Choose a project for this task.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = { title, description, assigneeId: assigneeId || null, priority, dueDate: dueDate || null };
      const saved = isEdit ? await tasksApi.updateTask(task.id, payload) : await tasksApi.createTask(projectId, payload);
      onSaved(saved, projectId);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit task" : "New task"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        {!fixedProjectId && !isEdit && (
          <Field label="Project">
            <select value={projectId} onChange={(e) => setProjectId(e.target.value)} required style={inputStyle}>
              <option value="" disabled>Choose a project…</option>
              {(projects || []).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={2} style={inputStyle} placeholder="Add rate limiting to login endpoint" />
        </Field>

        <Field label="Description">
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} style={{ ...inputStyle, resize: "vertical" }} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Priority">
            <select value={priority} onChange={(e) => setPriority(e.target.value)} style={inputStyle}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </Field>
          <Field label="Due date">
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
          </Field>
        </div>

        <Field label="Assignee">
          <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} style={inputStyle}>
            <option value="">Unassigned</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </Field>

        {error && (
          <div className="flex items-start gap-2 rounded-lg px-3 py-2 text-[12.5px]" style={{ background: TOKENS.dangerSoft, color: TOKENS.danger }}>
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1">
          <button type="button" onClick={onClose} className="px-3.5 py-2 rounded-lg text-[13px] font-medium" style={{ color: TOKENS.textMuted }}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-medium disabled:opacity-60"
            style={{ background: TOKENS.accent, color: "#fff" }}
          >
            {submitting && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? "Save changes" : "Create task"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
