// -------------------------------------------------------------------
// IMPORTACIONES
// -------------------------------------------------------------------
import * as React from "react";
// Importamos la lógica base del acordeón desde Radix (maneja clics, animaciones y accesibilidad)
import * as AccordionPrimitive from "@radix-ui/react-accordion";
// Importamos el ícono de la flecha hacia abajo que acompaña al título
import { ChevronDown } from "lucide-react";

// Utilidad local para mezclar clases de Tailwind CSS sin conflictos
import { cn } from "@/lib/utils";


// -------------------------------------------------------------------
// 1. COMPONENTE PRINCIPAL (Contenedor)
// Este es el "envoltorio" invisible que agrupa todo el acordeón.
// -------------------------------------------------------------------
const Accordion = AccordionPrimitive.Root;


// -------------------------------------------------------------------
// 2. ÍTEM DEL ACORDEÓN (AccordionItem)
// Es cada "fila" individual que contiene un título y su contenido oculto.
// -------------------------------------------------------------------
const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item 
    ref={ref} 
    // "border-b" le pone una línea divisoria sutil debajo de cada ítem
    className={cn("border-b", className)} 
    {...props} 
  />
));
AccordionItem.displayName = "AccordionItem";


// -------------------------------------------------------------------
// 3. BOTÓN ACTIVADOR (AccordionTrigger)
// Es el título en el que el usuario hace clic para abrir o cerrar el ítem.
// -------------------------------------------------------------------
const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      // Clases que le dan estilo de botón, centran el ícono y hacen que el ícono 
      // rote 180 grados ([&[data-state=open]>svg]:rotate-180) cuando está abierto
      className={cn(
        "flex flex-1 items-center justify-between py-4 text-sm font-medium cursor-pointer transition-all hover:underline text-left [&[data-state=open]>svg]:rotate-180",
        className,
      )}
      {...props}
    >
      {/* Aquí va el texto del título que le pasemos al usar el componente */}
      {children}
      {/* El ícono de la flecha de Lucide Icons */}
      <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
));
AccordionTrigger.displayName = AccordionPrimitive.Trigger.displayName;


// -------------------------------------------------------------------
// 4. CONTENIDO DESPLEGABLE (AccordionContent)
// Es la caja oculta que aparece deslizándose hacia abajo al abrir el ítem.
// -------------------------------------------------------------------
const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    // Clases para manejar la animación de apertura y cierre (animate-accordion-down/up)
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    {/* Contenedor interno que le da el espacio (padding) al texto */}
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitive.Content>
));
AccordionContent.displayName = AccordionPrimitive.Content.displayName;

// -------------------------------------------------------------------
// EXPORTACIÓN
// Exportamos las 4 piezas juntas para usarlas como un set de Lego en la tienda
// -------------------------------------------------------------------
export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };