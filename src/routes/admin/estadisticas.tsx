import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useId, useRef, useState } from "react";
import { getAnalytics } from "@/lib/analytics.server";

type Analytics = Awaited<ReturnType<typeof getAnalytics>>;
type HistogramItem = { key: string; label: string; visits: number };

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

export const Route = createFileRoute("/admin/estadisticas")({
  head: () => ({ meta: [{ title: "Estadísticas - Código Fuentes" }] }),
  component: AdminAnalytics,
});

function AdminAnalytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState("");
  const [dailyUpdatedAt, setDailyUpdatedAt] = useState<Date | null>(null);
  const [minuteUpdatedAt, setMinuteUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    if (sessionStorage.getItem("codigo-fuentes.admin") !== "true") {
      navigate({ to: "/" });
      return;
    }

    const load = () =>
      getAnalytics()
        .then((data) => {
          setAnalytics(data);
          setDailyUpdatedAt(new Date());
          setMinuteUpdatedAt(new Date());
        })
        .catch(() => setError("No se pudieron cargar las estadísticas."));

    load();
    // El resumen general y el gráfico diario se refrescan una vez al día.
    const dailyTimer = setInterval(load, DAY_MS);
    // El gráfico de la última hora se refresca una vez por hora.
    const minuteTimer = setInterval(() => {
      getAnalytics()
        .then((data) => {
          setAnalytics((prev) => (prev ? { ...prev, minutely: data.minutely, today: data.today } : data));
          setMinuteUpdatedAt(new Date());
        })
        .catch(() => undefined);
    }, HOUR_MS);

    return () => {
      clearInterval(dailyTimer);
      clearInterval(minuteTimer);
    };
  }, [navigate]);

  const dailyItems: HistogramItem[] = (analytics?.daily ?? []).map((item) => ({
    key: item.day,
    label: item.day.slice(5),
    visits: item.visits,
  }));
  const minutelyItems: HistogramItem[] = (analytics?.minutely ?? []).map((item) => ({
    key: item.minute,
    label: item.minute.slice(11, 16),
    visits: item.visits,
  }));

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

          <Histogram
            title="Últimos 30 días"
            emptyLabel="Todavía no hay visitas registradas."
            items={dailyItems}
            unit="visitas"
            updatedAt={dailyUpdatedAt}
            refreshLabel="cada 1 día"
          />

          <LineChart
            title="Última hora (minuto a minuto)"
            emptyLabel="Todavía no hay visitas en la última hora."
            items={minutelyItems}
            unit="visitas"
            updatedAt={minuteUpdatedAt}
            refreshLabel="cada 1 hora"
          />

          <div className="analytics-columns">
            <div className="analytics-panel"><h2>Páginas más visitadas</h2>{analytics.pages.map((item) => <div className="analytics-ranking" key={item.value}><span>{item.value}</span><strong>{item.visits}</strong></div>)}</div>
            <div className="analytics-panel"><h2>Países</h2>{analytics.countries.map((item) => <div className="analytics-ranking" key={item.value}><span>{item.value}</span><strong>{item.visits}</strong></div>)}</div>
          </div>
        </>
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
        <span className="analytics-refresh">Datos en vivo · refresco {refreshLabel}{updatedAt ? ` · última consulta ${updatedAt.toLocaleTimeString()}` : ""}</span>
      </div>
      <div ref={containerRef} className="analytics-chart" aria-label={title}>
        {items.length === 0 ? (
          <p className="admin-empty">{emptyLabel}</p>
        ) : (
          items.map((item, index) => (
            <div className="analytics-bar-group" key={item.key} title={`${item.label}: ${item.visits} ${unit}`}>
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

function LineChart({
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
  const pathRef = useRef<SVGPathElement>(null);
  const [drawn, setDrawn] = useState(false);
  const gradientId = `analytics-area-${useId().replace(/:/g, "")}`;
  const maxVisits = Math.max(...items.map((item) => item.visits), 1);
  const viewWidth = 100;
  const viewHeight = 40;

  const points = items.map((item, index) => {
    const x = items.length > 1 ? (index / (items.length - 1)) * viewWidth : 0;
    const y = viewHeight - (item.visits / maxVisits) * (viewHeight - 4) - 2;
    return { x, y };
  });
  const linePath = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" ");
  const areaPath = points.length > 0
    ? `${linePath} L${viewWidth},${viewHeight} L0,${viewHeight} Z`
    : "";

  useEffect(() => {
    setDrawn(false);
    const path = pathRef.current;
    if (!path) return;
    const length = path.getTotalLength();
    path.style.strokeDasharray = `${length}`;
    path.style.strokeDashoffset = `${length}`;
    const frame = requestAnimationFrame(() => setDrawn(true));
    return () => cancelAnimationFrame(frame);
  }, [items]);

  const tickEvery = 10;
  const last = items[items.length - 1];

  return (
    <div className="analytics-panel">
      <div className="analytics-panel-heading">
        <h2>{title}</h2>
        <span className="analytics-refresh">Datos en vivo · refresco {refreshLabel}{updatedAt ? ` · última consulta ${updatedAt.toLocaleTimeString()}` : ""}</span>
      </div>
      {items.length === 0 ? (
        <p className="admin-empty">{emptyLabel}</p>
      ) : (
        <div className="analytics-linechart">
          <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} preserveAspectRatio="none" aria-label={title}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--source-aqua)" stopOpacity="0.55" />
                <stop offset="100%" stopColor="var(--source-aqua)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <g className="analytics-linechart-grid">
              <line x1="0" y1={viewHeight * 0.25} x2={viewWidth} y2={viewHeight * 0.25} />
              <line x1="0" y1={viewHeight * 0.5} x2={viewWidth} y2={viewHeight * 0.5} />
              <line x1="0" y1={viewHeight * 0.75} x2={viewWidth} y2={viewHeight * 0.75} />
            </g>
            {areaPath && <path className="analytics-linechart-area" d={areaPath} fill={`url(#${gradientId})`} />}
            <path
              ref={pathRef}
              className="analytics-linechart-line"
              d={linePath}
              style={drawn ? { strokeDashoffset: 0 } : undefined}
            />
            {last && (
              <circle className="analytics-linechart-dot" cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="1.6" />
            )}
          </svg>
          <div className="analytics-linechart-labels">
            {items.map((item, index) => (
              (index % tickEvery === 0 || index === items.length - 1) && (
                <span key={item.key} style={{ left: `${(index / (items.length - 1)) * 100}%` }}>{item.label}</span>
              )
            ))}
          </div>
          {last && <p className="analytics-linechart-current">Ahora: <strong>{last.visits}</strong> {unit} en el último minuto</p>}
        </div>
      )}
    </div>
  );
}
