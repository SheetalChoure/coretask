import { apiFetch } from "./client";

export async function listUsers() {
  const json = await apiFetch("/users");
  return json.data.users;
}
