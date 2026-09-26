import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/multipaginas")({
  head: () => ({ meta: [{ title: "Multipáginas enlazadas - Landing Fuentes" }] }),
  component: Multipaginas,
});

function Multipaginas() {
  return (
    <main className="portfolio-shell portfolio-submenu">
      <SiteHeader />
      <section className="portfolio-submenu-heading portfolio-empty-state">
        <span className="portfolio-kicker">03 / SERVICIOS</span>
        <h1>multipaginas<br /><em>enlazadas</em></h1>
        <p>Este espacio queda reservado para los próximos proyectos con múltiples páginas conectadas.</p>
        <span className="portfolio-coming-soon">PRÓXIMAMENTE</span>
      </section>
    </main>
  );
}