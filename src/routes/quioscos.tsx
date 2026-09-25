import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowUpRight, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/quioscos")({
  head: () => ({ meta: [{ title: "Quioscos con carritos de compra - Código Fuentes" }] }),
  component: Kiosks,
});

function Kiosks() {
  return (
    <main className="portfolio-shell portfolio-submenu">
      <header className="portfolio-header">
        <Link to="/" className="portfolio-back" aria-label="Volver al menú principal"><ArrowLeft aria-hidden="true" /> Volver</Link>
        <span className="portfolio-mark">02 / 03</span>
      </header>
      <section className="portfolio-submenu-heading">
        <span className="portfolio-kicker">02 / SERVICIOS</span>
        <h1>quioscos con<br /><em>carritos de compra</em></h1>
        <p>Soluciones para mostrar productos, recibir pedidos y acompañar el proceso de compra.</p>
      </section>
      <nav className="portfolio-project-list" aria-label="Quioscos disponibles">
        <Link className="portfolio-project" to="/idols">
          <span className="portfolio-project-leading"><ShoppingCart aria-hidden="true" /> 01</span><strong>Donar dinero a idols</strong><ArrowUpRight aria-hidden="true" />
        </Link>
      </nav>
    </main>
  );
}