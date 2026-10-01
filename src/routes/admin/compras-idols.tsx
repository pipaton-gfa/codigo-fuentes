import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PurchaseQrModal } from "@/components/PurchaseQrModal";
import { getIdolEventPurchases, resendIdolPurchaseEmail } from "@/lib/event-purchases.server";
import { getCurrentUser } from "@/lib/users.server";
import { formatPrice } from "@/lib/products";

type Purchases = Awaited<ReturnType<typeof getIdolEventPurchases>>;

export const Route = createFileRoute("/admin/compras-idols")({
  head: () => ({ meta: [{ title: "Compras de idols - Landing Fuentes" }] }),
  component: IdolPurchasesPage,
});

const formatDate = (value: string) =>
  new Date(value).toLocaleString("es-CL", { dateStyle: "short", timeStyle: "short" });

function IdolPurchasesPage() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState<Purchases>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resendingPurchaseId, setResendingPurchaseId] = useState<number | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then(async (user) => {
        if (!user || (user.role === "user" && !user.eventIds.includes("0003"))) {
          navigate({ to: "/admin" });
          return;
        }
        setPurchases(await getIdolEventPurchases());
      })
      .catch(() => setError("No se pudieron cargar las compras."))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleResendEmail = async (purchaseId: number) => {
    setResendingPurchaseId(purchaseId);
    const result = await resendIdolPurchaseEmail({ data: { purchaseId } });
    setResendingPurchaseId(null);
    if (!result.ok) {
      setError("No se pudo reenviar el correo.");
      return;
    }
    setPurchases((current) =>
      current.map((purchase) =>
        purchase.id === purchaseId ? { ...purchase, email_status: "sent" } : purchase,
      ),
    );
  };

  return (
    <section className="admin-content admin-purchases-content">
      <Link to="/admin" className="admin-back-link">
        ← Volver al panel
      </Link>
      <span className="source-kicker">EVENTO 0003 · DONACIONES A IDOLS</span>
      <h1>
        Compras
        <br />
        <em>registradas.</em>
      </h1>
      {error && (
        <p className="source-login-error" role="alert">
          {error}
        </p>
      )}
      {loading ? (
        <p className="admin-intro">Cargando compras...</p>
      ) : (
        <div className="admin-purchases-table-wrap">
          <table className="admin-purchases-table">
            <thead>
              <tr>
                <th>ID de compra</th>
                <th>Comprador</th>
                <th>Transacción</th>
                <th>Código QR</th>
                <th>Factura</th>
                <th>Pago</th>
                <th>Correo</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td>
                    <strong>{purchase.purchase_id}</strong>
                  </td>
                  <td>
                    <strong>{purchase.customer_name}</strong>
                    <small>RUT {purchase.customer_rut}</small>
                    <small>{purchase.customer_email}</small>
                    <small>{formatDate(purchase.created_at)}</small>
                  </td>
                  <td>
                    <strong>{purchase.payment_id ?? purchase.transaction_number}</strong>
                    <small>Orden {purchase.transaction_number}</small>
                    <small>Preferencia MP {purchase.payment_preference_id}</small>
                  </td>
                  <td className="admin-purchase-qr">
                    {purchase.status === "approved" && purchase.qr_code ? (
                      <>
                        <strong>{purchase.qr_code}</strong>
                        <PurchaseQrModal
                          qrCode={purchase.qr_code}
                          purchaseId={purchase.purchase_id}
                        />
                      </>
                    ) : (
                      <span>Pendiente de aprobación</span>
                    )}
                  </td>
                  <td>
                    <ul className="admin-purchase-lines">
                      {purchase.invoice.lines.map((line) => (
                        <li key={line.id}>
                          {line.name} × {line.quantity}
                        </li>
                      ))}
                    </ul>
                    <strong>{formatPrice(purchase.total_clp)}</strong>
                  </td>
                  <td>{purchase.status === "approved" ? "Aprobado" : "Iniciado"}</td>
                  <td>
                    {purchase.status === "approved" && purchase.qr_code ? (
                      <button
                        type="button"
                        className="admin-purchase-email"
                        disabled={resendingPurchaseId === purchase.id}
                        onClick={() => handleResendEmail(purchase.id)}
                      >
                        {resendingPurchaseId === purchase.id ? "Enviando..." : "Reenviar correo"}
                      </button>
                    ) : (
                      <span>Disponible al aprobar</span>
                    )}
                  </td>
                </tr>
              ))}
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={7} className="admin-purchases-empty">
                    Todavía no hay compras para este evento.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
