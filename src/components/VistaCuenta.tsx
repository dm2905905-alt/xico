"use client";

import Link from "next/link";
import { ChevronRight, Gift, Heart, HelpCircle, LogOut, MapPin, MessageCircle, Package, ShieldCheck, ShoppingBag, Store } from "lucide-react";
import { sinLeer, useConversaciones } from "@/lib/chat";
import { useCarrito } from "@/lib/carrito";
import { useFavoritos } from "@/lib/favoritos";
import { usePedidosDe } from "@/lib/usar-pedidos";
import { FormularioEntrar } from "./FormularioEntrar";
import { ListaPedidos } from "./ListaPedidos";
import { useSesion } from "./Sesion";

type Opcion = { href: string; texto: string; icono: typeof Package; detalle?: string; punto?: boolean; color?: string };

// Lista de opciones estilo app (fila con icono, texto y flecha)
function Menu({ titulo, opciones }: { titulo?: string; opciones: Opcion[] }) {
  return (
    <section>
      {titulo && <h2 className="mb-2 px-1 text-xs font-semibold tracking-wider text-cafe uppercase">{titulo}</h2>}
      <ul className="divide-y divide-arena-oscura/60 overflow-hidden rounded-3xl bg-white ring-1 ring-arena-oscura/60">
        {opciones.map((o) => (
          <li key={o.href}>
            <Link href={o.href} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-arena/50">
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-arena">
                <o.icono className={`size-5 ${o.color ?? "text-terracota"}`} />
              </span>
              <span className="flex-1 font-medium">{o.texto}</span>
              {o.punto && <span className="size-2.5 rounded-full bg-rosa" aria-label="Nuevos" />}
              {o.detalle && <span className="text-sm text-cafe">{o.detalle}</span>}
              <ChevronRight className="size-4 text-cafe" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

const ayuda: Opcion[] = [
  { href: "/regalos", texto: "Encuentra un regalo", icono: Gift, color: "text-rosa" },
  { href: "/estados", texto: "Explora el mapa de México", icono: MapPin, color: "text-jade" },
  { href: "/ayuda", texto: "Ayuda y preguntas", icono: HelpCircle },
  { href: "/terminos", texto: "Términos y privacidad", icono: ShieldCheck },
];

export function VistaCuenta() {
  const { usuario, cargando, salir } = useSesion();
  const piezas = useCarrito().reduce((s, a) => s + a.cantidad, 0);
  const favoritos = useFavoritos().length;
  const { pedidos, cargando: cargandoPedidos } = usePedidosDe(usuario?.uid);
  const { conversaciones } = useConversaciones(usuario?.uid);
  const misCompras = pedidos.filter((p) => p.uid === usuario?.uid);
  const hayMensajes = !!usuario && conversaciones.some((c) => sinLeer(c, usuario.uid));

  if (cargando) return <div className="h-48 animate-pulse rounded-3xl bg-arena" />;

  if (!usuario) {
    return (
      <div className="grid gap-6">
        <div className="rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60 sm:p-8">
          <h2 className="font-display text-2xl font-semibold">Entra a tu cuenta</h2>
          <p className="mt-1 mb-6 text-sm text-cafe">Para ver tus pedidos, escribir a los creadores y pagar más rápido.</p>
          <FormularioEntrar volver="/cuenta" />
        </div>
        <Menu
          opciones={[
            { href: "/carrito", texto: "Mi carrito", icono: ShoppingBag, detalle: piezas ? String(piezas) : undefined },
            { href: "/favoritos", texto: "Mis favoritos", icono: Heart, detalle: favoritos ? String(favoritos) : undefined, color: "text-rosa" },
            { href: "/vende", texto: "Vende en XICO", icono: Store },
          ]}
        />
        <Menu titulo="Más" opciones={ayuda} />
      </div>
    );
  }

  const nombre = usuario.displayName ?? usuario.phoneNumber ?? usuario.email ?? "Tu cuenta";

  return (
    <div className="grid gap-6">
      {/* Perfil */}
      <div className="flex items-center gap-4">
        <span className="grid size-16 shrink-0 place-items-center rounded-full bg-jade font-display text-2xl font-bold text-white">
          {nombre[0]?.toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl font-bold">Hola, {usuario.displayName?.split(" ")[0] ?? "bienvenido"}</p>
          <p className="truncate text-sm text-cafe">{usuario.email ?? usuario.phoneNumber}</p>
        </div>
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: "#pedidos", icono: Package, valor: misCompras.length, texto: "Pedidos" },
          { href: "/carrito", icono: ShoppingBag, valor: piezas, texto: "Carrito" },
          { href: "/favoritos", icono: Heart, valor: favoritos, texto: "Favoritos" },
        ].map((a) => (
          <Link key={a.texto} href={a.href} className="rounded-3xl bg-white p-4 text-center ring-1 ring-arena-oscura/60 transition hover:shadow-md">
            <a.icono className="mx-auto size-5 text-terracota" />
            <p className="mt-1 text-xl font-bold">{a.valor}</p>
            <p className="text-xs text-cafe">{a.texto}</p>
          </Link>
        ))}
      </div>

      <Menu
        titulo="Tu cuenta"
        opciones={[
          { href: "/mensajes", texto: "Mensajes", icono: MessageCircle, punto: hayMensajes },
          { href: "/panel", texto: "Mi tienda", icono: Store, detalle: "Vender" },
        ]}
      />

      <section id="pedidos" className="scroll-mt-40">
        <h2 className="mb-2 px-1 text-xs font-semibold tracking-wider text-cafe uppercase">Mis pedidos</h2>
        <div className="rounded-3xl bg-white p-4 ring-1 ring-arena-oscura/60 sm:p-6">
          {cargandoPedidos ? (
            <div className="h-20 animate-pulse rounded-2xl bg-arena" />
          ) : misCompras.length ? (
            <ListaPedidos pedidos={misCompras} />
          ) : (
            <p className="text-sm text-cafe">Aún no tienes pedidos.</p>
          )}
        </div>
      </section>

      <Menu titulo="Más" opciones={ayuda} />

      <button onClick={salir} className="flex h-12 items-center justify-center gap-2 rounded-full font-semibold text-rosa ring-1 ring-rosa/30 hover:bg-rosa/5">
        <LogOut className="size-4" /> Cerrar sesión
      </button>
    </div>
  );
}
