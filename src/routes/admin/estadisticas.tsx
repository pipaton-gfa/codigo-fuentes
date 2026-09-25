import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getAnalytics } from "@/lib/analytics.server";

type Analytics = Awaited<ReturnType<typeof getAnalytics>>;

export const Route = createFileRoute("/admin/estadisticas")({
  head: () => ({ meta: [{ title: "Estadísticas - Código Fuentes" }] }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionStorage.getItem("codigo-fuentes.admin") !== "true") {
      navigate({ to: "/" });
      return;
    }

    getAnalytics()
      .then(setAnalytics)
      .catch(() => setError("No se pudieron cargar las estadísticas."));
  }, [navigate]);

  const maxDailyVisits = Math.max(...(analytics?.daily.map((item) => item.visits) ?? [1]));

  return (
    <section className="admin-content admin-list-content">
      <Link to="/admin" className="admin-back-link">← Volver al panel</Link>
      <span className="source-kicker">ANALÍTICA PRIVADA</span>
      <h1>Visitas y<br /><em>alcance.</em></h1>
      <p className="admin-intro">Datos agregados por página, día y país. No guardamos IP ni información personal.</p>

      {error ? <p className="source-login-error" role="alert">{error}</p> : analytics && (
        <>
          <div className="analytics-summary">
            <div><strong>{analytics.total}</strong><span>visitas totales</span></div>
            <div><strong>{analytics.today}</strong><span>visitas hoy</span></div>
            <div><strong>{analytics.countriesCount}</strong><span>países detectados</span></div>
          </div>

          <div className="analytics-panel">
            <h2>Últimos 30 días</h2>
            <div className="analytics-chart" aria-label="Visitas por día">
              {analytics.daily.length === 0 ? <p className="admin-empty">Todavía no hay visitas registradas.</p> : analytics.daily.map((item) => (
                <div className="analytics-bar-group" key={item.day} title={`${item.day}: ${item.visits} visitas`}>
                  <span className="analytics-bar" style={{ height: `${Math.max(8, item.visits / maxDailyVisits * 100)}%` }} />
                  <small>{item.day.slice(5)}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="analytics-columns">
            <div className="analytics-panel"><h2>Páginas más visitadas</h2>{analytics.pages.map((item) => <div className="analytics-ranking" key={item.value}><span>{item.value}</span><strong>{item.visits}</strong></div>)}</div>
            <div className="analytics-panel"><h2>Países</h2>{analytics.countries.map((item) => <div className="analytics-ranking" key={item.value}><span>{item.value}</span><strong>{item.visits}</strong></div>)}</div>
          </div>
        </>
      )}
    </section>
  );
}
