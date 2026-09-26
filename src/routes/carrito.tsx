import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { SiteLayout } from "@/components/SiteLayout";
import { formatPrice, getTokenValue } from "@/lib/products";
import { useCart } from "@/lib/cart";

export const Route = createFileRoute("/carrito")({
  head: () => ({
    meta: [
      { title: "Carrito de compras — Landing Fuentes" },
      {
        name: "description",
        content: "Revisa los productos de tu carrito, ajusta cantidades y autoriza el pago.",
      },
      { property: "og:title", content: "Carrito de compras — Landing Fuentes" },
      {
        property: "og:description",
        content: "Ajusta cantidades, quita productos y autoriza tu compra en modo de prueba.",
      },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, total, count, setQuantity, remove } = useCart();
  const navigate = useNavigate();

  const authorize = () => {
    if (count === 0) {
      return;
    }

    localStorage.setItem("viamarket.pendingMethod", JSON.stringify("Mercado Pago"));
    navigate({ to: "/datos" });
  };

  return (
    <SiteLayout>
      <section className="pb-8 pt-8 sm:pt-12">
        <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Tu carrito</h1>
        <p className="mt-2 text-sm text-white/60 sm:text-base">
          {count === 0 ? "Todavía no agregaste productos." : `${count} artículo(s) seleccionados.`}
        </p>
      </section>

      {count === 0 ? (
        <div className="rounded-3xl border border-white/15 bg-white/10 p-8 text-center backdrop-blur-xl sm:p-10">
          <p className="text-white/70">Explora el catálogo y agrega tu primer producto.</p>
          <Link
            to="/"
            className="mt-6 inline-block rounded-xl bg-gradient-to-r from-brand to-accent-cyan px-6 py-3 font-semibold text-ink transition hover:opacity-90"
          >
            Ver productos
          </Link>
        </div>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="divide-y divide-white/10 rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  width={1024}
                  height={640}
                  className="h-16 w-16 rounded-xl bg-black/10 object-contain sm:h-16 sm:w-16"
                />
                <div className="min-w-0 flex-1">
                  <Link
                    to="/producto/$productId"
                    params={{ productId: product.id }}
                    className="font-display font-semibold transition hover:text-accent-cyan"
                  >
                    {product.name}
                  </Link>
                  <p className="text-sm text-white/55">1 token · {formatPrice(getTokenValue(product))} c/u</p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-start">
                  <div className="flex items-center gap-1 rounded-xl border border-white/15 bg-white/10 p-1">
                    <button
                      type="button"
                      aria-label={`Quitar una unidad de ${product.name}`}
                      onClick={() => setQuantity(product.id, quantity - 1)}
                      className="grid size-8 place-items-center rounded-lg transition hover:bg-white/15"
                    >
                      −
                    </button>
                    <span className="w-7 text-center font-display font-semibold">{quantity}</span>
                    <button
                      type="button"
                      aria-label={`Agregar una unidad de ${product.name}`}
                      onClick={() => setQuantity(product.id, quantity + 1)}
                      className="grid size-8 place-items-center rounded-lg transition hover:bg-white/15"
                    >
                      +
                    </button>
                  </div>
                  <span className="w-20 text-right font-display font-semibold">
                    {formatPrice(getTokenValue(product) * quantity)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => remove(product.id)}
                  className="text-sm text-white/45 transition hover:text-white sm:ml-1"
                >
                  Quitar
                </button>
              </div>
            ))}
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl sm:p-6">
            <div className="flex justify-between text-sm text-white/60">
              <span>Subtotal</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="mt-2 flex justify-between font-display text-lg font-semibold">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>

            <p className="mt-7 text-xs uppercase tracking-[0.15em] text-white/45">Medios de pago</p>
            <div className="mt-3 rounded-xl border border-accent-cyan/60 bg-accent-cyan/10 px-4 py-3">
              <span className="block font-medium">Mercado Pago</span>
              <span className="block text-xs text-white/50">
                Paga de forma segura con tu cuenta o tarjeta.
              </span>
            </div>

            <button
              type="button"
              onClick={authorize}
              disabled={count === 0}
              className="mt-6 w-full rounded-xl bg-gradient-to-r from-brand to-accent-cyan px-6 py-3 font-semibold text-ink transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {count === 0 ? "Carrito vacío" : "Continuar con mis datos"}
            </button>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
