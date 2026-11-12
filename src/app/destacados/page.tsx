import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Flame, Package, Star, Trophy } from "lucide-react";
import { CreadorDestacado } from "@/components/CreadorDestacado";
import { FotoProducto } from "@/components/FotoProducto";
import { consultas, obtenerCatalogo } from "@/lib/catalogo";
import { precio } from "@/lib/formato";

export const metadata: Metadata = {
  title: "Lo más vendido y creadores destacados",
  description: "Los productos hechos a mano que más se venden en XICO y los creadores mejor calificados.",
};

const medalla = (i: number) => (i === 0 ? "bg-maiz text-tinta" : i === 1 ? "bg-arena-oscura text-tinta" : i === 2 ? "bg-terracota/80 text-crema" : "bg-arena text-cafe");

export default async function Destacados() {
  const { masVendidos, creadoresDestacados, productosDeCreador } = consultas(await obtenerCatalogo());
  const productos = masVendidos(20);
  const creadores = creadoresDestacados(10);
  const primero = creadores[0];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <h1 className="flex items-center gap-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
        <Trophy className="size-8 text-maiz" /> Destacados
      </h1>
      <p className="mt-1 text-cafe">Lo que más se vende y los creadores que más brillan en XICO.</p>

      {primero && (
        <section className="mt-6">
          <CreadorDestacado creador={primero.creador} piezas={primero.piezas} productos={productosDeCreador(primero.creador.slug)} />
        </section>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        {/* Productos más vendidos */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold sm:text-2xl">
            <Flame className="size-6 text-rosa" /> Productos más vendidos
          </h2>
          <ol className="grid gap-2">
            {productos.map((p, i) => (
              <li key={p.slug}>
                <Link href={`/producto/${p.slug}`} className="flex items-center gap-3 rounded-2xl bg-white p-2 pr-4 ring-1 ring-arena-oscura/60 transition hover:ring-terracota">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-extrabold ${medalla(i)}`}>{i + 1}</span>
                  <span className="w-16 shrink-0 overflow-hidden rounded-xl">
                    <FotoProducto producto={p} uniforme />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{p.nombre}</span>
                    <span className="block truncate text-xs text-cafe">{p.taller}</span>
                    <span className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-cafe">
                      {p.vendidos > 0 && <span>{p.vendidos} vendidos</span>}
                      {p.resenas > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star className="size-3 fill-maiz text-maiz" /> {p.calificacion.toFixed(1)} ({p.resenas})
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="font-bold">{precio(p.precio)}</span>
                </Link>
              </li>
            ))}
            {!productos.length && <li className="text-sm text-cafe">Aún no hay productos.</li>}
          </ol>
        </section>

        {/* Ranking de creadores */}
        <section>
          <h2 className="mb-3 flex items-center gap-2 font-display text-xl font-bold sm:text-2xl">
            <Trophy className="size-6 text-maiz" /> Top creadores
          </h2>
          <ol className="grid gap-2">
            {creadores.map(({ creador: c, piezas, productos: cuantos }, i) => (
              <li key={c.slug}>
                <Link href={`/creador/${c.slug}`} className="flex items-center gap-3 rounded-2xl bg-white p-2 pr-4 ring-1 ring-arena-oscura/60 transition hover:ring-terracota">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-extrabold ${medalla(i)}`}>{i + 1}</span>
                  <span className="rounded-full p-[2px]" style={{ background: `linear-gradient(135deg, ${c.colores[0]}, ${c.colores[1]})` }}>
                    <span className="grid size-11 place-items-center overflow-hidden rounded-full border-2 border-white bg-tinta font-display font-bold text-crema">
                      {c.foto ? (
                        // eslint-disable-next-line @next/next/no-img-element -- miniatura ya reducida al subirla
                        <img src={c.foto.mini} alt="" className="size-full object-cover" />
                      ) : (
                        c.taller.slice(0, 1).toUpperCase()
                      )}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1 font-semibold">
                      <span className="truncate">{c.taller}</span>
                      {c.verificado && <BadgeCheck className="size-4 shrink-0 text-jade" />}
                    </span>
                    <span className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-cafe">
                      {c.resenas > 0 && (
                        <span className="flex items-center gap-0.5">
                          <Star className="size-3 fill-maiz text-maiz" /> {c.calificacion.toFixed(1)} ({c.resenas})
                        </span>
                      )}
                      {piezas > 0 && <span>{piezas} vendidas</span>}
                      <span className="flex items-center gap-0.5">
                        <Package className="size-3" /> {cuantos}
                      </span>
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
