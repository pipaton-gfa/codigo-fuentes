import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BarChart3, Database, LogOut, PanelsTopLeft } from "lucide-react";
import { useEffect } from "react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Administración - Código Fuentes" }] }),
  component: AdminHome,
});

function AdminHome() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (sessionStorage.getItem("codigo-fuentes.admin") !== "true") {
      navigate({ to: "/" });
    }
  }, [navigate]);

  const logout = () => {
    sessionStorage.removeItem("codigo-fuentes.admin");
    navigate({ to: "/" });
  };

  return (
    <main className="admin-shell">
      <SiteHeader plain />
      {location.pathname === "/admin" ? <section className="admin-content">
        <span className="source-kicker">PANEL PRIVADO</span>
        <h1>Bienvenido a tu<br /><em>espacio de control.</em></h1>
        <p>Desde aquí puedes revisar las páginas del proyecto y administrar los accesos registrados.</p>
        <div className="admin-link-grid">
          <Link to="/admin/estadisticas" className="admin-link-card">
            <BarChart3 aria-hidden="true" />
            <span><strong>Estadísticas</strong><small>Visitas, páginas y países detectados.</small></span>
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/admin/paginas" className="admin-link-card">
            <PanelsTopLeft aria-hidden="true" />
            <span><strong>Todas las páginas</strong><small>Consulta cada ruta disponible en el proyecto.</small></span>
            <ArrowRight aria-hidden="true" />
          </Link>
          <Link to="/admin/usuarios" className="admin-link-card">
            <Database aria-hidden="true" />
            <span><strong>Usuarios y contraseñas</strong><small>Agrega y revisa las credenciales guardadas.</small></span>
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
        <button type="button" className="admin-logout" onClick={logout}><LogOut aria-hidden="true" /> Cerrar sesión</button>
      </section> : <Outlet />}
    </main>
  );
}
