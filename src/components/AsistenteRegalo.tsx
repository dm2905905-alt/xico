"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Gift, RotateCcw } from "lucide-react";
import { destinatarios, ocasiones, presupuestos, sugerirRegalos, type ProductoRegalo } from "@/lib/regalos";
import { TarjetaProducto } from "./TarjetaProducto";

type Respuestas = { destino?: string; ocasion?: string; presupuesto?: string };

export function AsistenteRegalo({ productos }: { productos: ProductoRegalo[] }) {
  const [r, setR] = useState<Respuestas>({});
  const paso = !r.destino ? 1 : !r.ocasion ? 2 : !r.presupuesto ? 3 : 4;

  const regresar = () =>
    setR((x) => (x.presupuesto ? { ...x, presupuesto: undefined } : x.ocasion ? { ...x, ocasion: undefined } : {}));

  const opcionCls =
    "flex flex-col items-center gap-2 rounded-2xl bg-white p-4 text-center font-medium ring-1 ring-arena-oscura/60 transition hover:-translate-y-0.5 hover:ring-2 hover:ring-rosa focus-visible:ring-2 focus-visible:ring-rosa";

  return (
    <div>
      {/* Avance */}
      {paso < 4 && (
        <div className="mb-8 flex items-center gap-3">
          {[1, 2, 3].map((n) => (
            <span key={n} className={`h-1.5 flex-1 rounded-full ${n <= paso ? "bg-rosa" : "bg-arena-oscura"}`} />
          ))}
          <span className="text-sm text-cafe">Paso {paso} de 3</span>
        </div>
      )}

      {paso > 1 && paso < 4 && (
        <button onClick={regresar} className="mb-4 flex items-center gap-1 text-sm text-cafe hover:text-tinta">
          <ArrowLeft className="size-4" /> Regresar
        </button>
      )}

      {paso === 1 && (
        <Pregunta titulo="¿Para quién es el regalo?">
          {destinatarios.map((d) => (
            <button key={d.id} onClick={() => setR({ destino: d.id })} className={opcionCls}>
              <span className="text-4xl" aria-hidden>{d.emoji}</span>
              {d.texto}
            </button>
          ))}
        </Pregunta>
      )}

      {paso === 2 && (
        <Pregunta titulo="¿Cuál es la ocasión?">
          {ocasiones.map((o) => (
            <button key={o.id} onClick={() => setR((x) => ({ ...x, ocasion: o.id }))} className={opcionCls}>
              <span className="text-4xl" aria-hidden>{o.emoji}</span>
              {o.texto}
            </button>
          ))}
        </Pregunta>
      )}

      {paso === 3 && (
        <Pregunta titulo="¿Cuánto quieres gastar?">
          {presupuestos.map((p) => (
            <button key={p.id} onClick={() => setR((x) => ({ ...x, presupuesto: p.id }))} className={`${opcionCls} py-6 text-lg`}>
              {p.texto}
            </button>
          ))}
        </Pregunta>
      )}

      {paso === 4 && <Resultados productos={productos} r={r as Required<Respuestas>} reiniciar={() => setR({})} cambiar={regresar} />}
    </div>
  );
}

function Pregunta({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-5 font-display text-2xl font-semibold sm:text-3xl">{titulo}</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{children}</div>
    </section>
  );
}

function Resultados({
  productos,
  r,
  reiniciar,
  cambiar,
}: {
  productos: ProductoRegalo[];
  r: Required<Respuestas>;
  reiniciar: () => void;
  cambiar: () => void;
}) {
  const sugerencias = sugerirRegalos(productos, r.destino, r.ocasion, r.presupuesto);
  const destino = destinatarios.find((d) => d.id === r.destino)!;
  const ocasion = ocasiones.find((o) => o.id === r.ocasion)!;
  const presupuesto = presupuestos.find((p) => p.id === r.presupuesto)!;

  return (
    <section>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold sm:text-3xl">Ideas de regalo</h2>
          <p className="mt-1 flex flex-wrap gap-2 text-sm">
            {[`${destino.emoji} ${destino.texto}`, `${ocasion.emoji} ${ocasion.texto}`, presupuesto.texto].map((t) => (
              <span key={t} className="rounded-full bg-white px-3 py-1 ring-1 ring-arena-oscura">{t}</span>
            ))}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={cambiar} className="rounded-full border border-arena-oscura px-4 py-2 text-sm hover:bg-arena">Cambiar presupuesto</button>
          <button onClick={reiniciar} className="flex items-center gap-1.5 rounded-full border border-arena-oscura px-4 py-2 text-sm hover:bg-arena">
            <RotateCcw className="size-4" /> Empezar de nuevo
          </button>
        </div>
      </div>

      {sugerencias.length ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {sugerencias.map(({ producto, razones }) => (
            <div key={producto.slug} className="grid content-start gap-2">
              <TarjetaProducto producto={producto} />
              {razones.length > 0 && (
                <ul className="flex flex-wrap gap-1">
                  {razones.map((t) => (
                    <li key={t} className="rounded-full bg-rosa/10 px-2 py-0.5 text-[11px] font-medium text-rosa">{t}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl bg-white px-6 py-14 text-center ring-1 ring-arena-oscura/50">
          <Gift className="mx-auto size-10 text-rosa/60" />
          <p className="mt-3 font-display text-xl font-semibold">No hay productos en ese presupuesto todavía</p>
          <p className="mt-1 text-sm text-cafe">Prueba con otro rango de precio.</p>
          <button onClick={cambiar} className="mt-5 rounded-full bg-rosa px-5 py-2.5 font-semibold text-white hover:bg-rosa/90">Cambiar presupuesto</button>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-cafe">
        ¿No encontraste lo que buscabas? <Link href="/buscar" className="font-semibold text-terracota hover:underline">Explora todo el catálogo</Link>
      </p>
    </section>
  );
}
