import Link from "next/link";
import { BadgeCheck, MapPin, Star } from "lucide-react";
import { estadoPorSlug, type Creador } from "@/lib/datos";

export function TarjetaCreador({ creador }: { creador: Creador }) {
  const estado = estadoPorSlug(creador.estado);
  const [a, b] = creador.colores;
  const iniciales = creador.nombre
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");

  return (
    <Link
      href={`/creador/${creador.slug}`}
      className="group flex w-72 shrink-0 flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-arena-oscura/50 transition hover:shadow-md sm:w-auto"
    >
      {/* Portada del taller */}
      <div className="patron-picado h-24" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} />
      <div className="-mt-9 flex flex-1 flex-col px-4 pb-4">
        <span className="grid size-16 place-items-center overflow-hidden rounded-full border-4 border-white bg-tinta font-display text-xl font-bold text-crema">
          {creador.foto ? (
            // eslint-disable-next-line @next/next/no-img-element -- miniatura ya reducida al subirla
            <img src={creador.foto.mini} alt={`Foto de ${creador.taller}`} className="size-full object-cover" />
          ) : (
            iniciales
          )}
        </span>
        <h3 className="mt-2 flex items-center gap-1 font-display text-lg font-semibold">
          {creador.taller}
          {creador.verificado && <BadgeCheck className="size-4.5 text-jade" aria-label="Artista verificado" />}
        </h3>
        <p className="text-sm text-cafe">{creador.especialidad}</p>
        <p className="mt-2 line-clamp-2 text-sm text-tinta/80">{creador.historia}</p>
        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-cafe">
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" /> {creador.ciudad}, {estado?.nombre}
          </span>
          <span className="flex items-center gap-0.5">
            <Star className="size-3.5 fill-maiz text-maiz" /> {creador.calificacion} ({creador.resenas})
          </span>
        </div>
        {creador.top && (
          <span className="mt-3 self-start rounded-full bg-maiz/20 px-2.5 py-0.5 text-xs font-semibold text-terracota-oscura">
            ⭐ Top vendedor
          </span>
        )}
      </div>
    </Link>
  );
}
