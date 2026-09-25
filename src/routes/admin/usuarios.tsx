import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { addUser, listUsers, removeUser } from "@/lib/users.server";

type UserRecord = { id: number; username: string; role: string; created_at: string };

export const Route = createFileRoute("/admin/usuarios")({
  head: () => ({ meta: [{ title: "Usuarios y contraseñas - Código Fuentes" }] }),
  component: AdminUsers,
});

function AdminUsers() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("codigo-fuentes.admin") !== "true") {
      navigate({ to: "/" });
      return;
    }

    listUsers()
      .then(setUsers)
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

  return (
    <main className="admin-shell">
      <SiteHeader plain />
      <section className="admin-content admin-list-content">
        <Link to="/admin" className="admin-back-link">← Volver al panel</Link>
        <span className="source-kicker">BASE DE DATOS D1</span>
        <h1>Usuarios y<br /><em>contraseñas.</em></h1>
        <p className="admin-intro">Registro compartido de accesos administrado desde Cloudflare D1.</p>

        <form className="admin-user-form" onSubmit={handleAddUser}>
          <label htmlFor="new-username">Nuevo usuario</label>
          <input id="new-username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Ej. cliente01" />
          <label htmlFor="new-password">Contraseña</label>
          <input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Contraseña" />
          {error && <p className="source-login-error" role="alert">{error}</p>}
          <button type="submit"><Plus aria-hidden="true" /> Agregar usuario</button>
        </form>

        <div className="admin-user-table" aria-live="polite">
          <div className="admin-user-table-heading"><span>Usuario</span><span>Rol</span><span>Acción</span></div>
          {users.length === 0 ? <p className="admin-empty">Todavía no hay usuarios agregados.</p> : users.map((user) => (
            <div className="admin-user-row" key={user.id}>
              <strong>{user.username}</strong>
              <span>{user.role}</span>
              <button type="button" aria-label={`Eliminar usuario ${user.username}`} onClick={async () => { await removeUser({ data: { id: user.id } }); setUsers(await listUsers()); }}><Trash2 aria-hidden="true" /></button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
