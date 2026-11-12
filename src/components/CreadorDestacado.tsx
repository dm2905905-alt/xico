import Link from "next/link";
import { Award, BadgeCheck, MapPin, Package, Star } from "lucide-react";
import { estadoPorSlug, type Creador, type Producto } from "@/lib/datos";
import { precio } from "@/lib/formato";
import { FotoProducto } from "./FotoProducto";

// Tarjeta grande del "Creador destacado": foto, números y algunas de sus piezas
export function CreadorDestacado({ creador, piezas, productos }: { creador: Creador; piezas: number; productos: Producto[] }) {
  const [a, b] = creador.colores;
  const estado = estadoPorSlug(creador.estado);
  const muestra = [...productos].sort((x, y) => y.vendidos - x.vendidos).slice(0, 4);

  return (
    <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-arena-oscura/60">
      <div className="patron-picado relative h-24 sm:h-32" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
        <span className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-terracota">
          <Award className="size-4" /> Creador destacado
        </span>
      </div>
      <div className="grid gap-4 px-5 pb-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] md:items-end">
        <div className="-mt-10">
          <span className="grid size-20 place-items-center overflow-hidden rounded-full border-4 border-white bg-tinta font-display text-2xl font-bold text-crema">
            {creador.foto ? (
              // eslint-disable-next-line @next/next/no-img-element -- miniatura ya reducida al subirla
              <img src={creador.foto.mini} alt="" className="size-full object-cover" />
            ) : (
              creador.taller.slice(0, 1).toUpperCase()
            )}
          </span>
          <h3 className="mt-2 flex items-center gap-1 font-display text-2xl font-extrabold">
            {creador.taller}
            {creador.verificado && <BadgeCheck className="size-5 text-jade" aria-label="Verificado" />}
          </h3>
          <p className="text-sm text-cafe">{creador.especialidad}</p>
          <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {estado && (
              <span className="flex items-center gap-1 text-cafe">
                <MapPin className="size-4" /> {estado.nombre}
              </span>
            )}
            {creador.resenas > 0 && (
              <span className="flex items-center gap-1">
                <Star className="size-4 fill-maiz text-maiz" /> <strong>{creador.calificacion.toFixed(1)}</strong>
                <span className="text-cafe">({creador.resenas})</span>
              </span>
            )}
            {piezas > 0 && (
              <span className="flex items-center gap-1 text-cafe">
                <Package className="size-4" /> {piezas} vendidas
              </span>
            )}
          </p>
          {creador.historia && <p className="mt-2 line-clamp-3 text-sm">{creador.historia}</p>}
          <Link href={`/creador/${creador.slug}`} className="mt-3 inline-block rounded-full bg-terracota px-5 py-2 text-sm font-semibold text-crema">
            Ver su tienda
          </Link>
        </div>
        {muestra.length > 0 && (
          <ul className="grid grid-cols-4 gap-2">
            {muestra.map((p) => (
              <li key={p.slug}>
                <Link href={`/producto/${p.slug}`} className="block overflow-hidden rounded-2xl ring-1 ring-arena-oscura/50">
                  <FotoProducto producto={p} uniforme />
                </Link>
                <p className="mt-1 truncate text-xs font-semibold">{precio(p.precio)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
