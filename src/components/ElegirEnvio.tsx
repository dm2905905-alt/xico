"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { Loader2, Truck } from "lucide-react";
import { precio } from "@/lib/formato";

export type OpcionEnvio = { paqueteria: string; servicio: string; descripcion: string; dias: string; precio: number };
type TiendaCotizada = { creador: string; opciones: OpcionEnvio[]; error?: string };
export type Eleccion = { paqueteria: string; servicio: string };

// Cotización real con Envia para el código postal del comprador.
// estado "fijo" = Envia no está configurado: se usa el envío fijo de siempre.
export function useCotizacion(usuario: User | null, cp: string | undefined, cuerpo: Record<string, unknown> | null) {
  const clave = usuario && cuerpo && /^\d{5}$/.test(cp ?? "") ? JSON.stringify({ cp, ...cuerpo }) : "";
  const [r, setR] = useState<{ clave: string; estado: "listo" | "fijo" | "error"; tiendas: TiendaCotizada[]; error?: string } | null>(null);

  useEffect(() => {
    if (!clave || !usuario) return;
    let activo = true;
    (async () => {
      try {
        const resp = await fetch("/api/envios/cotizar", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await usuario.getIdToken()}` },
          body: clave,
        });
        const datos = await resp.json().catch(() => ({}));
        if (!activo) return;
        if (resp.status === 503) setR({ clave, estado: "fijo", tiendas: [] });
        else if (!resp.ok) setR({ clave, estado: "error", tiendas: [], error: datos.error ?? "No pudimos cotizar el envío." });
        else setR({ clave, estado: "listo", tiendas: datos.tiendas ?? [] });
      } catch {
        if (activo) setR({ clave, estado: "error", tiendas: [], error: "No hay conexión para cotizar el envío." });
      }
    })();
    return () => {
      activo = false;
    };
  }, [clave, usuario]);

  if (!clave) return { estado: "sin-cp" as const, tiendas: [] as TiendaCotizada[] };
  if (!r || r.clave !== clave) return { estado: "cotizando" as const, tiendas: [] as TiendaCotizada[] };
  return r;
}

// Lista de paqueterías de una tienda; la más barata va primero y está elegida de inicio
export function OpcionesEnvio({
  taller,
  tienda,
  elegida,
  elegir,
}: {
  taller?: string;
  tienda: TiendaCotizada;
  elegida?: Eleccion;
  elegir: (e: Eleccion) => void;
}) {
  const actual = elegida ?? tienda.opciones[0];
  return (
    <div className="grid gap-2">
      {taller && <p className="text-sm font-semibold">Paquete de {taller}</p>}
      {tienda.error ? (
        <p className="rounded-xl bg-rosa/10 px-3 py-2 text-sm text-rosa">{tienda.error}</p>
      ) : (
        tienda.opciones.map((o) => {
          const activo = actual?.paqueteria === o.paqueteria && actual?.servicio === o.servicio;
          return (
            <label
              key={`${o.paqueteria}-${o.servicio}`}
              className={`flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm ring-1 transition ${activo ? "bg-terracota/5 ring-2 ring-terracota" : "bg-white ring-arena-oscura hover:ring-terracota/50"}`}
            >
              <input type="radio" className="accent-terracota" checked={activo} onChange={() => elegir({ paqueteria: o.paqueteria, servicio: o.servicio })} />
              <Truck className="size-4 shrink-0 text-terracota" />
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{o.descripcion}</span>
                {o.dias && <span className="block text-xs text-cafe">Llega en {o.dias.toLowerCase()}</span>}
              </span>
              <span className="font-bold">{precio(Math.ceil(o.precio))}</span>
            </label>
          );
        })
      )}
    </div>
  );
}

export function Cotizando() {
  return (
    <p className="flex items-center gap-2 text-sm text-cafe">
      <Loader2 className="size-4 animate-spin" /> Buscando el mejor precio de envío…
    </p>
  );
}

// Precio elegido (en pesos completos, como se cobra)
export const precioElegido = (tienda: TiendaCotizada, elegida?: Eleccion) => {
  const o = (elegida && tienda.opciones.find((x) => x.paqueteria === elegida.paqueteria && x.servicio === elegida.servicio)) ?? tienda.opciones[0];
  return o ? Math.ceil(o.precio) : 0;
};
