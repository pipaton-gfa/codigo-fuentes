// -------------------------------------------------------------------
// IMPORTACIONES
// -------------------------------------------------------------------
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getTokenValue, products, type Product } from "./products";

// -------------------------------------------------------------------
// TIPOS DE DATOS (TypeScript)
// -------------------------------------------------------------------

// Una línea individual del carrito (ID del producto y su cantidad)
export type CartLine = { id: string; quantity: number };

// Datos del comprador[cite: 63]
export type CustomerData = {
  fullName: string;
  rut: string;
  email: string;
};

// Estructura de una orden de compra o factura final[cite: 63]
export type Order = {
  reference: string;
  ticketCode: string;
  ticketUsed: boolean;
  method: string;
  createdAt: string;
  deliveryAt: string;
  lines: { id: string; name: string; price: number; quantity: number }[];
  total: number;
  itemCount: number;
  customer: CustomerData;
};

// Funciones y variables que el carrito comparte con toda la app[cite: 63]
type CartContextValue = {
  lines: CartLine[];
  count: number;
  total: number;
  items: { product: Product; quantity: number }[];
  add: (id: string, quantity?: number) => void;
  setQuantity: (id: string, quantity: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  order: Order | null;
  checkout: (method: string, customer?: CustomerData) => Order | null;
};

// Creación del Contexto[cite: 63]
const CartContext = createContext<CartContextValue | null>(null);

// Llaves de almacenamiento en el navegador (localStorage)[cite: 63]
const CART_KEY = "viamarket.cart";
const ORDER_KEY = "viamarket.order";

// -------------------------------------------------------------------
// COMPONENTE PROVEEDOR (CartProvider)
// Contiene toda la memoria y lógica del carrito[cite: 63]
// -------------------------------------------------------------------
export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [order, setOrder] = useState<Order | null>(null);

  // 1. Cargar datos guardados del localStorage al iniciar la página[cite: 63]
  useEffect(() => {
    try {
      const rawCart = localStorage.getItem(CART_KEY);
      if (rawCart) setLines(JSON.parse(rawCart) as CartLine[]);

      const rawOrder = localStorage.getItem(ORDER_KEY);
      if (rawOrder) {
        const storedOrder = JSON.parse(rawOrder) as Order;
        const itemCount = storedOrder.lines.reduce(
          (sum, line) => sum + line.quantity,
          0,
        );
        setOrder({
          ...storedOrder,
          ticketCode: storedOrder.ticketCode ?? storedOrder.reference,
          ticketUsed: storedOrder.ticketUsed ?? false,
          lines: storedOrder.lines.map((line) => ({
            ...line,
            price: getTokenValue(line),
          })),
          itemCount,
          total: storedOrder.lines.reduce(
            (sum, line) => sum + getTokenValue(line) * line.quantity,
            0,
          ),
        });
      }
    } catch {
      /* Ignorar errores de almacenamiento corrupto */
    }
  }, []);

  // 2. Guardar automáticamente el carrito cada vez que cambia un producto[cite: 63]
  useEffect(() => {
    try {
      localStorage.setItem(CART_KEY, JSON.stringify(lines));
    } catch {
      /* Ignorar */
    }
  }, [lines]);

  // 3. Cálculo de totales y funciones principales del carrito[cite: 63]
  const value = useMemo<CartContextValue>(() => {
    // Relaciona las líneas del carrito con los productos reales del catálogo[cite: 63]
    const items = lines
      .map((line) => {
        const product = products.find((p) => p.id === line.id);
        return product ? { product, quantity: line.quantity } : null;
      })
      .filter((x): x is { product: Product; quantity: number } => x !== null);

    // Suma la cantidad total de ítems[cite: 63]
    const count = items.reduce((sum, i) => sum + i.quantity, 0);

    // Calcula el precio total del carrito[cite: 63]
    const total = items.reduce(
      (sum, item) => sum + getTokenValue(item.product) * item.quantity,
      0,
    );

    return {
      lines,
      items,
      count,
      total,

      // Agregar un producto al carrito[cite: 63]
      add: (id, quantity = 1) =>
        setLines((prev) => {
          const existing = prev.find((l) => l.id === id);
          if (existing) {
            return prev.map((l) => (l.id === id ? { ...l, quantity: l.quantity + quantity } : l));
          }
          return [...prev, { id, quantity }];
        }),

      // Cambiar manualmente la cantidad de un producto[cite: 63]
      setQuantity: (id, quantity) =>
        setLines((prev) =>
          quantity <= 0
            ? prev.filter((l) => l.id !== id)
            : prev.map((l) => (l.id === id ? { ...l, quantity } : l)),
        ),

      // Eliminar un producto[cite: 63]
      remove: (id) => setLines((prev) => prev.filter((l) => l.id !== id)),

      // Vaciar todo el carrito[cite: 63]
      clear: () => setLines([]),

      order,

      // Finalizar la compra (Generar la Orden/Factura)[cite: 63]
      checkout: (method, customer) => {
        if (items.length === 0 || total <= 0) {
          return null;
        }

        const buyer: CustomerData = customer ?? {
          fullName: "",
          rut: "",
          email: "",
        };

        const now = new Date();
        const delivery = new Date(now.getTime() + 60 * 60 * 1000); // Estimación de entrega a 1 hora[cite: 63]

        const newOrder: Order = {
          reference: `VM-${now.getFullYear()}-${String(now.getTime()).slice(-6)}`,
          ticketCode: crypto.randomUUID(), // Genera el código único para el QR[cite: 63]
          ticketUsed: false,
          method,
          createdAt: now.toISOString(),
          deliveryAt: delivery.toISOString(),
          lines: items.map((i) => ({
            id: i.product.id,
            name: i.product.name,
            price: getTokenValue(i.product),
            quantity: i.quantity,
          })),
          total,
          itemCount: count,
          customer: buyer,
        };

        setOrder(newOrder);

        try {
          localStorage.setItem(ORDER_KEY, JSON.stringify(newOrder));
          localStorage.removeItem("viamarket.pendingMethod");
        } catch {
          /* Ignorar */
        }

        setLines([]); // Vacía el carrito tras confirmar la orden[cite: 63]
        return newOrder;
      },
    };
  }, [lines, order]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// -------------------------------------------------------------------
// HOOK PERSONALIZADO: useCart
// Se usa en cualquier componente para acceder a los datos del carrito[cite: 63]
// -------------------------------------------------------------------
export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider");
  return ctx;
}