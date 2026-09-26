import { createServerFn } from "@tanstack/react-start";
import { MercadoPagoConfig, Preference } from "mercadopago";
import { getDatabase } from "./database.server";
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

    const createdAt = new Date();
    const deliveryAt = new Date(createdAt.getTime() + 60 * 60 * 1000);
    const randomPart = crypto.getRandomValues(new Uint32Array(1))[0].toString().padStart(10, "0");
    const transactionNumber = `LF-${createdAt.getFullYear()}-${createdAt.getTime()}-${randomPart}`;
    const invoiceLines = validLines.map(({ product, quantity }) => ({
      id: product.id,
      name: product.name,
      price: getTokenValue(product),
      quantity,
    }));
    const total = invoiceLines.reduce((sum, line) => sum + line.price * line.quantity, 0);
    const invoiceData = {
      reference: transactionNumber,
      createdAt: createdAt.toISOString(),
      deliveryAt: deliveryAt.toISOString(),
      method: "Mercado Pago",
      lines: invoiceLines,
      total,
      itemCount: invoiceLines.reduce((sum, line) => sum + line.quantity, 0),
      customer: {
        fullName: data.customer.fullName,
        rut: data.customer.rut,
        email: data.customer.email,
      },
    };

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
      external_reference: transactionNumber,
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

    await getDatabase()
      .prepare(
        "INSERT INTO event_purchases (event_id, transaction_number, payment_preference_id, customer_name, customer_rut, customer_email, invoice_data, total_clp, payment_method, status) VALUES (3, ?1, ?2, ?3, ?4, ?5, ?6, ?7, 'Mercado Pago', 'iniciada')",
      )
      .bind(
        transactionNumber,
        response.id,
        data.customer.fullName,
        data.customer.rut,
        data.customer.email,
        JSON.stringify(invoiceData),
        total,
      )
      .run();

    return {
      preferenceId: response.id,
      checkoutUrl,
      transactionNumber,
      createdAt: invoiceData.createdAt,
      deliveryAt: invoiceData.deliveryAt,
    };
  },
);
