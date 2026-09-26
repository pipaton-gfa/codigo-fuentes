import { createServerFn } from "@tanstack/react-start";
import { getDatabase, getRequestCountry } from "./database.server";

type TrackPageViewInput = { path: string };

type DailyViews = { day: string; visits: number };
type MinutelyViews = { minute: string; visits: number };
type RankedValue = { value: string; visits: number };

export const trackPageView = createServerFn({ method: "POST" })
  .inputValidator((data: TrackPageViewInput) => data)
  .handler(async ({ data }) => {
    const path = data.path.trim().slice(0, 200);
    if (!path || path.startsWith("/admin")) return { ok: false as const };

    await getDatabase()
      .prepare("INSERT INTO page_views (path, country) VALUES (?1, ?2)")
      .bind(path, getRequestCountry())
      .run();
    return { ok: true as const };
  });

export const getAnalytics = createServerFn({ method: "GET" }).handler(async () => {
  const database = getDatabase();
  const totals = await database
    .prepare("SELECT COUNT(*) AS total, COUNT(DISTINCT country) AS countries FROM page_views")
    .first<{ total: number; countries: number }>();
  const today = await database
    .prepare("SELECT COUNT(*) AS visits FROM page_views WHERE date(viewed_at) = date('now')")
    .first<{ visits: number }>();
  const daily = await database
    .prepare("SELECT date(viewed_at) AS day, COUNT(*) AS visits FROM page_views WHERE viewed_at >= datetime('now', '-30 days') GROUP BY date(viewed_at) ORDER BY day")
    .all<DailyViews>();
  const minutelyRows = await database
    .prepare("SELECT strftime('%Y-%m-%d %H:%M:00', viewed_at) AS minute, COUNT(*) AS visits FROM page_views WHERE viewed_at >= datetime('now', '-60 minutes') GROUP BY minute")
    .all<MinutelyViews>();
  const minutely = fillLastHourMinutes(minutelyRows.results);
  const pages = await database
    .prepare("SELECT path AS value, COUNT(*) AS visits FROM page_views GROUP BY path ORDER BY visits DESC LIMIT 10")
    .all<RankedValue>();
  const countries = await database
    .prepare("SELECT COALESCE(country, 'Desconocido') AS value, COUNT(*) AS visits FROM page_views GROUP BY country ORDER BY visits DESC LIMIT 10")
    .all<RankedValue>();

  return {
    total: totals?.total ?? 0,
    countriesCount: totals?.countries ?? 0,
    today: today?.visits ?? 0,
    daily: daily.results,
    minutely,
    pages: pages.results,
    countries: countries.results,
  };
});

// SQLite guarda viewed_at en UTC (CURRENT_TIMESTAMP), por eso el relleno usa Date en UTC.
function fillLastHourMinutes(rows: MinutelyViews[]): MinutelyViews[] {
  const visitsByMinute = new Map(rows.map((row) => [row.minute, row.visits]));
  const now = new Date();
  const minutes: MinutelyViews[] = [];

  for (let offset = 59; offset >= 0; offset -= 1) {
    const bucket = new Date(now.getTime() - offset * 60_000);
    const minute = bucket.toISOString().slice(0, 16).replace("T", " ") + ":00";
    minutes.push({ minute, visits: visitsByMinute.get(minute) ?? 0 });
  }

  return minutes;
}
