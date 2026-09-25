import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/admin/paginas")({
  head: () => ({ meta: [{ title: "Todas las páginas - Código Fuentes" }] }),
  component: AdminPages,
});

const pages = [
  { path: "/", label: "Portada Código Fuentes", description: "Menú principal de servicios." },
  { path: "/landing-pages", label: "Landing pages", description: "Selección de landing pages estratégicos." },
  { path: "/quioscos", label: "Quioscos", description: "Menú de experiencias con carrito." },
  { path: "/multipaginas", label: "Multipáginas enlazadas", description: "Espacio reservado para nuevos proyectos." },
  { path: "/mmd-eternal-dream", label: "More More Dream · Eternal Dream", description: "Landing del evento Last Chapter." },
  { path: "/idols", label: "Donar dinero a idols", description: "Catálogo de productos y donaciones." },
  { path: "/carrito", label: "Carrito", description: "Resumen y gestión de productos." },
  { path: "/datos", label: "Datos de compra", description: "Información del comprador." },
  { path: "/factura", label: "Factura", description: "Confirmación de la orden." },
  { path: "/validar", label: "Validar entrada", description: "Validación de tickets." },
  { path: "/admin", label: "Panel privado", description: "Accesos de administración." },
  { path: "/admin/usuarios", label: "Usuarios y contraseñas", description: "Base local de credenciales." },
];

function AdminPages() {
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionStorage.getItem("codigo-fuentes.admin") !== "true") navigate({ to: "/" });
  }, [navigate]);

  return (
    <main className="admin-shell">
      <section className="admin-content admin-list-content">
        <Link to="/admin" className="admin-back-link">← Volver al panel</Link>
        <span className="source-kicker">MAPA DEL PROYECTO</span>
        <h1>Todas las<br /><em>páginas.</em></h1>
        <div className="admin-page-list">
          {pages.map((page) => (
            <Link key={page.path} to={page.path as "/"} className="admin-page-row">
              <span><small>{page.path}</small><strong>{page.label}</strong><em>{page.description}</em></span>
              <ArrowUpRight aria-hidden="true" />
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
