import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { SiteLayout } from "@/components/SiteLayout";
import { formatPrice, getTokenValue } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { confirmIdolEventPayment } from "@/lib/event-purchases.server";

export const Route = createFileRoute("/factura")({
  head: () => ({
    meta: [
      { title: "Factura y entrega — Landing Fuentes" },
      {
        name: "description",
        content: "Factura de tu compra con detalle de productos, total y hora estimada de entrega.",
      },
      { property: "og:title", content: "Factura y entrega — Landing Fuentes" },
      {
        property: "og:description",
        content: "Compra autorizada: revisa tu factura y la hora estimada de entrega.",
      },
    ],
  }),
  component: InvoicePage,
});

const timeFormat = (iso: string) =>
  new Date(iso).toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });

const dateFormat = (iso: string) =>
  new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

function InvoicePage() {
  const { order } = useCart();
  const [qrCode, setQrCode] = useState("");
  const [numericQrCode, setNumericQrCode] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "verifying" | "approved" | "rejected"
  >("pending");
  const [emailStatus, setEmailStatus] = useState("");

  useEffect(() => {
    if (!order) return;
    const query = new URLSearchParams(window.location.search);
    const paymentId = query.get("payment_id") ?? query.get("collection_id");
    if (!paymentId) return;

    setPaymentStatus("verifying");
    confirmIdolEventPayment({ data: { paymentId, transactionNumber: order.reference } })
      .then((result) => {
        if (!result.approved) {
          setPaymentStatus(
            result.status === "rejected" || result.status === "cancelled" ? "rejected" : "pending",
          );
          return;
        }

        setNumericQrCode(result.qrCode);
        setPaymentStatus("approved");
        setEmailStatus(result.emailStatus);
        localStorage.setItem(
          "viamarket.order",
          JSON.stringify({ ...order, ticketCode: result.qrCode }),
        );
        const ticketUrl = `${window.location.origin}/validar?codigo=${encodeURIComponent(result.qrCode)}`;
        return QRCode.toDataURL(ticketUrl, { width: 280, margin: 2 }).then(setQrCode);
      })
      .catch(() => setPaymentStatus("pending"));
  }, [order]);

  if (!order) {
    return (
      <SiteLayout>
        <section className="pt-16">
          <div className="rounded-3xl bg-white/10 border border-white/15 backdrop-blur-xl p-10 text-center">
            <h1 className="font-display font-bold text-3xl tracking-tight">
              Todavía no hay una factura
            </h1>
            <p className="mt-3 text-white/60">
              Autoriza una compra desde el carrito para generar tu factura.
            </p>
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
      <section className="pb-8 pt-8 sm:pt-12">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] text-white/70 backdrop-blur-md sm:text-xs">
          <span
            className={`size-1.5 rounded-full ${paymentStatus === "approved" ? "bg-accent-cyan" : "bg-amber-400"}`}
          />
          {paymentStatus === "approved"
            ? "Pago aprobado"
            : paymentStatus === "verifying"
              ? "Verificando pago"
              : paymentStatus === "rejected"
                ? "Pago rechazado"
                : "Pago pendiente"}
        </span>
        <h1 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Tu factura
        </h1>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-xl sm:p-7">
          <div className="flex flex-wrap justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/45">N.º de pedido</p>
              <p className="mt-1 font-display font-semibold">{order.reference}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/45">Fecha</p>
              <p className="mt-1 font-display font-semibold">{dateFormat(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-white/45">Medio de pago</p>
              <p className="mt-1 font-display font-semibold">{order.method}</p>
            </div>
          </div>

          <div className="border-b border-white/10 py-5">
            <p className="text-xs uppercase tracking-[0.15em] text-white/45">Comprador</p>
            <p className="mt-2 font-display font-semibold">{order.customer.fullName}</p>
            <p className="text-sm text-white/65">{order.customer.rut}</p>
            <p className="text-sm text-white/65">{order.customer.email}</p>
          </div>

          <div className="space-y-3 py-5">
            {order.lines.map((line) => (
              <div key={line.id} className="flex justify-between gap-3 text-sm">
                <span className="text-white/70">
                  {line.name} × {line.quantity}
                </span>
                <span className="font-medium">
                  {formatPrice(getTokenValue(line) * line.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex justify-between border-t border-white/10 pt-5 font-display text-lg font-semibold">
            <span>Total pagado</span>
            <span>{formatPrice(order.total)}</span>
          </div>
        </div>

        <div className="rounded-3xl border border-white/20 bg-white p-6 text-center text-ink shadow-xl">
          <p className="text-xs uppercase tracking-[0.15em] text-slate-500">Entrada digital</p>
          {paymentStatus === "approved" && qrCode && numericQrCode ? (
            <img src={qrCode} alt="Código QR de entrada" className="mx-auto mt-4 size-56" />
          ) : (
            <p className="mt-6 text-sm text-slate-500">
              {paymentStatus === "verifying"
                ? "Verificando el pago..."
                : "El QR estará disponible cuando Mercado Pago apruebe el pago."}
            </p>
          )}
          {paymentStatus === "approved" && numericQrCode && (
            <>
              <p className="mt-3 break-all font-mono text-xs text-slate-500">{numericQrCode}</p>
              <p className="mt-3 text-sm text-slate-600">
                Presenta este código para validar tu entrada.
              </p>
              <p className="mt-3 text-sm text-slate-600">
                {emailStatus === "sent"
                  ? `Comprobante y QR enviados a ${order.customer.email}.`
                  : "Tu pago está aprobado. El correo con el comprobante y QR está pendiente de envío."}
              </p>
            </>
          )}
        </div>

        <div className="rounded-3xl border border-white/20 bg-gradient-to-br from-brand/30 to-accent-cyan/20 p-5 backdrop-blur-xl sm:p-7">
          <p className="text-xs uppercase tracking-[0.15em] text-white/60">Entrega estimada</p>
          <p className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {timeFormat(order.deliveryAt)}
          </p>
          <p className="mt-2 text-sm text-white/70 sm:text-base">
            Una hora después de tu compra de las {timeFormat(order.createdAt)} ·{" "}
            {dateFormat(order.deliveryAt)}
          </p>
          <Link
            to="/"
            className="mt-7 inline-block rounded-xl border border-white/15 bg-white/10 px-6 py-3 font-medium transition hover:bg-white/20"
          >
            Seguir comprando
          </Link>
        </div>
      </div>
    </SiteLayout>
  );
}
