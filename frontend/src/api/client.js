// Base URL of the TaskFlow API. In production (Vercel), set VITE_API_URL
// in the frontend project's environment variables to your deployed
// backend's URL, e.g. https://your-backend.vercel.app/api/v1 — falls back
// to localhost for local development.
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

const TOKEN_KEY = "taskflow_token";
const USER_KEY = "taskflow_user";

/* ------------------------- token/user persistence ------------------------ */
// Stored in localStorage so the session survives a page refresh, per the
// chosen trade-off (simpler than httpOnly cookies, but readable by any JS
// on the page — fine for this project, worth swapping to cookies if this
// ever needs to resist XSS in production).

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function storeSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

/* -------------------------------- fetch wrapper --------------------------- */

/**
 * Thin wrapper around fetch() that:
 *  - prefixes API_BASE_URL
 *  - attaches Authorization: Bearer <token> when one is stored
 *  - parses the API's { success, data, error } envelope
 *  - throws a normal Error with a readable message on failure, so callers
 *    can just try/catch instead of checking res.ok everywhere
 */
export async function apiFetch(path, { method = "GET", body, headers = {} } = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let json = null;
  try {
    json = await res.json();
  } catch {
    // no/invalid JSON body — fall through, handled below
  }

  if (!res.ok) {
    const message = json?.error?.message || `Request failed with status ${res.status}`;
    const err = new Error(message);
    err.statusCode = res.status;
    err.details = json?.error?.details;
    throw err;
  }

  return json;
}
