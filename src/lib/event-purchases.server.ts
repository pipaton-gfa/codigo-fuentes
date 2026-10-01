import { createServerFn } from "@tanstack/react-start";
import { getRuntimeEnvironment } from "./database.server";
import { requireEventAccess } from "./admin-auth.server";

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
  purchase_id: string;
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
  email_attempted_at: string | null;
  email_sent_at: string | null;
  email_error: string | null;
  email_message_id: string | null;
  created_at: string;
};
type EventPurchase = Omit<EventPurchaseRow, "invoice_data"> & { invoice: InvoiceData };

type PaymentApiEnvironment = {
  PAYMENT_API_URL?: string;
  PAYMENT_API_TOKEN?: string;
};

function getPaymentApiEnvironment() {
  const environment = {
    ...getRuntimeEnvironment(),
    ...(process.env as PaymentApiEnvironment),
  } as PaymentApiEnvironment;
  if (!environment.PAYMENT_API_URL || !environment.PAYMENT_API_TOKEN) {
    throw new Error("La API de pagos no está configurada en el servidor.");
  }
  return environment as Required<PaymentApiEnvironment>;
}

async function callPaymentApi<T>(path: string, method: "GET" | "POST", body?: unknown): Promise<T> {
  const environment = getPaymentApiEnvironment();
  let response: Response;
  try {
    response = await fetch(`${environment.PAYMENT_API_URL.replace(/\/$/, "")}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${environment.PAYMENT_API_TOKEN}`,
        ...(body === undefined ? {} : { "content-type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
  } catch {
    throw new Error("No se pudo conectar con la API de pagos.");
  }

  let payload: T;
  try {
    payload = (await response.json()) as T;
  } catch {
    throw new Error("La API de pagos devolvió una respuesta inválida.");
  }
  if (!response.ok) throw new Error("La API de pagos no pudo completar la operación.");
  return payload;
}

export const getIdolEventPurchases = createServerFn({ method: "GET" }).handler(async () => {
  await requireEventAccess(IDOL_EVENT_ID);
  const result = await callPaymentApi<{ ok?: boolean; purchases?: EventPurchase[] }>(
    "/v1/purchases/idols",
    "GET",
  );
  if (!result.ok || !Array.isArray(result.purchases)) {
    throw new Error("No se pudieron cargar las compras.");
  }
  return result.purchases;
});

export const resendIdolPurchaseEmail = createServerFn({ method: "POST" })
  .inputValidator((data: { purchaseId: number }) => data)
  .handler(async ({ data }) => {
    await requireEventAccess(IDOL_EVENT_ID);
    if (!Number.isInteger(data.purchaseId)) {
      return { ok: false as const, status: "invalid" };
    }
    return callPaymentApi<{ ok: boolean; status: string }>(
      "/v1/purchases/resend-email",
      "POST",
      { purchaseId: data.purchaseId },
    );
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

    const result = await callPaymentApi<{
      approved?: boolean;
      status?: string;
      qrCode?: string | null;
      emailStatus?: string;
    }>("/v1/payments/verify", "POST", data);
    if (!result.approved) {
      return { approved: false as const, status: result.status ?? "verification_failed" };
    }
    if (!result.qrCode || !/^\d{12}$/.test(result.qrCode)) {
      return { approved: false as const, status: "qr_generation_failed" };
    }
    return {
      approved: true as const,
      status: "approved",
      qrCode: result.qrCode,
      emailStatus: result.emailStatus ?? "pending",
    };
  });
