"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { sinLeer, useConversaciones } from "@/lib/chat";
import { FormularioEntrar } from "../FormularioEntrar";
import { useSesion } from "../Sesion";

const fecha = (ms: number) => new Date(ms).toLocaleDateString("es-MX", { day: "numeric", month: "short" });

// Bandeja de mensajes: como comprador y como vendedor
export function ListaConversaciones({ activa }: { activa?: string }) {
  const { usuario, cargando: cargandoSesion } = useSesion();
  const { conversaciones, cargando } = useConversaciones(usuario?.uid);

  if (cargandoSesion || (usuario && cargando)) return <div className="h-64 animate-pulse rounded-3xl bg-arena" />;
  if (!usuario) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60">
        <p className="mb-4 text-sm text-cafe">Entra a tu cuenta para ver tus mensajes.</p>
        <FormularioEntrar volver="/mensajes" />
      </div>
    );
  }

  if (!conversaciones.length) {
    return (
      <div className="rounded-[2rem] bg-white/85 p-8 text-center ring-1 ring-white backdrop-blur">
        <MessageCircle className="mx-auto size-10 text-terracota/60" />
        <p className="mt-3 font-display text-xl font-semibold">Aún no tienes mensajes</p>
        <p className="mt-1 text-sm text-cafe">¿Quieres algo personalizado? Entra a la tienda de un creador y presiona &quot;Escribir al creador&quot;.</p>
        <Link href="/estados" className="mt-5 inline-block rounded-full bg-terracota px-5 py-2.5 text-sm font-semibold text-white">Explorar creadores</Link>
      </div>
    );
  }

  return (
    <ul className="overflow-hidden rounded-[2rem] bg-white/85 shadow-xl shadow-terracota/10 ring-1 ring-white backdrop-blur">
      {conversaciones.map((c) => {
        const soyVendedor = c.creadorUid === usuario.uid;
        const nombre = soyVendedor ? c.compradorNombre : c.taller;
        const nuevo = sinLeer(c, usuario.uid);
        return (
          <li key={c.id} className="border-b border-arena-oscura/50 last:border-0">
            <Link href={`/mensajes/${c.id}`} className={`flex items-center gap-3 px-4 py-3 transition hover:bg-arena/60 ${activa === c.id ? "bg-arena" : ""}`}>
              <span className="degradado-xico grid size-11 shrink-0 place-items-center rounded-full font-display font-extrabold text-white">{nombre.trim()[0]?.toUpperCase()}</span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className={`truncate ${nuevo ? "font-bold" : "font-semibold"}`}>{nombre}</span>
                  <span className="shrink-0 text-[11px] text-cafe">{fecha(c.actualizado)}</span>
                </span>
                <span className="flex items-center gap-2">
                  <span className={`truncate text-sm ${nuevo ? "font-semibold text-tinta" : "text-cafe"}`}>
                    {soyVendedor && <span className="mr-1 rounded bg-arena px-1 text-[10px] font-bold text-terracota">TU TIENDA</span>}
                    {c.ultimo?.texto ?? "Conversación nueva"}
                  </span>
                  {nuevo && <span className="size-2.5 shrink-0 rounded-full bg-rosa" aria-label="Mensaje sin leer" />}
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
