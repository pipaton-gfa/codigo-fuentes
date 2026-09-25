// -------------------------------------------------------------------
// IMPORTACIONES
// -------------------------------------------------------------------
import * as React from "react";
// Importamos la lógica base desde Radix UI, que se encarga de la accesibilidad y el manejo del foco[cite: 3]
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

// Utilidad local para unir clases de Tailwind[cite: 3]
import { cn } from "@/lib/utils";
// Importamos los estilos de los botones para usarlos en los botones de "Aceptar" y "Cancelar" del modal[cite: 3]
import { buttonVariants } from "@/components/ui/button";

// -------------------------------------------------------------------
// 1. COMPONENTES BASE (Contenedor, Disparador y Portal)
// -------------------------------------------------------------------
// El envoltorio principal de todo el modal[cite: 3]
const AlertDialog = AlertDialogPrimitive.Root;

// El botón o elemento en el que el usuario hace clic para abrir el modal[cite: 3]
const AlertDialogTrigger = AlertDialogPrimitive.Trigger;

// El Portal asegura que el modal se dibuje por encima de todo el resto de la página[cite: 3]
const AlertDialogPortal = AlertDialogPrimitive.Portal;

// -------------------------------------------------------------------
// 2. FONDO OSCURO (Overlay)
// La capa negra semi-transparente que difumina el fondo de la página[cite: 3]
// -------------------------------------------------------------------
const AlertDialogOverlay = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
    ref={ref}
  />
));
AlertDialogOverlay.displayName = AlertDialogPrimitive.Overlay.displayName;

// -------------------------------------------------------------------
// 3. CONTENEDOR DEL MENSAJE (Content)
// La caja blanca (o negra en modo oscuro) que aparece al centro de la pantalla[cite: 3]
// -------------------------------------------------------------------
const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPortal>
    <AlertDialogOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      // Clases para centrar el cuadro perfectamente (left-50%, top-50%, translate), darle animaciones de zoom, bordes y sombras[cite: 3]
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className,
      )}
      {...props}
    />
  </AlertDialogPortal>
));
AlertDialogContent.displayName = AlertDialogPrimitive.Content.displayName;

// -------------------------------------------------------------------
// 4. CABECERA (Header)
// Agrupa el título y la descripción del modal, centrando el texto en celulares y alineándolo a la izquierda en pantallas grandes[cite: 3]
// -------------------------------------------------------------------
const AlertDialogHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

// -------------------------------------------------------------------
// 5. PIE (Footer)
// Agrupa los botones de acción en la parte inferior. En celulares se apilan, en pantallas grandes se alinean a la derecha[cite: 3]
// -------------------------------------------------------------------
const AlertDialogFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

// -------------------------------------------------------------------
// 6. TEXTOS (Title y Description)
// -------------------------------------------------------------------
const AlertDialogTitle = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  // El título principal del modal (texto grande y en negrita)[cite: 3]
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = AlertDialogPrimitive.Title.displayName;

const AlertDialogDescription = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  // El texto secundario que explica qué sucede (texto más pequeño y de color tenue)[cite: 3]
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = AlertDialogPrimitive.Description.displayName;

// -------------------------------------------------------------------
// 7. BOTONES (Action y Cancel)
// -------------------------------------------------------------------
const AlertDialogAction = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Action>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>
>(({ className, ...props }, ref) => (
  // Botón principal (Ej: "Sí, borrar"). Usa el estilo de botón por defecto[cite: 3]
  <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants(), className)} {...props} />
));
AlertDialogAction.displayName = AlertDialogPrimitive.Action.displayName;

const AlertDialogCancel = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Cancel>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>
>(({ className, ...props }, ref) => (
  // Botón para cancelar (Ej: "No, volver"). Usa el estilo "outline" (con borde) para distinguirlo del principal[cite: 3]
  <AlertDialogPrimitive.Cancel
    ref={ref}
    className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
    {...props}
  />
));
AlertDialogCancel.displayName = AlertDialogPrimitive.Cancel.displayName;

// -------------------------------------------------------------------
// EXPORTACIÓN
// Exportamos todas las partes individuales para que puedas armar tu propio modal en cualquier pantalla[cite: 3]
// -------------------------------------------------------------------
export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};