import { createServerFn } from "@tanstack/react-start";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getDatabase } from "./database.server";
import { requireEventAccess } from "./admin-auth.server";

const IDOL_EVENT_ID = "0003";

type InvoiceLine = { id: string; name: string; price: number; quantity: number };
type InvoiceData = {
  reference: string;
  createdAt: string;
  deliveryAt: string;
  method: string;
  lines: InvoiceLine[];
  total: number;
  itemCount: number;
  customer: { fullName: string; rut: string; email: string };
};
type EventPurchaseRow = {
  id: number;
  transaction_number: string;
  payment_preference_id: string;
  payment_id: string | null;
  qr_code: string | null;
  customer_name: string;
  customer_rut: string;
  customer_email: string;
  invoice_data: string;
  total_clp: number;
  status: string;
  created_at: string;
};

function createNumericQrCode() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(6));
  const numericValue = randomBytes.reduce((value, byte) => value * 256 + byte, 0);
  return String(numericValue % 1_000_000_000_000).padStart(12, "0");
}

export const getIdolEventPurchases = createServerFn({ method: "GET" }).handler(async () => {
  await requireEventAccess(IDOL_EVENT_ID);
  const result = await getDatabase()
    .prepare(
      "SELECT id, transaction_number, payment_preference_id, payment_id, qr_code, customer_name, customer_rut, customer_email, invoice_data, total_clp, status, created_at FROM event_purchases WHERE event_id = 3 ORDER BY created_at DESC, id DESC",
    )
    .all<EventPurchaseRow>();

  return result.results.map(({ invoice_data, ...purchase }) => ({
    ...purchase,
    invoice: JSON.parse(invoice_data) as InvoiceData,
  }));
});

export const confirmIdolEventPayment = createServerFn({ method: "POST" })
  .inputValidator((data: { paymentId: string; transactionNumber: string }) => data)
  .handler(async ({ data }) => {
    if (!/^\d{1,20}$/.test(data.paymentId) || !/^LF-\d{4}-\d+-\d{1,10}$/.test(data.transactionNumber)) {
      return { approved: false as const, status: "invalid" };
    }

    const database = getDatabase();
    const purchase = await database
      .prepare(
        "SELECT id, total_clp, qr_code, status FROM event_purchases WHERE event_id = 3 AND transaction_number = ?1",
      )
      .bind(data.transactionNumber)
      .first<{ id: number; total_clp: number; qr_code: string | null; status: string }>();
    if (!purchase) return { approved: false as const, status: "not_found" };

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN no está configurado.");

    let payment;
    try {
      payment = await new Payment(new MercadoPagoConfig({ accessToken })).get({ id: data.paymentId });
    } catch {
      return { approved: false as const, status: "verification_failed" };
    }

    if (
      payment.status !== "approved" ||
      payment.external_reference !== data.transactionNumber ||
      payment.transaction_amount !== purchase.total_clp ||
      payment.currency_id !== "CLP"
    ) {
      return { approved: false as const, status: payment.status ?? "pending" };
    }

    let qrCode = purchase.qr_code;
    if (!qrCode) {
      qrCode = createNumericQrCode();
      await database
        .prepare(
          "UPDATE event_purchases SET qr_code = ?1, payment_id = ?2, status = 'approved' WHERE id = ?3 AND qr_code IS NULL",
        )
        .bind(qrCode, String(payment.id ?? data.paymentId), purchase.id)
        .run();
      const updated = await database
        .prepare("SELECT qr_code FROM event_purchases WHERE id = ?1")
        .bind(purchase.id)
        .first<{ qr_code: string | null }>();
      qrCode = updated?.qr_code ?? null;
    }

    if (!qrCode) return { approved: false as const, status: "qr_generation_failed" };
    return { approved: true as const, status: "approved", qrCode };
  });
