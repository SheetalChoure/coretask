import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FolderKanban, Plus, Search } from "lucide-react";
import { TOKENS } from "../../constants/tokens";
import { PROJECT_FILTERS } from "../../constants/filters";
import SectionHeader from "./SectionHeader";
import FilterBar from "./FilterBar";
import ProjectCard from "./ProjectCard";
import ProjectFormModal from "./ProjectFormModal";
import ProjectDetailModal from "./ProjectDetailModal";
import EmptyState from "../states/EmptyState";
import ErrorState from "../states/ErrorState";
import { ProjectCardSkeleton } from "../states/Skeletons";
import * as projectsApi from "../../api/projects";

export default function ProjectsSection({ search }) {
  const [state, setState] = useState("loading"); // loading | ready | empty | error
  const [projects, setProjects] = useState([]);
  const [filter, setFilter] = useState("all");
  const [creating, setCreating] = useState(false);
  const [editingProject, setEditingProject] = useState(null); // project object, or null
  const [viewingProjectId, setViewingProjectId] = useState(null);

  const load = useCallback(() => {
    setState("loading");
    projectsApi
      .listProjects()
      .then((data) => {
        setProjects(data);
        setState(data.length ? "ready" : "empty");
      })
      .catch(() => setState("error"));
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    return projects
      .filter((p) => filter === "all" || p.status === filter)
      .filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          (p.tags || []).some((t) => t.includes(search.toLowerCase()))
      );
  }, [projects, filter, search]);

  const effectiveState = state === "ready" && filtered.length === 0 && projects.length > 0 ? "filtered-empty" : state;

  const handleSaved = (saved) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev];
    });
    setState((s) => (s === "empty" ? "ready" : s));
    setCreating(false);
    setEditingProject(null);
  };

  const handleDeleted = (id) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setViewingProjectId(null);
  };

  return (
    <section>
      <SectionHeader
        icon={FolderKanban}
        title="Projects"
        count={state === "ready" ? filtered.length : undefined}
        action={
          <button
            onClick={() => setCreating(true)}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12.5px] font-medium"
            style={{ background: TOKENS.surfaceAlt, color: TOKENS.text, border: `1px solid ${TOKENS.border}` }}
          >
            <Plus size={14} /> New project
          </button>
        }
      />
      <div className="mb-3">
        <FilterBar filters={PROJECT_FILTERS} active={filter} setActive={setFilter} />
      </div>

      {effectiveState === "loading" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      )}
      {effectiveState === "error" && <ErrorState message="We couldn't fetch your projects." onRetry={load} />}
      {effectiveState === "empty" && (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          message="Create your first project to start tracking progress and tasks."
          actionLabel="New project"
          onAction={() => setCreating(true)}
        />
      )}
      {effectiveState === "filtered-empty" && (
        <EmptyState icon={Search} title="No projects match" message="Try a different search term or clear the active filter." />
      )}
      {effectiveState === "ready" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <ProjectCard key={p.id} project={p} onClick={() => setViewingProjectId(p.id)} />
          ))}
        </div>
      )}

      {creating && <ProjectFormModal onClose={() => setCreating(false)} onSaved={handleSaved} />}
      {editingProject && <ProjectFormModal project={editingProject} onClose={() => setEditingProject(null)} onSaved={handleSaved} />}
      {viewingProjectId && (
        <ProjectDetailModal
          projectId={viewingProjectId}
          onClose={() => setViewingProjectId(null)}
          onEdit={(project) => {
            setViewingProjectId(null);
            setEditingProject(project);
          }}
          onDeleted={handleDeleted}
        />
      )}
    </section>
  );
}
