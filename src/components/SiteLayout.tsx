// -------------------------------------------------------------------
// IMPORTACIONES
// -------------------------------------------------------------------
// Enrutador para navegar entre páginas sin recargar la web
import { Link } from "@tanstack/react-router";
// Ícono de la bolsa/carrito de compras
import { ShoppingCart } from "lucide-react";
import type { ReactNode } from "react";
// Hook personalizado donde vive la memoria del carrito (clave para el número de la burbuja)
import { useCart } from "@/lib/cart";

// -------------------------------------------------------------------
// COMPONENTE PRINCIPAL (Layout Global de la Tienda)
// Recibe "children", que es el contenido específico de cada página que visite el usuario.
// -------------------------------------------------------------------
export function SiteLayout({ children }: { children: ReactNode }) {
  // Extraemos la cantidad total de productos actualmente en el carrito[cite: 50]
  const { count } = useCart();

  return (
    <div className="relative min-h-screen overflow-x-clip bg-ink font-body text-white">
      {/* 
        EFECTOS VISUALES DE FONDO 
        Crea los globos de luz neón difuminados con animación animada
      */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 size-[320px] sm:size-[520px] rounded-full bg-brand/40 blur-[120px] animate-drift" />
        <div className="absolute top-1/3 right-[-140px] size-[260px] sm:size-[460px] rounded-full bg-accent-cyan/30 blur-[120px] animate-drift2" />
        <div className="absolute bottom-[-160px] left-1/3 size-[260px] sm:size-[420px] rounded-full bg-fuchsia-500/25 blur-[120px] animate-drift" />
      </div>

      {/* 
        ENCABEZADO / NAVBAR SUPERIOR (Fijo en la pantalla)
      */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-ink/60 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          
          {/* Logo principal: al hacer clic nos lleva al Inicio ("/") */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3">
            <img 
              src="/total-market-banner.png" 
              alt="Total Market" 
              className="h-20 w-auto object-contain sm:h-22" 
            />
          </Link>

          {/* Botón del Carrito: nos lleva a "/carrito" */}
          <Link
            to="/carrito"
            aria-label="Ver carrito"
            className="relative grid place-items-center size-10 rounded-xl border border-white/15 bg-white/10 transition hover:bg-white/20"
          >
            <ShoppingCart className="size-5" strokeWidth={1.75} />
            
            {/* Burbuja roja/cyan con el número de ítems (solo se muestra si hay más de 0) */}
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid min-w-5 place-items-center rounded-full bg-accent-cyan px-1 text-[10px] font-bold text-ink sm:text-[11px]">
                {count}
              </span>
            )}
          </Link>

        </div>
      </header>

      {/* 
        CONTENIDO PRINCIPAL
        Aquí es donde se renderizará el catálogo, el detalle o la pantalla de pagos
      */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 pb-20 pt-4 sm:px-6 sm:pb-24 sm:pt-6">
        {children}
      </main>
    </div>
  );
}