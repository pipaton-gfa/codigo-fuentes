import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/users.server";
import { getSalesStatisticsPages } from "@/lib/sales-statistics.server";

type SalesPages = Awaited<ReturnType<typeof getSalesStatisticsPages>>;

export const Route = createFileRoute("/admin/datos-ventas")({
  head: () => ({ meta: [{ title: "Datos de ventas - Landing Fuentes" }] }),
  component: SalesDataPage,
});

function SalesDataPage() {
  const navigate = useNavigate();
  const [pages, setPages] = useState<SalesPages>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getCurrentUser(), getSalesStatisticsPages()])
      .then(([user, salesPages]) => {
        if (!user || (user.role === "user" && user.eventIds.length === 0)) {
          navigate({ to: "/" });
          return;
        }
        setPages(salesPages);
      })
      .catch(() => setError("No se pudieron cargar los datos de ventas."))
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <section className="admin-content admin-list-content">
      <Link to="/admin" className="admin-back-link">
        ← Volver al panel
      </Link>
      <span className="source-kicker">PANEL DE VENTAS</span>
      <h1>
        Datos de
        <br />
        <em>ventas.</em>
      </h1>
      <p className="admin-intro">
        Accede a las estadísticas disponibles según los eventos asignados a cada cuenta.
      </p>

      {error && (
        <p className="source-login-error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="admin-intro">Cargando datos de ventas...</p>
      ) : pages.length === 0 ? (
        <p className="admin-empty">No hay estadísticas de ventas asignadas a esta cuenta.</p>
      ) : (
        <div className="admin-page-list" aria-label="Estadísticas de ventas disponibles">
          {pages.map((page) => (
            <a key={page.id} href={page.path} className="admin-page-row">
              <span>
                <small>
                  Evento {page.eventId} · {page.eventName}
                </small>
                <strong>{page.title}</strong>
                <em>{page.description}</em>
                <small>{page.path}</small>
              </span>
              <ArrowUpRight aria-hidden="true" />
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
