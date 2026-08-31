import { apiFetch } from "./client";

/**
 * Request task suggestions for a project based on an optional goal and count.
 * Suggestions are not persisted on the server until explicitly accepted.
 *
 * @param {string} projectId
 * @param {Object} [options]
 * @param {string} [options.goal=""]
 * @param {number} [options.count=5]
 * @returns {Promise<Array<{title: string, description: string, priority: string}>>}
 */
export async function suggestTasks(projectId, { goal = "", count = 5 } = {}) {
  const json = await apiFetch(`/projects/${projectId}/ai/suggest-tasks`, {
    method: "POST",
    body: { goal, count },
  });
  return json.data.suggestions;
}

/**
 * Persist a batch of selected AI-suggested tasks to a project.
 *
 * @param {string} projectId
 * @param {Array<Object>} tasks
 * @returns {Promise<Array<Object>>}
 */
export async function acceptTasks(projectId, tasks) {
  const json = await apiFetch(`/projects/${projectId}/ai/accept-tasks`, {
    method: "POST",
    body: { tasks },
  });
  return json.data.tasks;
}

/**
 * Generate a concise 4-5 sentence project description using a project name and optional keywords.
 *
 * @param {Object} params
 * @param {string} params.name
 * @param {Array<string>} [params.keywords=[]]
 * @returns {Promise<string>}
 */
export async function generateProjectDescription({ name, keywords = [] } = {}) {
  const json = await apiFetch("/ai/generate-description", {
    method: "POST",
    body: { name, keywords },
  });
  return json.data.description;
}

