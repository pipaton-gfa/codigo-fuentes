import { getCookie } from "@tanstack/react-start/server";
import { getDatabase } from "./database.server";

export const SESSION_COOKIE_NAME = "codigo-fuentes.session";

export type AuthenticatedUser = {
  id: number;
  username: string;
  role: "user" | "admin" | "super_admin";
};

export async function hashSessionToken(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function getAuthenticatedUser() {
  const token = getCookie(SESSION_COOKIE_NAME);
  if (!token) return null;

  return getDatabase()
    .prepare(
      "SELECT users.id, users.username, users.role FROM auth_sessions JOIN users ON users.id = auth_sessions.user_id WHERE auth_sessions.token_hash = ?1 AND auth_sessions.expires_at > ?2",
    )
    .bind(await hashSessionToken(token), Math.floor(Date.now() / 1000))
    .first<AuthenticatedUser>();
}

export async function requireAdmin() {
  const user = await getAuthenticatedUser();
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    throw new Error("Se requiere una sesión de administración.");
  }
  return user;
}
