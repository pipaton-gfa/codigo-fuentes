// -------------------------------------------------------------------
// IMPORTACIONES
// -------------------------------------------------------------------
import * as React from "react";

// Ancho máximo en píxeles para considerar que la pantalla es un dispositivo móvil (768px)
const MOBILE_BREAKPOINT = 768;

// -------------------------------------------------------------------
// HOOK PERSONALIZADO: useIsMobile
// Devuelve "true" si la pantalla es de teléfono y "false" si es de escritorio.[cite: 51]
// -------------------------------------------------------------------
export function useIsMobile() {
  // Estado local para guardar si es móvil o no (inicia en undefined para evitar errores de renderizado)[cite: 51]
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    // Escuchador de medios del navegador para el límite de 767px[cite: 51]
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    
    // Función que revisa el ancho real de la ventana y actualiza el estado[cite: 51]
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    // Escucha activamente si el usuario cambia el tamaño de la ventana o rota la pantalla[cite: 51]
    mql.addEventListener("change", onChange);
    
    // Verificación inicial al cargar la página[cite: 51]
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    // Limpieza del evento cuando el componente se desmonta[cite: 51]
    return () => mql.removeEventListener("change", onChange);
  }, []);

  // Convierte el valor a un booleano estricto (true/false)[cite: 51]
  return !!isMobile;
}