import { createServerFn } from "@tanstack/react-start";
import {
  deleteCookie,
  getCookie,
  getRequestProtocol,
  setCookie,
} from "@tanstack/react-start/server";
import { getDatabase } from "./database.server";
import {
  getAuthenticatedUser,
  hashSessionToken,
  requireAdmin,
  SESSION_COOKIE_NAME,
} from "./admin-auth.server";

const PASSWORD_PREFIX = "codigo-fuentes:";

type LoginInput = { username: string; password: string };
type UserRecord = {
  id: number;
  username: string;
  role: "user" | "admin" | "super_admin";
  created_at: string;
};
type UserPermissionsInput = { id: number; role: string; eventIds: string[] };

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

    if (!user || user.password_hash !== (await hashPassword(data.password))) {
      return { ok: false as const, message: "Usuario o contraseña incorrectos." };
    }

    const sessionToken = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
      byte.toString(16).padStart(2, "0"),
    ).join("");
    const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7;
    await getDatabase()
      .prepare("INSERT INTO auth_sessions (token_hash, user_id, expires_at) VALUES (?1, ?2, ?3)")
      .bind(await hashSessionToken(sessionToken), user.id, expiresAt)
      .run();
    setCookie(SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: getRequestProtocol() === "https",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return { ok: true as const, user: { id: user.id, username: user.username, role: user.role } };
  });

export const getCurrentUser = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getAuthenticatedUser();
  if (!user) return null;
  const events = await getDatabase()
    .prepare(
      "SELECT printf('%04d', events.id) AS id FROM user_events JOIN events ON events.id = user_events.event_id WHERE user_events.user_id = ?1 ORDER BY events.id",
    )
    .bind(user.id)
    .all<{ id: string }>();
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    eventIds: events.results.map((event) => event.id),
  };
});

export const logoutUser = createServerFn({ method: "POST" }).handler(async () => {
  const token = getCookie(SESSION_COOKIE_NAME);
  if (token) {
    await getDatabase()
      .prepare("DELETE FROM auth_sessions WHERE token_hash = ?1")
      .bind(await hashSessionToken(token))
      .run();
  }
  deleteCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    secure: getRequestProtocol() === "https",
    sameSite: "strict",
    path: "/",
  });
  return { ok: true as const };
});

export const listUsers = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const result = await getDatabase()
    .prepare(
      "SELECT users.id, users.username, users.role, users.created_at, COALESCE(GROUP_CONCAT(printf('%04d', events.id)), '') AS event_ids FROM users LEFT JOIN user_events ON user_events.user_id = users.id LEFT JOIN events ON events.id = user_events.event_id GROUP BY users.id ORDER BY users.id DESC",
    )
    .all<UserRecord & { event_ids: string }>();
  return result.results.map(({ event_ids, ...user }) => ({
    ...user,
    eventIds: event_ids ? event_ids.split(",") : [],
  }));
});

export const listEvents = createServerFn({ method: "GET" }).handler(async () => {
  await requireAdmin();
  const result = await getDatabase()
    .prepare("SELECT printf('%04d', id) AS id, name, href FROM events ORDER BY id")
    .all<{ id: string; name: string; href: string }>();
  return result.results;
});

export const addUser = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    const username = data.username.trim();
    if (!username || !data.password)
      return { ok: false as const, message: "Completa usuario y contraseña." };

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
    await requireAdmin();
    const user = await getDatabase()
      .prepare("SELECT username FROM users WHERE id = ?1")
      .bind(data.id)
      .first<{ username: string }>();
    if (!user || user.username === "pipaton") return { ok: false as const };
    await getDatabase().prepare("DELETE FROM users WHERE id = ?1").bind(data.id).run();
    return { ok: true as const };
  });

export const updateUserPermissions = createServerFn({ method: "POST" })
  .inputValidator((data: UserPermissionsInput) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    if (
      !Number.isInteger(data.id) ||
      !["user", "admin"].includes(data.role) ||
      !Array.isArray(data.eventIds)
    ) {
      return { ok: false as const, message: "Los permisos seleccionados no son válidos." };
    }

    const database = getDatabase();
    const target = await database
      .prepare("SELECT username FROM users WHERE id = ?1")
      .bind(data.id)
      .first<{ username: string }>();
    if (!target) return { ok: false as const, message: "No se encontró ese usuario." };
    if (target.username === "pipaton") {
      return {
        ok: false as const,
        message: "El super admin está protegido y no se puede modificar.",
      };
    }

    const knownEvents = await database
      .prepare("SELECT printf('%04d', id) AS id FROM events")
      .all<{ id: string }>();
    const allowedEventIds = new Set(knownEvents.results.map((event) => event.id));
    const eventIds = [...new Set(data.eventIds)].filter((id) => allowedEventIds.has(id));

    await database
      .prepare("UPDATE users SET role = ?1 WHERE id = ?2")
      .bind(data.role, data.id)
      .run();
    await database.prepare("DELETE FROM user_events WHERE user_id = ?1").bind(data.id).run();
    for (const eventId of eventIds) {
      await database
        .prepare(
          "INSERT INTO user_events (user_id, event_id) SELECT ?1, id FROM events WHERE printf('%04d', id) = ?2",
        )
        .bind(data.id, eventId)
        .run();
    }
    return { ok: true as const };
  });
