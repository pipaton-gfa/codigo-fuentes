import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { EVENTS } from "@/lib/events";

export const Route = createFileRoute("/landing-pages")({
  head: () => ({ meta: [{ title: "Landing pages estratégicos - Código Fuentes" }] }),
  component: LandingPages,
});

function LandingPages() {
  return (
    <main className="portfolio-shell portfolio-submenu">
      <SiteHeader />
      <section className="portfolio-submenu-heading">
        <span className="portfolio-kicker">01 / EVENTOS</span>
        <h1>
          landing pages
          <br />
          <em>estratégicos</em>
        </h1>
        <p>
          Experiencias con identificador propio para presentar cada evento y compartir su enlace.
        </p>
      </section>
      <nav className="portfolio-project-list" aria-label="Landing pages disponibles">
        {EVENTS.filter((event) => event.id !== "0003").map((event) => (
          <a className="portfolio-project" href={event.href} key={event.id}>
            <span>{event.id}</span>
            <strong>{event.name}</strong>
            <ArrowUpRight aria-hidden="true" />
          </a>
        ))}
      </nav>
    </main>
  );
}
