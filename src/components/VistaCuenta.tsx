"use client";

import Link from "next/link";
import { Heart, LogOut, Package, ShoppingBag } from "lucide-react";
import { useCarrito } from "@/lib/carrito";
import { useFavoritos } from "@/lib/favoritos";
import { usePedidosDe } from "@/lib/usar-pedidos";
import { FormularioEntrar } from "./FormularioEntrar";
import { ListaPedidos } from "./ListaPedidos";
import { useSesion } from "./Sesion";

export function VistaCuenta() {
  const { usuario, cargando, salir } = useSesion();
  const piezas = useCarrito().reduce((s, a) => s + a.cantidad, 0);
  const favoritos = useFavoritos().length;
  const { pedidos, cargando: cargandoPedidos } = usePedidosDe(usuario?.uid);
  const misCompras = pedidos.filter((p) => p.uid === usuario?.uid);

  if (cargando) return <div className="h-48 animate-pulse rounded-3xl bg-arena" />;

  if (!usuario) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60 sm:p-8">
        <h2 className="font-display text-2xl font-semibold">Entra a tu cuenta</h2>
        <p className="mt-1 mb-6 text-sm text-cafe">Para ver tus pedidos y pagar más rápido.</p>
        <FormularioEntrar volver="/cuenta" />
      </div>
    );
  }

  const nombre = usuario.displayName ?? usuario.phoneNumber ?? usuario.email ?? "Tu cuenta";

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-center gap-4 rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60">
        <span className="grid size-16 place-items-center rounded-full bg-jade font-display text-2xl font-bold text-white">
          {nombre[0]?.toUpperCase()}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-2xl font-semibold">Hola, {usuario.displayName?.split(" ")[0] ?? "bienvenido"}</p>
          <p className="truncate text-sm text-cafe">{usuario.email ?? usuario.phoneNumber}</p>
        </div>
        <button onClick={salir} className="flex items-center gap-2 rounded-full border border-arena-oscura px-4 py-2 text-sm font-medium hover:bg-arena">
          <LogOut className="size-4" /> Salir
        </button>
      </div>

      <Link href="/panel" className="flex items-center justify-between gap-4 rounded-3xl bg-terracota p-6 text-crema transition hover:bg-terracota-oscura">
        <span>
          <span className="block font-display text-xl font-semibold">Mi tienda</span>
          <span className="text-sm text-crema/85">Vende tus productos hechos a mano en XICO</span>
        </span>
        <span aria-hidden className="text-2xl">→</span>
      </Link>

      <div className="grid gap-4 sm:grid-cols-3">
        <a href="#pedidos" className="rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60 transition hover:shadow-md">
          <Package className="size-6 text-terracota" />
          <p className="mt-3 font-semibold">Mis pedidos</p>
          <p className="text-sm text-cafe">{misCompras.length} {misCompras.length === 1 ? "pedido" : "pedidos"}</p>
        </a>
        <Link href="/carrito" className="rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60 transition hover:shadow-md">
          <ShoppingBag className="size-6 text-terracota" />
          <p className="mt-3 font-semibold">Mi carrito</p>
          <p className="text-sm text-cafe">{piezas} {piezas === 1 ? "pieza" : "piezas"}</p>
        </Link>
        <Link href="/favoritos" className="rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60 transition hover:shadow-md">
          <Heart className="size-6 text-rosa" />
          <p className="mt-3 font-semibold">Mis favoritos</p>
          <p className="text-sm text-cafe">{favoritos} guardados</p>
        </Link>
      </div>

      <section id="pedidos" className="scroll-mt-40 rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60">
        <h2 className="mb-2 font-display text-xl font-semibold">Mis pedidos</h2>
        {cargandoPedidos ? (
          <div className="h-20 animate-pulse rounded-2xl bg-arena" />
        ) : misCompras.length ? (
          <ListaPedidos pedidos={misCompras} />
        ) : (
          <p className="text-sm text-cafe">Aún no tienes pedidos.</p>
        )}
      </section>
    </div>
  );
}
