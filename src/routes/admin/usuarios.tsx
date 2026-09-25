import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";

type UserRecord = { username: string; password: string };
const USERS_KEY = "codigo-fuentes.users";

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

    try {
      const saved = localStorage.getItem(USERS_KEY);
      if (saved) setUsers(JSON.parse(saved) as UserRecord[]);
    } catch {
      setUsers([]);
    }
  }, [navigate]);

  const saveUsers = (nextUsers: UserRecord[]) => {
    setUsers(nextUsers);
    localStorage.setItem(USERS_KEY, JSON.stringify(nextUsers));
  };

  const addUser = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanUsername = username.trim();
    if (!cleanUsername || !password) {
      setError("Completa usuario y contraseña.");
      return;
    }
    if (users.some((user) => user.username === cleanUsername)) {
      setError("Ese usuario ya existe.");
      return;
    }

    saveUsers([...users, { username: cleanUsername, password }]);
    setUsername("");
    setPassword("");
    setError("");
  };

  return (
    <main className="admin-shell">
      <SiteHeader plain />
      <section className="admin-content admin-list-content">
        <Link to="/admin" className="admin-back-link">← Volver al panel</Link>
        <span className="source-kicker">BASE DE DATOS LOCAL</span>
        <h1>Usuarios y<br /><em>contraseñas.</em></h1>
        <p className="admin-intro">Registro inicial de accesos para el proyecto. Esta versión guarda los datos en el navegador actual.</p>

        <form className="admin-user-form" onSubmit={addUser}>
          <label htmlFor="new-username">Nuevo usuario</label>
          <input id="new-username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Ej. cliente01" />
          <label htmlFor="new-password">Contraseña</label>
          <input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Contraseña" />
          {error && <p className="source-login-error" role="alert">{error}</p>}
          <button type="submit"><Plus aria-hidden="true" /> Agregar usuario</button>
        </form>

        <div className="admin-user-table" aria-live="polite">
          <div className="admin-user-table-heading"><span>Usuario</span><span>Contraseña</span><span>Acción</span></div>
          {users.length === 0 ? <p className="admin-empty">Todavía no hay usuarios agregados.</p> : users.map((user) => (
            <div className="admin-user-row" key={user.username}>
              <strong>{user.username}</strong>
              <span>{user.password}</span>
              <button type="button" aria-label={`Eliminar usuario ${user.username}`} onClick={() => saveUsers(users.filter((item) => item.username !== user.username))}><Trash2 aria-hidden="true" /></button>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
