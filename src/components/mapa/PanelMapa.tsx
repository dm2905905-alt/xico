"use client";

import Link from "next/link";
import { ArrowLeft, BadgeCheck, ChevronRight, MapPin, Sparkles, Star, Store } from "lucide-react";
import { estadoPorSlug, estados } from "@/lib/datos";
import { precio } from "@/lib/formato";
import type { CreadorMapa } from "@/lib/mapa";
import { FotoProducto } from "../FotoProducto";

export type Seleccion = { tipo: "mexico" } | { tipo: "estado"; slug: string } | { tipo: "creador"; slug: string };

const inicial = (c: CreadorMapa) => (c.taller || c.nombre || "?").trim()[0]?.toUpperCase();

function Avatar({ c, grande = false }: { c: CreadorMapa; grande?: boolean }) {
  const [a, b] = c.colores;
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden rounded-full font-display font-extrabold text-white shadow-md ${grande ? "size-20 text-3xl" : "size-12 text-lg"}`}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
    >
      {c.foto ? (
            // eslint-disable-next-line @next/next/no-img-element -- miniatura ya reducida al subirla
            <img src={c.foto.mini} alt={`Foto de ${c.taller}`} className="size-full object-cover" />
          ) : (
            inicial(c)
          )}
    </span>
  );
}

export function PanelMapa({
  creadores,
  seleccion,
  cuantos,
  verEstado,
  verMexico,
  verCreador,
}: {
  creadores: CreadorMapa[];
  seleccion: Seleccion;
  cuantos: Map<string, number>;
  verEstado: (slug: string) => void;
  verMexico: () => void;
  verCreador: (c: CreadorMapa) => void;
}) {
  const caja = "rounded-[2rem] bg-white/85 p-5 shadow-xl shadow-terracota/10 ring-1 ring-white backdrop-blur sm:p-6";

  // ---- Un vendedor ----
  if (seleccion.tipo === "creador") {
    const c = creadores.find((x) => x.slug === seleccion.slug);
    if (!c) return null;
    const estado = estadoPorSlug(c.estado);
    return (
      <aside className={`${caja} self-start lg:sticky lg:top-36`} aria-live="polite">
        <button onClick={() => verEstado(c.estado)} className="mb-4 flex items-center gap-1 text-sm font-medium text-cafe hover:text-terracota">
          <ArrowLeft className="size-4" /> {estado?.nombre}
        </button>
        <div className="flex items-center gap-4">
          <Avatar c={c} grande />
          <div className="min-w-0">
            <h2 className="flex items-center gap-1.5 font-display text-2xl leading-tight font-bold">
              {c.taller}
              {c.verificado && <BadgeCheck className="size-5 shrink-0 text-jade" aria-label="Verificado" />}
            </h2>
            {c.nombre && <p className="text-sm text-cafe">{c.nombre}</p>}
            <p className="mt-1 flex items-center gap-1 text-sm text-cafe">
              <MapPin className="size-3.5" /> {c.ciudad ? `${c.ciudad}, ` : ""}
              {estado?.nombre}
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          {c.especialidad && <span className="rounded-full bg-arena px-3 py-1 font-semibold text-terracota">✨ {c.especialidad}</span>}
          {c.top && <span className="rounded-full bg-maiz/25 px-3 py-1 font-semibold">⭐ Top vendedor</span>}
          {c.resenas > 0 && (
            <span className="flex items-center gap-1 rounded-full bg-white px-3 py-1 ring-1 ring-arena-oscura">
              <Star className="size-3.5 fill-maiz text-maiz" /> {c.calificacion} ({c.resenas})
            </span>
          )}
        </div>

        {c.historia && (
          <div className="mt-5">
            <p className="text-xs font-bold tracking-wider text-cafe uppercase">Su historia</p>
            <p className="mt-1 leading-relaxed text-tinta/90">{c.historia}</p>
          </div>
        )}

        {c.productos.length > 0 && (
          <div className="mt-5">
            <p className="mb-2 text-xs font-bold tracking-wider text-cafe uppercase">Lo que hace ({c.totalProductos})</p>
            <div className="grid grid-cols-3 gap-2">
              {c.productos.map((p) => (
                <Link key={p.slug} href={`/producto/${p.slug}`} className="group block">
                  <div className="overflow-hidden rounded-xl">
                    <FotoProducto producto={p} uniforme className="transition group-hover:scale-105" />
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs font-medium">{p.nombre}</p>
                  <p className="text-xs font-bold text-terracota">{precio(p.precio)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link
          href={`/creador/${c.slug}`}
          className="degradado-xico mt-6 flex h-12 items-center justify-center gap-2 rounded-full font-semibold text-white shadow-lg shadow-rosa/25 transition hover:brightness-110"
        >
          <Store className="size-5" /> Ver su tienda
        </Link>
      </aside>
    );
  }

  // ---- Un estado ----
  if (seleccion.tipo === "estado") {
    const estado = estadoPorSlug(seleccion.slug);
    if (!estado) return null;
    const suyos = creadores.filter((c) => c.estado === estado.slug);
    return (
      <aside className={`${caja} self-start lg:sticky lg:top-36`} aria-live="polite">
        <button onClick={verMexico} className="mb-4 flex items-center gap-1 text-sm font-medium text-cafe hover:text-terracota">
          <ArrowLeft className="size-4" /> Todo México
        </button>
        <div className="patron-picado rounded-2xl p-5 text-white" style={{ background: `linear-gradient(135deg, ${estado.colores[0]}, ${estado.colores[1]})` }}>
          <h2 className="font-display text-3xl leading-tight font-extrabold">{estado.nombre}</h2>
          <p className="mt-1 text-sm text-white/90">★ Capital: {estado.capital.nombre}</p>
          <p className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">✨ {estado.especialidad}</p>
        </div>

        <p className="mt-5 mb-2 text-xs font-bold tracking-wider text-cafe uppercase">
          {suyos.length ? `${suyos.length} ${suyos.length === 1 ? "creador" : "creadores"} aquí` : "Creadores"}
        </p>
        {suyos.length ? (
          <ul className="grid gap-2">
            {suyos.map((c) => (
              <li key={c.slug}>
                <button
                  onClick={() => verCreador(c)}
                  className="flex w-full items-center gap-3 rounded-2xl bg-white p-3 text-left ring-1 ring-arena-oscura transition hover:-translate-y-0.5 hover:shadow-md hover:ring-terracota/40"
                >
                  <Avatar c={c} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1 font-semibold">
                      {c.taller}
                      {c.verificado && <BadgeCheck className="size-4 text-jade" />}
                    </span>
                    <span className="block truncate text-xs text-cafe">{c.especialidad || c.ciudad}</span>
                    {c.historia && <span className="mt-0.5 line-clamp-2 block text-xs text-tinta/75">{c.historia}</span>}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-cafe" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-arena-oscura p-5 text-center text-sm text-cafe">
            <p className="text-2xl">🌱</p>
            <p className="mt-1 font-semibold text-tinta">Todavía no hay creadores en {estado.nombre}</p>
            <p className="mt-1">¿Haces cosas increíbles aquí? Sé el primero.</p>
            <Link href="/vende" className="mt-3 inline-block rounded-full bg-terracota px-4 py-2 text-sm font-semibold text-white hover:bg-terracota-oscura">
              Abrir mi tienda
            </Link>
          </div>
        )}

        {suyos.length > 0 && (
          <Link href={`/estado/${estado.slug}`} className="mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-terracota hover:underline">
            Ver todos los productos de {estado.nombre} <ChevronRight className="size-4" />
          </Link>
        )}
      </aside>
    );
  }

  // ---- Todo México ----
  const conCreadores = estados.filter((e) => cuantos.get(e.slug)).sort((a, b) => (cuantos.get(b.slug) ?? 0) - (cuantos.get(a.slug) ?? 0));
  const destacados = [...creadores].sort((a, b) => Number(b.top) - Number(a.top) || b.calificacion - a.calificacion).slice(0, 4);
  return (
    <aside className={`${caja} self-start lg:sticky lg:top-36`}>
      <p className="inline-flex items-center gap-1.5 rounded-full bg-arena px-3 py-1 text-xs font-semibold text-terracota">
        <Sparkles className="size-3.5" /> Explora México
      </p>
      <h2 className="mt-3 font-display text-3xl leading-tight font-extrabold">
        Viaja por México <span className="texto-degradado">y conoce a quien lo crea</span>
      </h2>
      <p className="mt-2 text-sm text-cafe">Toca un estado o un pin para ver a sus creadores, su historia y lo que hacen.</p>

      <div className="mt-4 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-2xl bg-arena p-3">
          <p className="font-display text-2xl font-extrabold text-terracota">{creadores.length}</p>
          <p className="text-xs text-cafe">creadores</p>
        </div>
        <div className="rounded-2xl bg-arena p-3">
          <p className="font-display text-2xl font-extrabold text-rosa">{conCreadores.length}</p>
          <p className="text-xs text-cafe">de 32 estados</p>
        </div>
      </div>

      {conCreadores.length > 0 && (
        <>
          <p className="mt-5 mb-2 text-xs font-bold tracking-wider text-cafe uppercase">Estados con creadores</p>
          <div className="flex flex-wrap gap-2">
            {conCreadores.map((e) => (
              <button
                key={e.slug}
                onClick={() => verEstado(e.slug)}
                className="rounded-full px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:scale-105"
                style={{ background: `linear-gradient(135deg, ${e.colores[0]}, ${e.colores[1]})` }}
              >
                {e.nombre} · {cuantos.get(e.slug)}
              </button>
            ))}
          </div>
        </>
      )}

      {destacados.length > 0 && (
        <>
          <p className="mt-5 mb-2 text-xs font-bold tracking-wider text-cafe uppercase">Creadores destacados</p>
          <ul className="grid gap-2">
            {destacados.map((c) => (
              <li key={c.slug}>
                <button onClick={() => verCreador(c)} className="flex w-full items-center gap-3 rounded-2xl p-2 text-left transition hover:bg-arena">
                  <Avatar c={c} />
                  <span className="min-w-0">
                    <span className="block font-semibold">{c.taller}</span>
                    <span className="block truncate text-xs text-cafe">
                      {c.ciudad ? `${c.ciudad}, ` : ""}
                      {estadoPorSlug(c.estado)?.nombre}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <select
        onChange={(e) => e.target.value && verEstado(e.target.value)}
        value=""
        className="mt-5 h-11 w-full rounded-full border border-arena-oscura bg-white px-4 text-sm"
        aria-label="Ir a un estado"
      >
        <option value="">🔎 Ir a un estado…</option>
        {estados.map((e) => (
          <option key={e.slug} value={e.slug}>
            {e.nombre}
          </option>
        ))}
      </select>
    </aside>
  );
}
