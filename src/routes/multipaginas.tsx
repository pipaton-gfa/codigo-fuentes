import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/multipaginas")({
  head: () => ({ meta: [{ title: "Multipáginas enlazadas - Código Fuentes" }] }),
  component: Multipaginas,
});

function Multipaginas() {
  return (
    <main className="portfolio-shell portfolio-submenu">
      <header className="portfolio-header">
        <Link to="/" className="portfolio-back" aria-label="Volver al menú principal"><ArrowLeft aria-hidden="true" /> Volver</Link>
        <span className="portfolio-mark">03 / 03</span>
      </header>
      <section className="portfolio-submenu-heading portfolio-empty-state">
        <span className="portfolio-kicker">03 / SERVICIOS</span>
        <h1>multipaginas<br /><em>enlazadas</em></h1>
        <p>Este espacio queda reservado para los próximos proyectos con múltiples páginas conectadas.</p>
        <span className="portfolio-coming-soon">PRÓXIMAMENTE</span>
      </section>
    </main>
  );
}