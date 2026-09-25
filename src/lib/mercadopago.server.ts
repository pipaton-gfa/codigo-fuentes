import { createServerFn } from "@tanstack/react-start";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { getTokenValue, products } from "./products";

type CheckoutInput = {
  lines: Array<{ id: string; quantity: number }>;
  customer: {
    fullName: string;
    email: string;
  };
  returnUrl: string;
};

type CheckoutResult = {
  preferenceId: string;
  checkoutUrl: string;
};

export const createMercadoPagoPreference = createServerFn({ method: "POST" }).handler(
  async ({ data }: { data: CheckoutInput }): Promise<CheckoutResult> => {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      throw new Error("MERCADOPAGO_ACCESS_TOKEN no está configurado.");
    }

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

    const client = new MercadoPagoConfig({ accessToken });
    const preference = new Preference(client);
    const returnUrl = new URL(data.returnUrl);
    const hasSecureReturnUrl = returnUrl.protocol === "https:";
    const preferenceBody = {
      items: validLines.map(({ product, quantity }) => ({
        id: product.id,
        title: `${product.name} - token${quantity === 1 ? "" : "s"}`,
        quantity,
        unit_price: getTokenValue(product),
        currency_id: "CLP",
      })),
      payer: {
        name: data.customer.fullName,
        email: data.customer.email,
      },
      ...(hasSecureReturnUrl
        ? {
            back_urls: {
              success: data.returnUrl,
              pending: data.returnUrl,
              failure: data.returnUrl,
            },
            auto_return: "approved",
          }
        : {}),
      external_reference: `tokens-${Date.now()}`,
    };

    let response;
    try {
      response = await preference.create({
        body: preferenceBody,
      });
    } catch {
      throw new Error(
        "Mercado Pago rechazó las credenciales. Revisa el access token configurado en .env.",
      );
    }

    const checkoutUrl = response.init_point ?? response.sandbox_init_point;
    if (!response.id || !checkoutUrl) {
      throw new Error("Mercado Pago no devolvió una URL de checkout.");
    }

    return { preferenceId: response.id, checkoutUrl };
  },
);
