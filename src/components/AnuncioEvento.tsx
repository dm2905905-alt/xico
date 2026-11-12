import Link from "next/link";
import { Heart, PartyPopper, Trophy } from "lucide-react";
import type { Producto } from "@/lib/datos";
import { precio } from "@/lib/formato";
import type { Anuncio, TiendaAnuncio } from "@/lib/servidor/anuncio";
import { FotoProducto } from "./FotoProducto";

const medalla = ["bg-maiz text-tinta", "bg-arena-oscura text-tinta", "bg-terracota/80 text-crema", "bg-arena text-cafe", "bg-arena text-cafe"];

function Avatar({ t, grande = false }: { t: TiendaAnuncio; grande?: boolean }) {
  return (
    <span className="shrink-0 rounded-full p-[2px]" style={{ background: `linear-gradient(135deg, ${t.colores[0]}, ${t.colores[1]})` }}>
      <span className={`grid place-items-center overflow-hidden rounded-full border-2 border-white bg-tinta font-display font-bold text-crema ${grande ? "size-14 text-lg" : "size-9 text-sm"}`}>
        {t.foto ? (
          // eslint-disable-next-line @next/next/no-img-element -- miniatura ya reducida al subirla
          <img src={t.foto} alt="" className="size-full object-cover" />
        ) : (
          t.taller.slice(0, 1).toUpperCase()
        )}
      </span>
    </span>
  );
}

// Anuncio del evento en el inicio: "Apoya a nuestros emprendedores"
export function AnuncioEvento({ anuncio, detalles }: { anuncio: Anuncio; detalles: Producto[] }) {
  const quedan = anuncio.dias <= 1 ? "termina hoy" : `quedan ${anuncio.dias} días`;

  if (anuncio.tipo === "ganadores") {
    return (
      <section className="mx-auto mt-4 max-w-7xl px-4">
        <div className="rounded-3xl bg-white p-5 ring-1 ring-maiz/70">
          <p className="flex items-center gap-2 text-xs font-semibold text-terracota">
            <PartyPopper className="size-4" /> {anuncio.titulo}
          </p>
          <h2 className="mt-1 font-display text-xl font-extrabold sm:text-2xl">¡Felicidades a los ganadores!</h2>
          <p className="text-sm text-cafe">Gracias a cada compra, estos emprendedores se llevaron su premio.</p>
          <ul className="sin-barra mt-3 flex gap-4 overflow-x-auto pb-1">
            {anuncio.ganadores.map((t) => (
              <li key={t.slug}>
                <Link href={`/creador/${t.slug}`} className="flex w-20 flex-col items-center gap-1 text-center">
                  <Avatar t={t} grande />
                  <span className="w-full truncate text-xs font-semibold">{t.taller}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  const esTop = anuncio.tipo === "top";
  return (
    <section className="mx-auto mt-4 max-w-7xl px-4">
      <div className="rounded-3xl bg-white p-5 ring-1 ring-terracota/30">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${esTop ? "bg-rosa/10 text-rosa" : "bg-terracota/10 text-terracota"}`}>
          {anuncio.titulo} · {quedan}
        </span>
        <h2 className="mt-2 flex items-center gap-2 font-display text-xl leading-tight font-extrabold sm:text-2xl">
          <Heart className="size-6 shrink-0 fill-rosa text-rosa" />
          {esTop ? "Apoya a nuestros emprendedores comprando algo pequeño" : "Apoya a nuestros emprendedores"}
        </h2>
        <p className="mt-1 text-sm text-cafe">
          {esTop
            ? "Un detalle hecho a mano cuenta para que tu creador favorito suba en el top."
            : "Cada compra ayuda a un creador mexicano a ganar su premio en XICO."}{" "}
          <span className="text-tinta">Reto: {anuncio.reto}.</span>
        </p>

        {/* Meta: cuántas tiendas ya lo lograron */}
        {!esTop && anuncio.participantes > 0 && (
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-arena">
              <div className="h-full rounded-full bg-terracota" style={{ width: `${Math.min(100, (anuncio.logradas / anuncio.participantes) * 100)}%` }} />
            </div>
            <span className="shrink-0 text-xs text-cafe">
              {anuncio.logradas} de {anuncio.participantes} {anuncio.participantes === 1 ? "tienda" : "tiendas"} ya lo lograron
            </span>
          </div>
        )}

        {/* Top */}
        {anuncio.top.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold">
              <Trophy className="size-4 text-maiz" /> {esTop ? "Top vendedores de hoy" : "Los que más han vendido"}
            </p>
            {esTop ? (
              <ul className="sin-barra flex gap-3 overflow-x-auto pb-1">
                {anuncio.top.map((t, i) => (
                  <li key={t.slug}>
                    <Link href={`/creador/${t.slug}`} className="relative flex w-24 flex-col items-center gap-1 rounded-2xl bg-arena/50 p-3 text-center">
                      <span className={`absolute top-1.5 left-1.5 grid size-6 place-items-center rounded-full text-xs font-extrabold ${medalla[i]}`}>{i + 1}</span>
                      <Avatar t={t} grande />
                      <span className="w-full truncate text-xs font-semibold">{t.taller}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <ol className="grid gap-1.5">
                {anuncio.top.map((t, i) => (
                  <li key={t.slug}>
                    <Link href={`/creador/${t.slug}`} className="flex items-center gap-3 rounded-xl px-1 py-1 hover:bg-arena/50">
                      <span className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-extrabold ${medalla[i]}`}>{i + 1}</span>
                      <Avatar t={t} />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{t.taller}</span>
                      <span className="hidden text-xs text-cafe sm:inline">{t.piezas} {t.piezas === 1 ? "pieza" : "piezas"}</span>
                      {t.logro ? (
                        <span className="rounded-full bg-jade/10 px-2 py-0.5 text-xs font-semibold text-jade">Meta lograda</span>
                      ) : t.cerca ? (
                        <span className="rounded-full bg-terracota/10 px-2 py-0.5 text-xs font-semibold text-terracota">Le falta poco</span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ol>
            )}
          </div>
        )}

        {/* Detalles baratos (solo en eventos de top) */}
        {esTop && detalles.length > 0 && (
          <div className="mt-4">
            <p className="mb-2 text-sm font-semibold">Detalles desde {precio(detalles[0].precio)}</p>
            <ul className="sin-barra flex gap-3 overflow-x-auto pb-1">
              {detalles.map((p) => (
                <li key={p.slug} className="w-28 shrink-0">
                  <Link href={`/producto/${p.slug}`} className="block">
                    <span className="block overflow-hidden rounded-2xl ring-1 ring-arena-oscura/50">
                      <FotoProducto producto={p} uniforme />
                    </span>
                    <span className="mt-1 block truncate text-xs text-cafe">{p.nombre}</span>
                    <span className="block text-sm font-bold">{precio(p.precio)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Link href={esTop ? "/buscar?max=200&orden=vendidos" : "/destacados"} className="mt-4 inline-block rounded-full bg-terracota px-5 py-2 text-sm font-semibold text-crema">
          {esTop ? "Ver más detalles" : "Ver sus tiendas"}
        </Link>
      </div>
    </section>
  );
}
