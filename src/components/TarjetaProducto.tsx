import Link from "next/link";
import { Star } from "lucide-react";
import { aTarjeta, estadoPorSlug, type ProductoTarjeta } from "@/lib/datos";
import { descuento, precio } from "@/lib/formato";
import { BotonFavorito } from "./BotonFavorito";
import { FotoProducto } from "./FotoProducto";

export function TarjetaProducto({ producto, mosaico = false }: { producto: ProductoTarjeta; mosaico?: boolean }) {
  const estado = estadoPorSlug(producto.estado);
  const off = descuento(producto.precio, producto.precioAntes);

  return (
    <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-arena-oscura/50 transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/producto/${producto.slug}`} className="block">
        <div className="relative overflow-hidden">
          <FotoProducto producto={producto} uniforme={!mosaico} className="transition duration-300 group-hover:scale-[1.03]" />
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            {producto.vendido ? (
              <span className="rounded-full bg-tinta px-2.5 py-0.5 text-xs font-bold text-white">Vendido</span>
            ) : (
              <>
                {off > 0 && <span className="rounded-full bg-rosa px-2 py-0.5 text-xs font-bold text-white">-{off}%</span>}
                {producto.nuevo && <span className="rounded-full bg-maiz px-2 py-0.5 text-xs font-bold text-tinta">Nuevo</span>}
              </>
            )}
          </div>
          {producto.personalizable && (
            <span className="absolute bottom-2.5 left-2.5 rounded-full bg-white/90 px-2 py-0.5 text-xs font-medium text-tinta backdrop-blur">
              ✍️ Personalizable
            </span>
          )}
        </div>

        <div className="p-3">
          <h3 className="line-clamp-2 text-sm leading-snug font-medium text-tinta">{producto.nombre}</h3>
          <p className="mt-1 truncate text-xs text-cafe">
            {producto.taller}
            {estado && <> · {estado.nombre}</>}
          </p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-tinta">{precio(producto.precio)}</span>
              {producto.precioAntes && (
                <span className="text-xs text-cafe/70 line-through">{precio(producto.precioAntes)}</span>
              )}
            </p>
            {/* Sin reseñas todavía no se muestra "0.0" */}
            {producto.calificacion > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-cafe">
                <Star className="size-3.5 fill-maiz text-maiz" />
                {producto.calificacion.toFixed(1)}
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* Fuera del enlace para no anidar un botón dentro de un link */}
      <BotonFavorito producto={aTarjeta(producto)} className="absolute top-2 right-2" />
    </div>
  );
}
