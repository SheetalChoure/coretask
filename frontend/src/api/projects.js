import { apiFetch } from "./client";

export async function listProjects({ page = 1, limit = 50 } = {}) {
  const json = await apiFetch(`/projects?page=${page}&limit=${limit}`);
  return json.data.projects;
}

export async function getProject(id) {
  const json = await apiFetch(`/projects/${id}`);
  return json.data.project;
}

export async function createProject({ name, description, status, tags, dueDate, memberIds }) {
  const json = await apiFetch("/projects", {
    method: "POST",
    body: { name, description, status, tags, dueDate, memberIds },
  });
  return json.data.project;
}

export async function updateProject(id, patch) {
  const json = await apiFetch(`/projects/${id}`, { method: "PATCH", body: patch });
  return json.data.project;
}

export async function deleteProject(id, { force = false } = {}) {
  await apiFetch(`/projects/${id}${force ? "?force=true" : ""}`, { method: "DELETE" });
}
