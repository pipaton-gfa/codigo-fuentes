import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { SiteLayout } from "@/components/SiteLayout";
import { useCart } from "@/lib/cart";
import { formatPrice, getTokenValue } from "@/lib/products";
import { createMercadoPagoPreference } from "@/lib/mercadopago.server";

export const Route = createFileRoute("/datos")({
  head: () => ({
    meta: [
      { title: "Datos del comprador — Código Fuentes" },
      {
        name: "description",
        content: "Completa tus datos para confirmar la compra y generar la factura.",
      },
    ],
  }),
  component: BuyerDataPage,
});

const normalizeRut = (value: string) => value.replace(/[^0-9kK\-]/g, "").slice(0, 12);

function BuyerDataPage() {
  const { checkout, total, items, count } = useCart();
  const [form, setForm] = useState({
    fullName: "",
    rut: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [isRedirecting, setIsRedirecting] = useState(false);

  const onChange = (field: keyof typeof form, value: string) => {
    if (field === "rut") {
      value = normalizeRut(value);
    }

    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.fullName.trim() || !form.rut.trim() || !form.email.trim()) {
      setError("Completa nombre, RUT y correo para continuar.");
      return;
    }

    setIsRedirecting(true);
    setError("");

    try {
      const preference = await createMercadoPagoPreference({
        data: {
          lines: items.map(({ product, quantity }) => ({
            id: product.id,
            quantity,
          })),
          customer: {
            fullName: form.fullName.trim(),
            email: form.email.trim(),
          },
          returnUrl: `${window.location.origin}/factura`,
        },
      });

      const order = checkout("Mercado Pago", {
        fullName: form.fullName.trim(),
        rut: form.rut.trim(),
        email: form.email.trim(),
      });

      if (!order) {
        setError("No hay productos en el carrito para confirmar la compra.");
        return;
      }

      localStorage.setItem("viamarket.mercadopagoPreference", preference.preferenceId);
      window.location.assign(preference.checkoutUrl);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "No fue posible iniciar el pago con Mercado Pago.",
      );
    } finally {
      setIsRedirecting(false);
    }
  };

  if (count === 0 || items.length === 0) {
    return (
      <SiteLayout>
        <section className="pt-16">
          <div className="rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xl p-10 text-center">
            <h1 className="font-display font-bold text-3xl tracking-tight">Tu carrito está vacío</h1>
            <p className="mt-3 text-white/60">Agrega al menos un producto antes de continuar.</p>
            <Link
              to="/"
              className="mt-6 inline-block rounded-xl bg-gradient-to-r from-brand to-accent-cyan px-6 py-3 font-semibold text-ink hover:opacity-90 transition"
            >
              Ver productos
            </Link>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="pt-12 pb-8">
        <h1 className="font-display font-bold text-4xl tracking-tight">Datos del comprador</h1>
        <p className="mt-2 text-white/60">Estás a un paso de finalizar tu compra.</p>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl sm:p-7">
          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm text-white/65">Nombre completo</label>
              <input
                value={form.fullName}
                onChange={(event) => onChange("fullName", event.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 focus:border-accent-cyan focus:outline-none"
                placeholder="Ej: Ana María López"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/65">RUT</label>
              <input
                value={form.rut}
                onChange={(event) => onChange("rut", event.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 focus:border-accent-cyan focus:outline-none"
                placeholder="Ej: 12.345.678-9"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-white/65">Correo electrónico</label>
              <input
                type="email"
                value={form.email}
                onChange={(event) => onChange("email", event.target.value)}
                className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/35 focus:border-accent-cyan focus:outline-none"
                placeholder="usuario@correo.com"
              />
            </div>
          </div>

          {error ? <p className="mt-4 text-sm text-red-300">{error}</p> : null}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-brand to-accent-cyan px-6 py-3 font-semibold text-ink transition hover:opacity-90"
          >
            {isRedirecting ? "Redirigiendo a Mercado Pago..." : "Pagar con Mercado Pago"}
          </button>
        </form>

        <aside className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl sm:p-6">
          <p className="text-xs uppercase tracking-[0.15em] text-white/45">Resumen</p>
          <div className="mt-4 space-y-3">
            {items.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center justify-between gap-3 text-sm">
                <span className="text-white/70">
                  {product.name} × {quantity}
                </span>
                <span>{formatPrice(getTokenValue(product) * quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 font-display text-lg font-semibold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </aside>
      </div>
    </SiteLayout>
  );
}
