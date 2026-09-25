import { createServerFn } from "@tanstack/react-start";
import { getDatabase } from "./database.server";

const PASSWORD_PREFIX = "codigo-fuentes:";

type LoginInput = { username: string; password: string };
type UserRecord = { id: number; username: string; role: string; created_at: string };

async function hashPassword(password: string) {
  const data = new TextEncoder().encode(`${PASSWORD_PREFIX}${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export const loginUser = createServerFn({ method: "POST" })
  .inputValidator((data: LoginInput) => data)
  .handler(async ({ data }) => {
    const username = data.username.trim();
    const user = await getDatabase()
      .prepare("SELECT id, username, password_hash, role FROM users WHERE username = ?1")
      .bind(username)
      .first<{ id: number; username: string; password_hash: string; role: string }>();

    if (!user || user.password_hash !== await hashPassword(data.password)) {
      return { ok: false as const, message: "Usuario o contraseña incorrectos." };
    }

    return { ok: true as const, user: { id: user.id, username: user.username, role: user.role } };
  });

export const listUsers = createServerFn({ method: "GET" }).handler(async () => {
  const result = await getDatabase()
    .prepare("SELECT id, username, role, created_at FROM users ORDER BY id DESC")
    .all<UserRecord>();
  return result.results;
});

export const addUser = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    const username = data.username.trim();
    if (!username || !data.password) return { ok: false as const, message: "Completa usuario y contraseña." };

    try {
      await getDatabase()
        .prepare("INSERT INTO users (username, password_hash) VALUES (?1, ?2)")
        .bind(username, await hashPassword(data.password))
        .run();
      return { ok: true as const };
    } catch {
      return { ok: false as const, message: "Ese usuario ya existe o no se pudo guardar." };
    }
  });

export const removeUser = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    await getDatabase().prepare("DELETE FROM users WHERE id = ?1").bind(data.id).run();
    return { ok: true as const };
  });
