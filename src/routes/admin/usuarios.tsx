import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Settings, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import {
  addUser,
  getCurrentUser,
  listEvents,
  listUsers,
  removeUser,
  updateUserPermissions,
} from "@/lib/users.server";

type UserRecord = {
  id: number;
  username: string;
  role: "user" | "admin" | "super_admin";
  created_at: string;
  eventIds: string[];
};
type EventRecord = { id: string; name: string; href: string };

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({ meta: [{ title: "Usuarios y contraseñas - Landing Fuentes" }] }),
  component: AdminUsers,
});

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [selectedRole, setSelectedRole] = useState<"user" | "admin">("user");
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [savingPermissions, setSavingPermissions] = useState(false);

  useEffect(() => {
    getCurrentUser()
      .then(async (currentUser) => {
        if (!currentUser || currentUser.role === "user") {
          navigate({ to: "/" });
          return;
        }
        const [userList, eventList] = await Promise.all([listUsers(), listEvents()]);
        setUsers(userList);
        setEvents(eventList);
      })
      .catch(() => setError("No se pudo cargar la base de datos."));
  }, [navigate]);

  const handleAddUser = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setError("Completa usuario y contraseña.");
      return;
    }
    const result = await addUser({ data: { username: cleanUsername, password } });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setUsers(await listUsers());
    setUsername("");
    setPassword("");
    setError("");
  };

  const openPermissions = (user: UserRecord) => {
    setSelectedUser(user);
    setSelectedRole(user.role === "admin" ? "admin" : "user");
    setSelectedEventIds(user.eventIds);
    setError("");
  };

  const handleSavePermissions = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedUser) return;

    setSavingPermissions(true);
    const result = await updateUserPermissions({
      data: { id: selectedUser.id, role: selectedRole, eventIds: selectedEventIds },
    });
    setSavingPermissions(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    setUsers(await listUsers());
    setSelectedUser(null);
    setError("");
  };

  const handleRemoveUser = async (user: UserRecord) => {
    const result = await removeUser({ data: { id: user.id } });
    if (!result.ok) {
      setError("No se pudo eliminar ese usuario.");
      return;
    }
    setUsers(await listUsers());
  };

  const toggleEvent = (eventId: string) => {
    setSelectedEventIds((current) =>
      current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId],
    );
  };

  return (
    <main className="admin-shell">
      <section className="admin-content admin-list-content">
        <Link to="/admin" className="admin-back-link">
          ← Volver al panel
        </Link>
        <span className="source-kicker">BASE DE DATOS D1</span>
        <h1>
          Usuarios y<br />
          <em>contraseñas.</em>
        </h1>
        <p className="admin-intro">
          Registro compartido de accesos administrado desde Cloudflare D1.
        </p>
        <p className="admin-intro">
          Usa la tuerca para definir el rol y los eventos habilitados para cada cuenta.
        </p>

        <form className="admin-user-form" onSubmit={handleAddUser}>
          <label htmlFor="new-username">Nuevo usuario</label>
          <input
            id="new-username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Ej. cliente01"
          />
          <label htmlFor="new-password">Contraseña</label>
          <input
            id="new-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Contraseña"
          />
          {error && (
            <p className="source-login-error" role="alert">
              {error}
            </p>
          )}
          <button type="submit">
            <Plus aria-hidden="true" /> Agregar usuario
          </button>
        </form>

        <div className="admin-user-table" aria-live="polite">
          <div className="admin-user-table-heading">
            <span>Usuario</span>
            <span>Rol</span>
            <span>Acción</span>
          </div>
          {users.length === 0 ? (
            <p className="admin-empty">Todavía no hay usuarios agregados.</p>
          ) : (
            users.map((user) => (
              <div className="admin-user-row" key={user.id}>
                <strong>{user.username}</strong>
                <span>{user.role.replace("_", " ")}</span>
                <div className="admin-user-actions">
                  <button
                    type="button"
                    className="admin-user-settings"
                    aria-label={`Permisos de ${user.username}`}
                    title={user.role === "super_admin" ? "Rol protegido" : "Administrar permisos"}
                    disabled={user.role === "super_admin"}
                    onClick={() => openPermissions(user)}
                  >
                    <Settings aria-hidden="true" />
                  </button>
                  {user.role !== "super_admin" && (
                    <button
                      type="button"
                      aria-label={`Eliminar usuario ${user.username}`}
                      onClick={() => handleRemoveUser(user)}
                    >
                      <Trash2 aria-hidden="true" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
        {selectedUser && (
          <div
            className="admin-permission-backdrop"
            role="presentation"
            onMouseDown={() => setSelectedUser(null)}
          >
            <section
              className="admin-permission-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="permission-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="admin-permission-close"
                aria-label="Cerrar permisos"
                onClick={() => setSelectedUser(null)}
              >
                <X aria-hidden="true" />
              </button>
              <span className="source-kicker">PERMISOS DE USUARIO</span>
              <h2 id="permission-title">{selectedUser.username}</h2>
              <form onSubmit={handleSavePermissions}>
                <label htmlFor="user-role">Rol</label>
                <select
                  id="user-role"
                  value={selectedRole}
                  onChange={(event) => setSelectedRole(event.target.value as "user" | "admin")}
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
                <fieldset className="admin-event-permissions">
                  <legend>Eventos asignados</legend>
                  {events.map((projectEvent) => (
                    <label key={projectEvent.id}>
                      <input
                        type="checkbox"
                        checked={selectedEventIds.includes(projectEvent.id)}
                        onChange={() => toggleEvent(projectEvent.id)}
                      />
                      <span>
                        <strong>{projectEvent.id}</strong>
                        {projectEvent.name}
                      </span>
                    </label>
                  ))}
                </fieldset>
                {error && (
                  <p className="source-login-error" role="alert">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="admin-permission-save"
                  disabled={savingPermissions}
                >
                  {savingPermissions ? "Guardando..." : "Guardar permisos"}
                </button>
              </form>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
