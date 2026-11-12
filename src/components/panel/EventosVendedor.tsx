"use client";

import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Trophy } from "lucide-react";
import type { Creador } from "@/lib/datos";
import { avances, cumple, faseEvento, textoMeta, textoPeriodo, textoPremio, type Evento } from "@/lib/eventos";
import { obtenerDb } from "@/lib/firebase";
import { precio } from "@/lib/formato";
import type { Pedido } from "@/lib/pedidos";

const DIA = 24 * 60 * 60 * 1000;

function useEventos() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  useEffect(() => {
    const db = obtenerDb();
    if (!db) return;
    return onSnapshot(
      collection(db, "eventos"),
      (s) => setEventos(s.docs.map((d) => d.data() as Evento)),
      () => setEventos([]),
    );
  }, []);
  return eventos;
}

// Retos de XICO para vendedores: los que están en curso (con su avance) y los premios que ganó
export function EventosVendedor({ creador, pedidos }: { creador: Creador; pedidos: Pedido[] }) {
  const eventos = useEventos();
  const [ahora] = useState(() => Date.now());

  const visibles = eventos
    .filter((e) => {
      const f = faseEvento(e, ahora);
      if (f === "en-curso" || f === "proximo" || f === "por-premiar") return true;
      // Premios ganados en los últimos 30 días
      return f === "premiado" && (e.premiado ?? 0) > ahora - 30 * DIA && e.ganadores?.some((g) => g.creador === creador.slug);
    })
    .sort((a, b) => a.fin - b.fin);

  if (!visibles.length) return null;

  return (
    <section className="grid gap-3">
      {visibles.map((e) => {
        const fase = faseEvento(e, ahora);
        const mio = avances(e, pedidos).find((a) => a.creador === creador.slug) ?? { creador: creador.slug, taller: creador.taller, ventas: 0, piezas: 0, masCaro: 0, comision: 0 };
        const premio = e.ganadores?.find((g) => g.creador === creador.slug);
        const meta = e.meta;
        const objetivo = meta.tipo === "monto" ? meta.minimo : meta.tipo === "piezas" ? meta.minimo : 0;
        const actual = meta.tipo === "piezas" ? mio.piezas : mio.ventas;
        const porcentaje = objetivo ? Math.min(100, Math.round((actual / objetivo) * 100)) : 0;
        const diasRestantes = Math.max(0, Math.ceil((e.fin - ahora) / DIA));

        return (
          <article key={e.id} className="rounded-3xl bg-gradient-to-br from-maiz/30 to-terracota/10 p-5 ring-1 ring-maiz/60">
            <div className="flex items-start gap-3">
              <Trophy className="mt-0.5 size-6 shrink-0 text-terracota" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-terracota">
                  {fase === "premiado" ? "¡Ganaste!" : fase === "proximo" ? "Próximo evento" : fase === "por-premiar" ? "Evento terminado" : "Evento de XICO"}
                </p>
                <p className="font-display text-lg font-semibold">{e.titulo}</p>
                <p className="text-sm">
                  {textoMeta(meta)} y gana {textoPremio(e.premio)}.
                </p>
                <p className="text-xs text-cafe">
                  {textoPeriodo(e)}
                  {fase === "en-curso" && ` · ${diasRestantes === 1 ? "queda 1 día" : `quedan ${diasRestantes} días`}`}
                </p>
                {e.descripcion && <p className="mt-1 text-sm">{e.descripcion}</p>}
              </div>
            </div>

            {fase === "premiado" && premio ? (
              <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-sm font-semibold">
                🎉 Tu premio: {premio.meses ? `${premio.meses} ${premio.meses === 1 ? "mes" : "meses"} de mensualidad gratis (ya aplicado)` : `${precio(premio.monto)}${premio.pagado ? " · ya te lo depositamos" : " · te lo depositamos en tu cuenta de cobro"}`}
              </p>
            ) : fase !== "proximo" ? (
              <div className="mt-3 text-sm">
                <p>
                  Llevas <strong>{precio(mio.ventas)}</strong> en ventas · {mio.piezas} {mio.piezas === 1 ? "pieza" : "piezas"}
                </p>
                {objetivo > 0 && (
                  <>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/70">
                      <div className="h-full rounded-full bg-jade" style={{ width: `${porcentaje}%` }} />
                    </div>
                    <p className="mt-1 text-xs text-cafe">
                      {cumple(meta, mio)
                        ? "✅ ¡Ya cumpliste la meta!"
                        : meta.tipo === "piezas"
                          ? `Te faltan ${objetivo - actual} ${objetivo - actual === 1 ? "pieza" : "piezas"}`
                          : `Te faltan ${precio(objetivo - actual)}`}
                    </p>
                  </>
                )}
                {meta.tipo === "top" && <p className="mt-1 text-xs text-cafe">Ganan las {meta.lugares} tiendas con más ventas al terminar el evento.</p>}
                {fase === "por-premiar" && <p className="mt-1 text-xs text-cafe">Estamos revisando los resultados. Pronto verás aquí si ganaste.</p>}
              </div>
            ) : null}
          </article>
        );
      })}
    </section>
  );
}
