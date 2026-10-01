import { createServerFn } from "@tanstack/react-start";
import { getRuntimeEnvironment } from "./database.server";
import { getTokenValue, products } from "./products";

type CheckoutInput = {
  lines: Array<{ id: string; quantity: number }>;
  customer: {
    fullName: string;
    rut: string;
    email: string;
  };
  returnUrl: string;
};

type CheckoutResult = {
  preferenceId: string;
  checkoutUrl: string;
  transactionNumber: string;
  createdAt: string;
  deliveryAt: string;
};

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

export const createMercadoPagoPreference = createServerFn({ method: "POST" })
  .inputValidator((data: CheckoutInput) => data)
  .handler(
  async ({ data }: { data: CheckoutInput }): Promise<CheckoutResult> => {
    const validLines = data.lines
      .map((line) => {
        const product = products.find((item) => item.id === line.id);
        const quantity = Math.floor(line.quantity);
        return product && quantity > 0 ? { product, quantity } : null;
      })
      .filter((line): line is NonNullable<typeof line> => line !== null);

    if (validLines.length === 0) {
      throw new Error("No hay productos válidos para pagar.");
    }

    const invoiceLines = validLines.map(({ product, quantity }) => ({
      id: product.id,
      name: product.name,
      price: getTokenValue(product),
      quantity,
    }));
    const environment = getPaymentApiEnvironment();
    let response: Response;
    try {
      response = await fetch(`${environment.PAYMENT_API_URL.replace(/\/$/, "")}/v1/checkout/preferences`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${environment.PAYMENT_API_TOKEN}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          eventId: 3,
          lines: invoiceLines,
          customer: {
            fullName: data.customer.fullName.trim(),
            rut: data.customer.rut.trim(),
            email: data.customer.email.trim(),
          },
          returnUrls: {
            success: data.returnUrl,
            pending: data.returnUrl,
            failure: data.returnUrl,
          },
        }),
      });
    } catch (error) {
      console.error("Payment API request failed", error);
      throw new Error("No se pudo conectar con la API de pagos.");
    }

    const result = (await response.json()) as {
      ok?: boolean;
      error?: string;
      preferenceId?: string;
      checkoutUrl?: string;
      transactionNumber?: string;
      createdAt?: string;
      deliveryAt?: string;
    };
    if (!response.ok || !result.ok) {
      const messages: Record<string, string> = {
        invalid_return_url: "La URL de retorno debe ser HTTPS y estar permitida por la API de pagos.",
        payment_provider_not_configured: "Mercado Pago no está configurado en la API de pagos.",
        payment_preference_failed: "Mercado Pago no pudo crear el checkout.",
      };
      throw new Error(messages[result.error ?? ""] ?? "No se pudo iniciar el pago.");
    }

    if (!result.preferenceId || !result.checkoutUrl || !result.transactionNumber || !result.createdAt || !result.deliveryAt) {
      throw new Error("La API de pagos devolvió una respuesta incompleta.");
    }

    return {
      preferenceId: result.preferenceId,
      checkoutUrl: result.checkoutUrl,
      transactionNumber: result.transactionNumber,
      createdAt: result.createdAt,
      deliveryAt: result.deliveryAt,
    };
  },
);
