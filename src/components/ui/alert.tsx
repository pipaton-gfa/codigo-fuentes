// -------------------------------------------------------------------
// IMPORTACIONES
// -------------------------------------------------------------------
import * as React from "react";
// cva (class-variance-authority) sirve para crear variaciones de diseño fácilmente (ej. alerta normal vs alerta de error)[cite: 2]
import { cva, type VariantProps } from "class-variance-authority";

// Utilidad local para mezclar clases de Tailwind CSS sin conflictos[cite: 2]
import { cn } from "@/lib/utils";

// -------------------------------------------------------------------
// CONFIGURACIÓN DE VARIANTES (Estilos base y versiones visuales)
// -------------------------------------------------------------------
const alertVariants = cva(
  // Estilo base que tendrán todas las alertas (caja con bordes, padding, manejo de posición si lleva íconos)[cite: 2]
  "relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
  {
    variants: {
      variant: {
        // Variante por defecto: colores normales usando el tema actual[cite: 2]
        default: "bg-background text-foreground",
        // Variante "destructive" (para errores): bordes y textos rojos[cite: 2]
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      },
    },
    defaultVariants: {
      // Si no le decimos qué variante usar en el código, usará la "default"[cite: 2]
      variant: "default",
    },
  },
);

// -------------------------------------------------------------------
// 1. COMPONENTE PRINCIPAL (Contenedor de la Alerta)
// -------------------------------------------------------------------
const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  // Asigna el role="alert" para accesibilidad (lectores de pantalla) y aplica las clases calculadas[cite: 2]
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

// -------------------------------------------------------------------
// 2. TÍTULO DE LA ALERTA (AlertTitle)
// -------------------------------------------------------------------
const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    // Se renderiza como un encabezado pequeño (<h5>) con texto más grueso[cite: 2]
    <h5
      ref={ref}
      className={cn("mb-1 font-medium leading-none tracking-tight", className)}
      {...props}
    />
  ),
);
AlertTitle.displayName = "AlertTitle";

// -------------------------------------------------------------------
// 3. DESCRIPCIÓN DE LA ALERTA (AlertDescription)
// -------------------------------------------------------------------
const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  // Contenedor para el texto de la alerta, asegurando un espaciado de línea relajado[cite: 2]
  <div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props} />
));
AlertDescription.displayName = "AlertDescription";

// -------------------------------------------------------------------
// EXPORTACIÓN
// Exportamos las 3 piezas para armar las alertas donde las necesitemos[cite: 2]
// -------------------------------------------------------------------
export { Alert, AlertTitle, AlertDescription };
