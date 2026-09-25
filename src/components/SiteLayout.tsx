// -------------------------------------------------------------------
// IMPORTACIONES
// -------------------------------------------------------------------
// Enrutador para navegar entre páginas sin recargar la web
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";

// -------------------------------------------------------------------
// COMPONENTE PRINCIPAL (Layout Global de la Tienda)
// Recibe "children", que es el contenido específico de cada página que visite el usuario.
// -------------------------------------------------------------------
export function SiteLayout({ children }: { children: ReactNode }) {
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

      <SiteHeader showCart />

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