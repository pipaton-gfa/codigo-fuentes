import { createFileRoute, Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { products, formatPrice, getTokenValue } from "@/lib/products";

export const Route = createFileRoute("/idols")({
  head: () => ({
    meta: [
      { title: "Idols - Total Market" },
      {
        name: "description",
        content: "Selecciona una idol y entrega tokens para apoyar su evento.",
      },
    ],
  }),
  component: IdolsPage,
});

function IdolsPage() {
  return (
    <main className="reference-event-page idols-page">
      <header className="reference-header">
        <Link to="/" className="reference-brand" aria-label="Volver al inicio">
          <img src="/total-market-banner.png" alt="Total Market" />
        </Link>
        <Link to="/carrito" className="reference-cart" aria-label="Abrir carrito">
          <ShoppingCart aria-hidden="true" />
        </Link>
      </header>

      <section className="idols-main">
        <div className="idols-heading">
          <div>
            <span className="reference-label">01 / OTROS</span>
            <h1>Elige a tu<br /><em>idol favorita</em></h1>
          </div>
          <p>Entrega tokens y apoya<br />su camino con nosotros.</p>
        </div>

        <div className="idols-grid">
          {products.map((product, index) => (
            <Link
              key={product.id}
              to="/producto/$productId"
              params={{ productId: product.id }}
              className="idol-card"
            >
              <div className="idol-card-image">
                <img src={product.image} alt={product.name} />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="idol-card-copy">
                <strong>{product.name}</strong>
                <span>1 token · {formatPrice(getTokenValue(product))}</span>
                <b>Apoyar →</b>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
