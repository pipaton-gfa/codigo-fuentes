import QRCode from "qrcode";
import type { InvoiceData } from "./event-purchases.server";

const SENDER_ADDRESS = "admin@landingfuentes.online";

type ZohoSecrets = {
  ZOHO_CLIENT_ID?: string;
  ZOHO_CLIENT_SECRET?: string;
  ZOHO_REFRESH_TOKEN?: string;
  ZOHO_ACCOUNT_ID?: string;
  ZOHO_ACCOUNTS_BASE_URL?: string;
  ZOHO_MAIL_BASE_URL?: string;
};

type ZohoAttachment = {
  attachmentName: string;
  attachmentPath: string;
  storeName: string;
};

type ZohoApiResponse = {
  status?: { code?: number; description?: string };
  data?: unknown;
};

function getZohoSecrets(): Required<
  Pick<
    ZohoSecrets,
    "ZOHO_CLIENT_ID" | "ZOHO_CLIENT_SECRET" | "ZOHO_REFRESH_TOKEN" | "ZOHO_ACCOUNT_ID"
  >
> &
  ZohoSecrets {
  const secrets = process.env as ZohoSecrets;
  const required = [
    secrets.ZOHO_CLIENT_ID,
    secrets.ZOHO_CLIENT_SECRET,
    secrets.ZOHO_REFRESH_TOKEN,
    secrets.ZOHO_ACCOUNT_ID,
  ];
  if (required.some((value) => !value)) {
    throw new Error("Zoho Mail no está configurado en el Worker.");
  }
  return secrets as Required<
    Pick<
      ZohoSecrets,
      "ZOHO_CLIENT_ID" | "ZOHO_CLIENT_SECRET" | "ZOHO_REFRESH_TOKEN" | "ZOHO_ACCOUNT_ID"
    >
  > &
    ZohoSecrets;
}

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

async function getAccessToken(secrets: ReturnType<typeof getZohoSecrets>) {
  const accountsBaseUrl = secrets.ZOHO_ACCOUNTS_BASE_URL ?? "https://accounts.zoho.com";
  const body = new URLSearchParams({
    refresh_token: secrets.ZOHO_REFRESH_TOKEN,
    client_id: secrets.ZOHO_CLIENT_ID,
    client_secret: secrets.ZOHO_CLIENT_SECRET,
    grant_type: "refresh_token",
  });
  const response = await fetch(`${accountsBaseUrl}/oauth/v2/token`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = (await response.json()) as { access_token?: string };
  if (!response.ok || !payload.access_token) {
    throw new Error(`Zoho OAuth no pudo renovar el token (HTTP ${response.status}).`);
  }
  return payload.access_token;
}

async function parseZohoResponse(response: Response) {
  const payload = (await response.json()) as ZohoApiResponse;
  if (!response.ok || (payload.status?.code !== undefined && payload.status.code >= 400)) {
    throw new Error(`Zoho Mail rechazó la solicitud (HTTP ${response.status}).`);
  }
  return payload;
}

function getAttachmentDetails(payload: ZohoApiResponse): ZohoAttachment {
  const outer = payload.data;
  const data = Array.isArray(outer) ? outer[0] : outer;
  if (!data || typeof data !== "object") {
    throw new Error("Zoho Mail no devolvió los datos del adjunto QR.");
  }
  const result = data as Partial<ZohoAttachment>;
  if (!result.attachmentName || !result.attachmentPath || !result.storeName) {
    throw new Error("Zoho Mail devolvió un adjunto QR incompleto.");
  }
  return {
    attachmentName: result.attachmentName,
    attachmentPath: result.attachmentPath,
    storeName: result.storeName,
  };
}

export async function sendPurchaseReceiptEmail(input: {
  customerEmail: string;
  customerName: string;
  qrCode: string;
  invoice: InvoiceData;
}) {
  const secrets = getZohoSecrets();
  const token = await getAccessToken(secrets);
  const mailBaseUrl = secrets.ZOHO_MAIL_BASE_URL ?? "https://mail.zoho.com";
  const accountBaseUrl = `${mailBaseUrl}/api/accounts/${encodeURIComponent(secrets.ZOHO_ACCOUNT_ID)}`;
  const qrUrl = `https://landingfuentes.online/validar?codigo=${encodeURIComponent(input.qrCode)}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 360, margin: 2 });
  const base64 = qrDataUrl.split(",")[1];
  if (!base64) throw new Error("No se pudo preparar la imagen del código QR.");
  const binary = atob(base64);
  const qrImage = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    qrImage[index] = binary.charCodeAt(index);
  }

  const attachmentUrl = new URL(`${accountBaseUrl}/messages/attachments`);
  attachmentUrl.searchParams.set("fileName", `codigo-qr-${input.invoice.reference}.png`);
  attachmentUrl.searchParams.set("isInline", "false");
  const uploadResponse = await fetch(attachmentUrl, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      "content-type": "image/png",
    },
    body: qrImage,
  });
  const attachment = getAttachmentDetails(await parseZohoResponse(uploadResponse));

  const lineRows = input.invoice.lines
    .map(
      (line) =>
        `<tr><td style="padding:8px 0;border-bottom:1px solid #e5edf2">${escapeHtml(line.name)} × ${line.quantity}</td><td style="padding:8px 0;border-bottom:1px solid #e5edf2;text-align:right">${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(line.price * line.quantity)}</td></tr>`,
    )
    .join("");
  const invoiceHtml = `<div style="max-width:600px;margin:0 auto;font-family:Arial,sans-serif;color:#123047"><h1 style="color:#176da2">Landing Fuentes</h1><h2>Comprobante de compra</h2><p>Hola ${escapeHtml(input.customerName)}, tu pago fue aprobado.</p><p><strong>Transacción:</strong> ${escapeHtml(input.invoice.reference)}<br><strong>Fecha:</strong> ${escapeHtml(new Date(input.invoice.createdAt).toLocaleString("es-CL"))}</p><table style="width:100%;border-collapse:collapse"><tbody>${lineRows}</tbody><tfoot><tr><td style="padding:12px 0;font-weight:bold">Total pagado</td><td style="padding:12px 0;text-align:right;font-weight:bold">${new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(input.invoice.total)}</td></tr></tfoot></table><h3>Tu código QR</h3><p>Código numérico: <strong style="font-size:20px;letter-spacing:2px">${escapeHtml(input.qrCode)}</strong></p><p>También adjuntamos el QR como imagen. Preséntalo para validar tu entrada.</p><p style="color:#567083;font-size:13px">Este es el comprobante de compra generado por Landing Fuentes.</p></div>`;

  const sendResponse = await fetch(`${accountBaseUrl}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Zoho-oauthtoken ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      fromAddress: SENDER_ADDRESS,
      toAddress: input.customerEmail,
      subject: `Comprobante y código QR · ${input.invoice.reference}`,
      content: invoiceHtml,
      mailFormat: "html",
      attachments: [attachment],
    }),
  });
  await parseZohoResponse(sendResponse);
}
