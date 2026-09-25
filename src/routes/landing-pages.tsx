import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/landing-pages")({
  head: () => ({ meta: [{ title: "Landing pages estratégicos - Código Fuentes" }] }),
  component: LandingPages,
});

function LandingPages() {
  return (
    <main className="portfolio-shell portfolio-submenu">
      <SiteHeader />
      <section className="portfolio-submenu-heading">
        <span className="portfolio-kicker">01 / SERVICIOS</span>
        <h1>landing pages<br /><em>estratégicos</em></h1>
        <p>Dos experiencias diseñadas para presentar una propuesta con claridad y convertir visitas en oportunidades.</p>
      </section>
      <nav className="portfolio-project-list" aria-label="Landing pages disponibles">
        <a className="portfolio-project" href="/landing-el-colorado.html">
          <span>01</span><strong>Landing El Colorado</strong><ArrowUpRight aria-hidden="true" />
        </a>
        <a className="portfolio-project" href="/landing-fiesta-de-la-chilenidad.html">
          <span>02</span><strong>Landing Fiesta de la Chilenidad</strong><ArrowUpRight aria-hidden="true" />
        </a>
      </nav>
    </main>
  );
}