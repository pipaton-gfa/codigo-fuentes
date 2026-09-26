import { createServerFn } from "@tanstack/react-start";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { getDatabase } from "./database.server";
import { requireEventAccess } from "./admin-auth.server";
import { sendPurchaseReceiptEmail } from "./zoho-mail.server";

const IDOL_EVENT_ID = "0003";

type InvoiceLine = { id: string; name: string; price: number; quantity: number };
export type InvoiceData = {
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
  email_status: string;
  created_at: string;
};

async function sendPurchaseEmailOnce(input: {
  purchaseId: number;
  customerEmail: string;
  customerName: string;
  qrCode: string;
  invoice: InvoiceData;
}) {
  const database = getDatabase();
  const claim = await database
    .prepare(
      "UPDATE event_purchases SET email_status = 'sending', email_attempted_at = CURRENT_TIMESTAMP, email_error = NULL WHERE id = ?1 AND status = 'approved' AND (email_status IN ('pending', 'failed') OR (email_status = 'sending' AND email_attempted_at < datetime('now', '-10 minutes'))) RETURNING id",
    )
    .bind(input.purchaseId)
    .first<{ id: number }>();

  if (!claim) {
    const current = await database
      .prepare("SELECT email_status FROM event_purchases WHERE id = ?1")
      .bind(input.purchaseId)
      .first<{ email_status: string }>();
    return current?.email_status ?? "pending";
  }

  try {
    await sendPurchaseReceiptEmail(input);
    await database
      .prepare(
        "UPDATE event_purchases SET email_status = 'sent', email_sent_at = CURRENT_TIMESTAMP, email_error = NULL WHERE id = ?1",
      )
      .bind(input.purchaseId)
      .run();
    return "sent";
  } catch (error) {
    const safeMessage = (
      error instanceof Error ? error.message : "Zoho Mail no pudo enviar el correo."
    ).slice(0, 300);
    await database
      .prepare("UPDATE event_purchases SET email_status = 'failed', email_error = ?1 WHERE id = ?2")
      .bind(safeMessage, input.purchaseId)
      .run();
    return "failed";
  }
}

function createNumericQrCode() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(6));
  const numericValue = randomBytes.reduce((value, byte) => value * 256 + byte, 0);
  return String(numericValue % 1_000_000_000_000).padStart(12, "0");
}

export const getIdolEventPurchases = createServerFn({ method: "GET" }).handler(async () => {
  await requireEventAccess(IDOL_EVENT_ID);
  const result = await getDatabase()
    .prepare(
      "SELECT id, transaction_number, payment_preference_id, payment_id, qr_code, customer_name, customer_rut, customer_email, invoice_data, total_clp, status, email_status, created_at FROM event_purchases WHERE event_id = 3 ORDER BY created_at DESC, id DESC",
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
    if (
      !/^\d{1,20}$/.test(data.paymentId) ||
      !/^LF-\d{4}-\d+-\d{1,10}$/.test(data.transactionNumber)
    ) {
      return { approved: false as const, status: "invalid" };
    }

    const database = getDatabase();
    const purchase = await database
      .prepare(
        "SELECT id, total_clp, qr_code, status, customer_name, customer_email, invoice_data FROM event_purchases WHERE event_id = 3 AND transaction_number = ?1",
      )
      .bind(data.transactionNumber)
      .first<{
        id: number;
        total_clp: number;
        qr_code: string | null;
        status: string;
        customer_name: string;
        customer_email: string;
        invoice_data: string;
      }>();
    if (!purchase) return { approved: false as const, status: "not_found" };

    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) throw new Error("MERCADOPAGO_ACCESS_TOKEN no está configurado.");

    let payment;
    try {
      payment = await new Payment(new MercadoPagoConfig({ accessToken })).get({
        id: data.paymentId,
      });
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
    const emailStatus = await sendPurchaseEmailOnce({
      purchaseId: purchase.id,
      customerEmail: purchase.customer_email,
      customerName: purchase.customer_name,
      qrCode,
      invoice: JSON.parse(purchase.invoice_data) as InvoiceData,
    });
    return { approved: true as const, status: "approved", qrCode, emailStatus };
  });
