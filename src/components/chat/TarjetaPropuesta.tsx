"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Clock, Loader2, ShieldCheck, XCircle } from "lucide-react";
import { responderPropuesta, usePropuesta } from "@/lib/chat";
import { precio } from "@/lib/formato";

const ENVIO = 99;
const ENVIO_GRATIS_DESDE = 999;

const etiquetaEstado = {
  pendiente: { texto: "Esperando respuesta", clase: "bg-maiz/25 text-tinta", Icono: Clock },
  rechazada: { texto: "Rechazada", clase: "bg-rosa/10 text-rosa", Icono: XCircle },
  cancelada: { texto: "Cancelada por la tienda", clase: "bg-arena text-cafe", Icono: XCircle },
  pagada: { texto: "Pagada", clase: "bg-jade/15 text-jade", Icono: CheckCircle2 },
} as const;

// Propuesta personalizada dentro del chat
export function TarjetaPropuesta({ id, uid }: { id: string; uid: string }) {
  const { propuesta: p, cargando } = usePropuesta(id);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  if (cargando) return <div className="h-40 w-72 animate-pulse rounded-3xl bg-arena" />;
  if (!p) return <p className="text-xs text-cafe">Propuesta no disponible.</p>;

  const esComprador = p.compradorUid === uid;
  const envio = p.precio >= ENVIO_GRATIS_DESDE ? 0 : ENVIO;
  const e = etiquetaEstado[p.estado];

  async function responder(estado: "rechazada" | "cancelada") {
    const pregunta = estado === "rechazada" ? "¿Rechazar esta propuesta?" : "¿Cancelar esta propuesta?";
    if (!window.confirm(pregunta)) return;
    setOcupado(true);
    setError("");
    try {
      await responderPropuesta(p!.id, estado);
    } catch {
      setError("No se pudo actualizar. Inténtalo de nuevo.");
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="w-[min(20rem,80vw)] overflow-hidden rounded-3xl bg-white shadow-lg shadow-terracota/15 ring-2 ring-terracota/30">
      <div className="degradado-xico px-4 py-2 text-xs font-bold tracking-wider text-white uppercase">📝 Propuesta personalizada</div>
      {p.foto && (
        // eslint-disable-next-line @next/next/no-img-element -- imagen del diseño, ya reducida
        <img src={p.foto.url} alt="Diseño propuesto" className="aspect-square w-full object-cover" />
      )}
      <div className="grid gap-3 p-4">
        <p className="font-display text-lg leading-tight font-bold">{p.titulo}</p>
        {p.detalles.length > 0 && (
          <dl className="grid gap-1 text-sm">
            {p.detalles.map((d, i) => (
              <div key={i} className="flex gap-1.5">
                <dt className="text-cafe">{d.etiqueta}:</dt>
                <dd className="font-medium">{d.valor}</dd>
              </div>
            ))}
          </dl>
        )}
        <div className="rounded-2xl bg-arena/70 p-3 text-sm">
          <div className="flex justify-between">
            <span className="text-cafe">Precio</span>
            <span className="font-semibold">{precio(p.precio)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-cafe">Envío</span>
            <span>{envio ? precio(envio) : "Gratis"}</span>
          </div>
          <div className="mt-1 flex justify-between border-t border-arena-oscura pt-1 text-base font-bold">
            <span>Total</span>
            <span>{precio(p.precio + envio)}</span>
          </div>
          <p className="mt-1 text-xs text-cafe">⏱️ Elaboración: {p.diasElaboracion}</p>
        </div>

        <span className={`inline-flex items-center gap-1.5 self-start rounded-full px-3 py-1 text-xs font-semibold ${e.clase}`}>
          <e.Icono className="size-3.5" /> {e.texto}
        </span>

        {p.estado === "pendiente" && esComprador && (
          <div className="grid gap-2">
            <Link href={`/propuesta/${p.id}`} className="degradado-xico flex h-11 items-center justify-center rounded-full font-semibold text-white shadow-md hover:brightness-110">
              Aceptar y pagar
            </Link>
            <button onClick={() => responder("rechazada")} disabled={ocupado} className="h-9 rounded-full text-sm text-cafe hover:bg-arena disabled:opacity-50">
              {ocupado ? <Loader2 className="mx-auto size-4 animate-spin" /> : "Rechazar"}
            </button>
            <p className="flex items-start gap-1.5 text-[11px] text-cafe">
              <ShieldCheck className="size-3.5 shrink-0 text-jade" /> Pagando por XICO tienes Compra protegida: si no llega o no es lo acordado, te devolvemos tu dinero.
            </p>
          </div>
        )}
        {p.estado === "pendiente" && !esComprador && (
          <button onClick={() => responder("cancelada")} disabled={ocupado} className="h-9 rounded-full border border-arena-oscura text-sm hover:bg-arena disabled:opacity-50">
            Cancelar propuesta
          </button>
        )}
        {p.estado === "pagada" && p.pedidoId && (
          <Link href={`/pedido/${p.pedidoId}`} className="text-center text-sm font-semibold text-terracota hover:underline">
            Ver el pedido →
          </Link>
        )}
        {error && <p className="text-xs text-rosa">{error}</p>}
      </div>
    </div>
  );
}
