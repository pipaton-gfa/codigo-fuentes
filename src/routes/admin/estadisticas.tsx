import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { getAnalytics } from "@/lib/analytics.server";
import { getCurrentUser } from "@/lib/users.server";

type Analytics = Awaited<ReturnType<typeof getAnalytics>>;
type HistogramItem = { key: string; label: string; visits: number };

const DAY_MS = 24 * 60 * 60 * 1000;

export const Route = createFileRoute("/admin/estadisticas")({
  head: () => ({ meta: [{ title: "Estadísticas - Código Fuentes" }] }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState("");
  const [dailyUpdatedAt, setDailyUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let dailyTimer: ReturnType<typeof setInterval> | undefined;
    getCurrentUser()
      .then((user) => {
        if (!user || user.role === "user") {
          navigate({ to: "/" });
          return;
        }

        const load = () =>
          getAnalytics()
            .then((data) => {
              setAnalytics(data);
              setDailyUpdatedAt(new Date());
            })
            .catch(() => setError("No se pudieron cargar las estadísticas."));

        load();
        dailyTimer = setInterval(load, DAY_MS);
      })
      .catch(() => navigate({ to: "/" }));
    return () => {
      if (dailyTimer) clearInterval(dailyTimer);
    };
  }, [navigate]);

  const dailyItems: HistogramItem[] = (analytics?.daily ?? []).map((item) => ({
    key: item.day,
    label: item.day.slice(5),
    visits: item.visits,
  }));

  return (
    <section className="admin-content admin-list-content">
      <Link to="/admin" className="admin-back-link">
        ← Volver al panel
      </Link>
      <span className="source-kicker">ANALÍTICA PRIVADA</span>
      <h1>
        Visitas y<br />
        <em>alcance.</em>
      </h1>
      <p className="admin-intro">
        Datos agregados por página, día y país. No guardamos IP ni información personal.
      </p>

      {error ? (
        <p className="source-login-error" role="alert">
          {error}
        </p>
      ) : (
        analytics && (
          <>
            <div className="analytics-summary">
              <div>
                <strong>{analytics.total}</strong>
                <span>visitas totales</span>
              </div>
              <div>
                <strong>{analytics.today}</strong>
                <span>visitas hoy</span>
              </div>
              <div>
                <strong>{analytics.countriesCount}</strong>
                <span>países detectados</span>
              </div>
            </div>

            <Histogram
              title="Últimos 30 días"
              emptyLabel="Todavía no hay visitas registradas."
              items={dailyItems}
              unit="visitas"
              updatedAt={dailyUpdatedAt}
              refreshLabel="cada 1 día"
            />

            <div className="analytics-columns">
              <div className="analytics-panel">
                <h2>Páginas más visitadas</h2>
                {analytics.pages.map((item) => (
                  <div className="analytics-ranking" key={item.value}>
                    <span>{item.value}</span>
                    <strong>{item.visits}</strong>
                  </div>
                ))}
              </div>
              <div className="analytics-panel">
                <h2>Países</h2>
                {analytics.countries.map((item) => (
                  <div className="analytics-ranking" key={item.value}>
                    <span>{item.value}</span>
                    <strong>{item.visits}</strong>
                  </div>
                ))}
              </div>
            </div>
          </>
        )
      )}
    </section>
  );
}

function Histogram({
  title,
  emptyLabel,
  items,
  unit,
  updatedAt,
  refreshLabel,
}: {
  title: string;
  emptyLabel: string;
  items: HistogramItem[];
  unit: string;
  updatedAt: Date | null;
  refreshLabel: string;
}) {
  const [drawn, setDrawn] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const maxVisits = Math.max(...items.map((item) => item.visits), 1);

  useEffect(() => {
    setDrawn(false);
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, [items]);

  return (
    <div className="analytics-panel">
      <div className="analytics-panel-heading">
        <h2>{title}</h2>
        <span className="analytics-refresh">
          Datos en vivo · refresco {refreshLabel}
          {updatedAt ? ` · última consulta ${updatedAt.toLocaleTimeString()}` : ""}
        </span>
      </div>
      <div ref={containerRef} className="analytics-chart" aria-label={title}>
        {items.length === 0 ? (
          <p className="admin-empty">{emptyLabel}</p>
        ) : (
          items.map((item, index) => (
            <div
              className="analytics-bar-group"
              key={item.key}
              title={`${item.label}: ${item.visits} ${unit}`}
            >
              <span className="analytics-bar-value">{item.visits}</span>
              <span
                className="analytics-bar"
                style={{
                  height: drawn ? `${Math.max(10, (item.visits / maxVisits) * 100)}%` : "0%",
                  transitionDelay: `${index * 28}ms`,
                }}
              />
              <small>{item.label}</small>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
