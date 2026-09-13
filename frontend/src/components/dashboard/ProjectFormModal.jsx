import React, { useState } from "react";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import { TOKENS } from "../../constants/tokens";
import Modal from "../primitives/Modal";
import * as projectsApi from "../../api/projects";
import * as aiApi from "../../api/ai";

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

// Used for both "create" (project == null) and "edit" (project provided).
export default function ProjectFormModal({ project, onClose, onSaved }) {
  const isEdit = Boolean(project);
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [tags, setTags] = useState((project?.tags || []).join(", "));
  const [dueDate, setDueDate] = useState(project?.dueDate ? project.dueDate.slice(0, 10) : "");
  const [status, setStatus] = useState(project?.status || "active");
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerateDescription = async () => {
    if (!name.trim()) {
      setError("Enter a project name first — the AI uses it to write the description.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
      const generated = await aiApi.generateProjectDescription({ name, keywords: tagList });
      setDescription(generated);
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        name,
        description,
        status,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        dueDate: dueDate || null,
      };
      const saved = isEdit ? await projectsApi.updateProject(project.id, payload) : await projectsApi.createProject(payload);
      onSaved(saved);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title={isEdit ? "Edit project" : "New project"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
        <Field label="Name">
          <input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} style={inputStyle} placeholder="Payments Gateway v3" />
        </Field>

        <Field label="Description">
          <div className="flex flex-col gap-1.5">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="What is this project about?"
            />
            <button
              type="button"
              onClick={handleGenerateDescription}
              disabled={generating}
              className="self-start flex items-center gap-1.5 text-[12px] font-medium disabled:opacity-60"
              style={{ color: TOKENS.accent }}
            >
              {generating ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
              {generating ? "Generating…" : "Generate with AI"}
            </button>
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value)} style={inputStyle}>
              <option value="active">Active</option>
              <option value="on-hold">On hold</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </Field>
          <Field label="Due date">
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} style={inputStyle} />
          </Field>
        </div>

        <Field label="Tags (comma-separated)">
          <input value={tags} onChange={(e) => setTags(e.target.value)} style={inputStyle} placeholder="backend, critical" />
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
            {isEdit ? "Save changes" : "Create project"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
