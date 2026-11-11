import { miniaturaDe, type Foto, type Producto } from "@/lib/datos";
import { IconoCategoria } from "./IconoCategoria";

type Visual = Pick<Producto, "colores" | "forma" | "categoria"> & { foto?: string; fotos?: Foto[] };

// Foto del producto. Si el creador aún no sube fotos, se muestra un fondo de color con el ícono de la categoría.
const proporcion = {
  alta: "aspect-[3/4]",
  media: "aspect-[4/5]",
  cuadrada: "aspect-square",
} as const;

export function FotoProducto({
  producto,
  uniforme = false,
  grande = false,
  className = "",
}: {
  producto: Visual;
  uniforme?: boolean; // true = todas cuadradas (filas); false = alturas variadas (mosaico)
  grande?: boolean; // true = usar la foto en tamaño grande (página del producto)
  className?: string;
}) {
  const [a, b] = producto.colores;
  const forma = uniforme ? "aspect-square" : proporcion[producto.forma];
  const src = grande ? (producto.fotos?.[0]?.url ?? miniaturaDe(producto)) : miniaturaDe(producto);

  if (src) {
    return (
      <div className={`relative overflow-hidden bg-arena ${forma} ${className}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- las fotos ya se reducen al subirlas (dos tamaños) */}
        <img src={src} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden ${forma} ${className}`}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
    >
      <div className="patron-picado absolute inset-0" />
      <IconoCategoria slug={producto.categoria} className="relative size-14 text-white/85" strokeWidth={1.25} />
    </div>
  );
}
