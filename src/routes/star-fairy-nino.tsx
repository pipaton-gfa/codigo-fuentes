import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/star-fairy-nino")({
  head: () => ({
    meta: [
      { title: "Star Fairy Nino — Eventos y proyectos" },
      { name: "description", content: "El universo de Star Fairy Nino: próximos eventos, proyectos, grupos y cultura idol en Chile." },
      { property: "og:title", content: "Star Fairy Nino — Eventos y proyectos" },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://landingfuentes.online/star-fairy-nino" },
    ],
  }),
  component: StarFairyNino,
});

function StarFairyNino() {
  return (
    <main className="mmd-route-shell">
      <iframe className="mmd-route-frame" src="/star-fairy-nino/" title="Star Fairy Nino" />
    </main>
  );
}