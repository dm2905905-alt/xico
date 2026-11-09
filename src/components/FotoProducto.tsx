import type { Producto } from "@/lib/datos";
import { IconoCategoria } from "./IconoCategoria";

type Visual = Pick<Producto, "colores" | "forma" | "categoria">;

// Espacio para la foto del producto.
// Mientras no haya fotos reales (las suben los creadores en la Fase 5),
// se muestra un fondo de color con el ícono de la categoría.
const proporcion = {
  alta: "aspect-[3/4]",
  media: "aspect-[4/5]",
  cuadrada: "aspect-square",
} as const;

export function FotoProducto({
  producto,
  uniforme = false,
  className = "",
}: {
  producto: Visual;
  uniforme?: boolean; // true = todas cuadradas (filas); false = alturas variadas (mosaico)
  className?: string;
}) {
  const [a, b] = producto.colores;
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${uniforme ? "aspect-square" : proporcion[producto.forma]} ${className}`}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
    >
      <div className="patron-picado absolute inset-0" />
      <IconoCategoria slug={producto.categoria} className="relative size-14 text-white/85" strokeWidth={1.25} />
    </div>
  );
}
