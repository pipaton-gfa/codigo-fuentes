import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import { getProduct, formatPrice, getTokenValue } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/producto/$productId")({
  loader: ({ params }) => {
    const product = getProduct(params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Producto no disponible — Código Fuentes" }, { name: "robots", content: "noindex" }],
      };
    }
    const { product } = loaderData;
    return {
      meta: [
        { title: `${product.name} — Código Fuentes` },
        { name: "description", content: product.description },
        { property: "og:title", content: `${product.name} — Código Fuentes` },
        { property: "og:description", content: product.description },
      ],
    };
  },
  component: ProductDetail,
});

function ProductDetail() {
  const { product } = Route.useLoaderData();
  const { add } = useCart();
  const [quantity, setQuantity] = useState(0);
  const [addedQuantity, setAddedQuantity] = useState(0);
  const [error, setError] = useState("");

  return (
    <main className="reference-event-page">
      <SiteHeader showCart />
      <section className="reference-event-main">
        <nav className="reference-event-breadcrumb"><Link to="/">Inicio</Link> / Eventos / {product.name}</nav>
        <div className="reference-event-grid">
          <img className="reference-event-image" src={product.image} alt={product.name} />
          <div className="reference-event-info">
            <span className="reference-label">01 / EVENTO DESTACADO</span>
            <h1>Dona dinero<br />a tu idol favorita</h1>
            <p className="event-price">1 token · {formatPrice(getTokenValue(product))}</p>
            <p>{product.description || "Apoya directamente a tu idol favorita y ayúdala a seguir creando momentos inolvidables."}</p>
            <div className="reference-event-quantity">
              <button type="button" aria-label="Quitar un token" onClick={() => { setQuantity((q) => Math.max(0, q - 1)); setError(""); }}>−</button>
              <span>{quantity}</span>
              <button type="button" aria-label="Agregar un token" onClick={() => { setQuantity((q) => q + 1); setError(""); }}>+</button>
              <small>{formatPrice(getTokenValue(product) * quantity)}</small>
            </div>
            <button type="button" className="reference-event-add" onClick={() => {
              if (quantity <= 0) { setError("Agrega al menos un token para continuar."); return; }
              add(product.id, quantity); setAddedQuantity((current) => current + quantity); setQuantity(0); setError("");
            }}>Agregar al carrito</button>
            {addedQuantity > 0 ? <p className="reference-event-success">Agregaste {addedQuantity} token{addedQuantity === 1 ? "" : "s"} al carrito.</p> : null}
            {error ? <p className="reference-event-success">{error}</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}
