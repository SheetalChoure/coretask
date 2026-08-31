import { apiFetch } from "./client";

function toQueryString(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

// Flat list across all projects — used by the dashboard's global Tasks view.
export async function listAllTasks(filters = {}) {
  const json = await apiFetch(`/tasks${toQueryString(filters)}`);
  return json.data.tasks;
}

export async function listProjectTasks(projectId, filters = {}) {
  const json = await apiFetch(`/projects/${projectId}/tasks${toQueryString(filters)}`);
  return json.data.tasks;
}

export async function getTask(id) {
  const json = await apiFetch(`/tasks/${id}`);
  return json.data.task;
}

export async function createTask(projectId, { title, description, assigneeId, priority, dueDate }) {
  const json = await apiFetch(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: { title, description, assigneeId, priority, dueDate },
  });
  return json.data.task;
}

export async function updateTask(id, patch) {
  const json = await apiFetch(`/tasks/${id}`, { method: "PATCH", body: patch });
  return json.data.task;
}

export async function setTaskStatus(id, status) {
  const json = await apiFetch(`/tasks/${id}/status`, { method: "PATCH", body: { status } });
  return json.data.task;
}

export async function deleteTask(id) {
  await apiFetch(`/tasks/${id}`, { method: "DELETE" });
}
