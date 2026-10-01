import { createServerFn } from "@tanstack/react-start";
import { getAuthenticatedUser } from "./admin-auth.server";
import { getDatabase } from "./database.server";

type SalesStatisticsPage = {
  id: number;
  eventId: string;
  eventName: string;
  title: string;
  description: string;
  path: string;
};

export const getSalesStatisticsPages = createServerFn({ method: "GET" }).handler(async () => {
  const user = await getAuthenticatedUser();
  if (!user) throw new Error("Se requiere una sesión autenticada.");

  const result = await getDatabase()
    .prepare(
      "SELECT sales_statistics_pages.id, printf('%04d', sales_statistics_pages.event_id) AS eventId, events.name AS eventName, sales_statistics_pages.title, sales_statistics_pages.description, sales_statistics_pages.path FROM sales_statistics_pages JOIN events ON events.id = sales_statistics_pages.event_id ORDER BY sales_statistics_pages.event_id, sales_statistics_pages.id",
    )
    .all<SalesStatisticsPage>();

  if (user.role !== "user") return result.results;

  const assignedEvents = await getDatabase()
    .prepare(
      "SELECT printf('%04d', event_id) AS event_id FROM user_events WHERE user_id = ?1",
    )
    .bind(user.id)
    .all<{ event_id: string }>();
  const assignedEventIds = new Set(assignedEvents.results.map((event) => event.event_id));

  return result.results.filter((page) => assignedEventIds.has(page.eventId));
});
