import QRCode from "qrcode";
import type { InvoiceData } from "./event-purchases.server";

const SENDER_ADDRESS = "gabriel.fuentes@landingfuentes.online";

type ZohoSecrets = {
  ZOHO_CLIENT_ID?: string;
  ZOHO_CLIENT_SECRET?: string;
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

async function parseJsonResponse<T>(response: Response, operation: string): Promise<T> {
  const body = await response.text();
  try {
    return JSON.parse(body) as T;
  } catch {
    const contentType = response.headers.get("content-type") ?? "desconocido";
    throw new Error(
      `${operation} devolvió una respuesta no JSON (HTTP ${response.status}, ${contentType}). Revisa la URL regional de Zoho y la configuración OAuth.`,
    );
  }
}

function getZohoSecrets(): Required<Pick<ZohoSecrets, "ZOHO_CLIENT_ID" | "ZOHO_CLIENT_SECRET">> &
  ZohoSecrets {
  const secrets = process.env as ZohoSecrets;
  const required = [secrets.ZOHO_CLIENT_ID, secrets.ZOHO_CLIENT_SECRET];
  if (required.some((value) => !value)) {
    throw new Error("Zoho Mail no está configurado en el Worker.");
  }
  return secrets as Required<Pick<ZohoSecrets, "ZOHO_CLIENT_ID" | "ZOHO_CLIENT_SECRET">> &
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
  const tokenUrl = new URL(`${accountsBaseUrl}/oauth/v2/token`);
  tokenUrl.search = new URLSearchParams({
    client_id: secrets.ZOHO_CLIENT_ID,
    client_secret: secrets.ZOHO_CLIENT_SECRET,
    grant_type: "client_credentials",
    scope: "ZohoMail.messages.CREATE,ZohoMail.accounts.READ",
  }).toString();
  const response = await fetch(tokenUrl, { method: "POST" });
  const payload = await parseJsonResponse<{
    access_token?: string;
    error?: string;
    error_description?: string;
  }>(response, "La autenticación OAuth de Zoho");
  if (!response.ok || !payload.access_token) {
    const reason = payload.error_description ?? payload.error ?? `HTTP ${response.status}`;
    throw new Error(`Zoho OAuth no pudo emitir el access token (${reason}).`);
  }
  return payload.access_token;
}

async function parseZohoResponse(response: Response, operation: string) {
  const payload = await parseJsonResponse<ZohoApiResponse>(response, operation);
  if (!response.ok || (payload.status?.code !== undefined && payload.status.code >= 400)) {
    throw new Error(`Zoho Mail rechazó la solicitud (HTTP ${response.status}).`);
  }
  return payload;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function containsSenderAddress(value: unknown): boolean {
  if (typeof value === "string") return value.toLowerCase() === SENDER_ADDRESS.toLowerCase();
  if (Array.isArray(value)) return value.some(containsSenderAddress);
  if (!isRecord(value)) return false;

  return Object.entries(value).some(
    ([key, entry]) => /email|alias|address/i.test(key) && containsSenderAddress(entry),
  );
}

function findSenderAccountId(value: unknown): string | null {
  if (Array.isArray(value)) {
    for (const entry of value) {
      const accountId = findSenderAccountId(entry);
      if (accountId) return accountId;
    }
    return null;
  }
  if (!isRecord(value)) return null;

  const accountId = Object.entries(value).find(([key]) => /^accountid$/i.test(key))?.[1];
  if (accountId !== undefined && containsSenderAddress(value)) return String(accountId);

  for (const entry of Object.values(value)) {
    const nestedId = findSenderAccountId(entry);
    if (nestedId) return nestedId;
  }
  return null;
}

async function getSenderAccountId(
  accessToken: string,
  mailBaseUrl: string,
  configuredAccountId?: string,
) {
  if (configuredAccountId) return configuredAccountId;
  const response = await fetch(`${mailBaseUrl}/api/accounts`, {
    headers: { Authorization: `Zoho-oauthtoken ${accessToken}` },
  });
  const payload = await parseZohoResponse(response, "La consulta de cuentas de Zoho");
  const accountId = findSenderAccountId(payload.data);
  if (!accountId) {
    throw new Error(
      "Zoho no encontró la cuenta remitente gabriel.fuentes@landingfuentes.online. Revisa que pertenezca a la cuenta autorizada.",
    );
  }
  return accountId;
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
  const accountId = await getSenderAccountId(token, mailBaseUrl, secrets.ZOHO_ACCOUNT_ID);
  const accountBaseUrl = `${mailBaseUrl}/api/accounts/${encodeURIComponent(accountId)}`;
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
  const attachment = getAttachmentDetails(
    await parseZohoResponse(uploadResponse, "La carga del QR a Zoho"),
  );

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
  await parseZohoResponse(sendResponse, "El envío del correo por Zoho");
}
