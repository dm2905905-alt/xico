"use client";

import Link from "next/link";
import { Bell, Heart, MessageCircle, ShoppingBag, User } from "lucide-react";
import { useAvisos } from "@/lib/avisos-cliente";
import { sinLeer, useConversaciones } from "@/lib/chat";
import { useCarrito } from "@/lib/carrito";
import { useFavoritos } from "@/lib/favoritos";
import { useSesion } from "./Sesion";

function Globo({ n }: { n: number }) {
  if (!n) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-rosa px-1 text-[11px] font-bold text-white">
      {n > 99 ? "99+" : n}
    </span>
  );
}

export function IconosCuenta() {
  const piezas = useCarrito().reduce((s, a) => s + a.cantidad, 0);
  const favoritos = useFavoritos().length;
  const { usuario } = useSesion();
  const { conversaciones } = useConversaciones(usuario?.uid);
  const hayNuevos = !!usuario && conversaciones.some((c) => sinLeer(c, usuario.uid));
  const avisosNuevos = useAvisos(usuario?.uid).avisos.filter((a) => !a.leido).length;
  const inicial = usuario?.displayName?.[0] ?? usuario?.phoneNumber?.slice(-2);

  return (
    <nav className="ml-auto flex items-center gap-1 md:ml-0" aria-label="Tu cuenta">
      <Link
        href="/favoritos"
        aria-label={`Favoritos${favoritos ? ` (${favoritos})` : ""}`}
        className="relative hidden size-10 place-items-center rounded-full hover:bg-arena md:grid"
      >
        <Heart className="size-5" />
        <Globo n={favoritos} />
      </Link>
      {usuario && (
        <Link href="/avisos" aria-label={`Avisos${avisosNuevos ? ` (${avisosNuevos} nuevos)` : ""}`} className="relative grid size-10 place-items-center rounded-full hover:bg-arena">
          <Bell className="size-5" />
          <Globo n={avisosNuevos} />
        </Link>
      )}
      {usuario && (
        <Link href="/mensajes" aria-label={`Mensajes${hayNuevos ? " (nuevos)" : ""}`} className="relative grid size-10 place-items-center rounded-full hover:bg-arena">
          <MessageCircle className="size-5" />
          {hayNuevos && <span className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-rosa ring-2 ring-white" />}
        </Link>
      )}
      <Link href="/cuenta" aria-label="Mi cuenta" className="hidden size-10 md:grid place-items-center rounded-full hover:bg-arena">
        {usuario ? (
          <span className="grid size-7 place-items-center rounded-full bg-jade text-xs font-bold text-white">{inicial ?? "✓"}</span>
        ) : (
          <User className="size-5" />
        )}
      </Link>
      <Link
        href="/carrito"
        aria-label={`Carrito${piezas ? ` (${piezas} piezas)` : ""}`}
        className="relative grid size-10 place-items-center rounded-full hover:bg-arena"
      >
        <ShoppingBag className="size-5" />
        <Globo n={piezas} />
      </Link>
    </nav>
  );
}
