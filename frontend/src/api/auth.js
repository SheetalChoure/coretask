import { apiFetch, storeSession, clearSession, getToken, getStoredUser } from "./client";

export async function login(email, password) {
  const json = await apiFetch("/users/login", { method: "POST", body: { email, password } });
  const { user, token } = json.data;
  storeSession(token, user);
  return user;
}

export async function register(name, email, password) {
  const json = await apiFetch("/users/register", { method: "POST", body: { name, email, password } });
  const { user, token } = json.data;
  storeSession(token, user);
  return user;
}

export function logout() {
  clearSession();
}

export function getSession() {
  const token = getToken();
  const user = getStoredUser();
  return token && user ? { token, user } : null;
}
