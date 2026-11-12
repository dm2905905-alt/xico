"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Bell, MessageSquareText, Package, PartyPopper, Store, Truck, Wallet } from "lucide-react";
import { fechaAviso, type TipoAviso } from "@/lib/avisos";
import { marcarLeidos, useAvisos } from "@/lib/avisos-cliente";
import { useEnNavegador } from "@/lib/almacen";
import { momentoActual } from "@/lib/eventos";
import { FormularioEntrar } from "./FormularioEntrar";
import { useSesion } from "./Sesion";

const iconos: Record<TipoAviso, typeof Bell> = {
  venta: PartyPopper,
  pago: Wallet,
  envio: Truck,
  entrega: Package,
  resena: MessageSquareText,
  respuesta: MessageSquareText,
  tienda: Store,
};

export function VistaAvisos() {
  const { usuario, cargando: cargandoSesion } = useSesion();
  const { avisos, cargando } = useAvisos(usuario?.uid);
  // La hora solo se toma en el navegador (en el servidor la página se arma sin sesión)
  const enNavegador = useEnNavegador();
  const ahora = enNavegador ? momentoActual() : 0;
  // Los que estaban sin leer al abrir se resaltan; en la base se marcan como leídos
  const [nuevos, setNuevos] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (cargando || nuevos) return;
    const sinLeer = avisos.filter((a) => !a.leido);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- se guarda una sola vez, al terminar de cargar
    setNuevos(new Set(sinLeer.map((a) => a.id)));
    marcarLeidos(sinLeer).catch(() => {});
  }, [avisos, cargando, nuevos]);

  if (cargandoSesion) return <div className="h-40 animate-pulse rounded-3xl bg-arena" />;
  if (!usuario) {
    return (
      <div className="max-w-md rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60">
        <p className="mb-4 text-sm text-cafe">Entra para ver tus avisos.</p>
        <FormularioEntrar volver="/avisos" />
      </div>
    );
  }
  if (!cargando && !avisos.length) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-arena-oscura/60">
        <Bell className="mx-auto size-10 text-cafe" />
        <p className="mt-2 font-semibold">Aquí verás tus avisos</p>
        <p className="text-sm text-cafe">Pagos, envíos, ventas y opiniones de tus productos.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-2">
      {avisos.map((a) => {
        const Icono = iconos[a.tipo] ?? Bell;
        const nuevo = nuevos?.has(a.id) ?? !a.leido;
        return (
          <li key={a.id}>
            <Link href={a.enlace} className={`flex items-start gap-3 rounded-2xl p-4 ring-1 transition hover:ring-terracota ${nuevo ? "bg-terracota/5 ring-terracota/30" : "bg-white ring-arena-oscura/60"}`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-arena text-terracota">
                <Icono className="size-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="font-semibold">{a.titulo}</span>
                  {nuevo && <span className="size-2 rounded-full bg-rosa" aria-label="Nuevo" />}
                </span>
                <span className="block text-sm text-cafe">{a.texto}</span>
              </span>
              <span className="shrink-0 text-xs text-cafe">{fechaAviso(a.fecha, ahora)}</span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
