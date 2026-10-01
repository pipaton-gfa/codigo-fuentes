import type { InvoiceData } from "./event-purchases.server";
import { getRuntimeEnvironment } from "./database.server";

type MailingEnvironment = {
  MAIL_API_URL?: string;
  MAIL_API_TOKEN?: string;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });
}

function getMailingEnvironment() {
  const environment = {
    ...getRuntimeEnvironment(),
    ...(process.env as MailingEnvironment),
  } as MailingEnvironment;
  if (!environment.MAIL_API_URL || !environment.MAIL_API_TOKEN) {
    throw new Error("La API de mailing no está configurada.");
  }
  return environment as Required<MailingEnvironment>;
}

export async function sendPurchaseReceiptEmail(input: {
  purchaseId: string;
  customerEmail: string;
  customerName: string;
  qrCode: string;
  invoice: InvoiceData;
}) {
  const environment = getMailingEnvironment();
  const lineRows = input.invoice.lines
    .map(
      (line) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e5edf2">${escapeHtml(line.name)} x ${line.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #e5edf2;text-align:right">${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(line.price * line.quantity)}</td></tr>`,
    )
    .join("");
  const qrUrl = `https://landingfuentes.online/validar?codigo=${encodeURIComponent(input.qrCode)}`;
  const html = `<!doctype html><html lang="es"><head><meta charset="UTF-8"></head><body style="margin:0;background:#f4f9fc;color:#123047;font-family:Arial,sans-serif"><div style="max-width:600px;margin:0 auto;padding:28px 20px"><h1 style="color:#176da2">Landing Fuentes</h1><h2>Comprobante de compra</h2><p>Hola ${escapeHtml(input.customerName)}, tu pago fue aprobado.</p><p><strong>ID de compra:</strong> ${escapeHtml(input.purchaseId)}<br><strong>Transacción:</strong> ${escapeHtml(input.invoice.reference)}<br><strong>Fecha:</strong> ${escapeHtml(new Date(input.invoice.createdAt).toLocaleString("es-CL"))}</p><table style="width:100%;border-collapse:collapse"><tbody>${lineRows}</tbody><tfoot><tr><td style="padding:12px 0;font-weight:bold">Total pagado</td><td style="padding:12px 0;text-align:right;font-weight:bold">${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(input.invoice.total)}</td></tr></tfoot></table><h3>Tu código QR</h3><p>Código numérico: <strong style="font-size:20px;letter-spacing:2px">${escapeHtml(input.qrCode)}</strong></p><p>Adjuntamos tu código QR como imagen. Preséntalo para validar tu entrada.</p><p style="color:#567083;font-size:13px">Este es el comprobante de compra generado por Landing Fuentes.</p></div></body></html>`;

  const response = await fetch(`${environment.MAIL_API_URL}/v1/mail/send`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${environment.MAIL_API_TOKEN}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      to: input.customerEmail,
      subject: `Comprobante y código QR · ${input.invoice.reference}`,
      html,
      purchaseId: input.purchaseId,
      qrCode: input.qrCode,
      qrUrl,
    }),
  });
  const payload = (await response.json()) as {
    ok?: boolean;
    messageId?: string | null;
    error?: string;
  };
  if (!response.ok || !payload.ok) {
    throw new Error(payload.error ?? `La API de mailing respondió HTTP ${response.status}.`);
  }
  return { messageId: payload.messageId ?? null };
}
