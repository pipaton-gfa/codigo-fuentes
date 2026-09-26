import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, ShoppingCart } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { EVENTS } from "@/lib/events";

export const Route = createFileRoute("/quioscos")({
  head: () => ({ meta: [{ title: "Quioscos con carritos de compra - Código Fuentes" }] }),
  component: Kiosks,
});

function Kiosks() {
  return (
    <main className="portfolio-shell portfolio-submenu">
      <SiteHeader />
      <section className="portfolio-submenu-heading">
        <span className="portfolio-kicker">02 / SERVICIOS</span>
        <h1>
          quioscos con
          <br />
          <em>carritos de compra</em>
        </h1>
        <p>Soluciones para mostrar productos, recibir pedidos y acompañar el proceso de compra.</p>
      </section>
      <nav className="portfolio-project-list" aria-label="Quioscos disponibles">
        <a className="portfolio-project" href={EVENTS[2].href}>
          <span className="portfolio-project-leading">
            <ShoppingCart aria-hidden="true" /> {EVENTS[2].id}
          </span>
          <strong>{EVENTS[2].name}</strong>
          <ArrowUpRight aria-hidden="true" />
        </a>
      </nav>
    </main>
  );
}
