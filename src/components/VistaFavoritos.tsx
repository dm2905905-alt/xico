"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { useEnNavegador } from "@/lib/almacen";
import { useFavoritos } from "@/lib/favoritos";
import { TarjetaProducto } from "./TarjetaProducto";

export function VistaFavoritos() {
  const productos = useFavoritos();
  const listo = useEnNavegador();

  if (!listo) return <div className="h-64 animate-pulse rounded-3xl bg-arena" />;

  if (!productos.length) {
    return (
      <div className="rounded-3xl bg-white px-6 py-16 text-center ring-1 ring-arena-oscura/50">
        <Heart className="mx-auto size-12 text-cafe/50" />
        <h2 className="mt-4 font-display text-2xl font-semibold">Aún no tienes favoritos</h2>
        <p className="mt-1 text-cafe">Toca el corazón de cualquier producto para guardarlo aquí.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-terracota px-6 py-3 font-semibold text-crema hover:bg-terracota-oscura">
          Explorar productos
        </Link>
      </div>
    );
  }

  return (
    <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 *:mb-4 *:break-inside-avoid">
      {productos.map((p) => (
        <TarjetaProducto key={p.slug} producto={p} mosaico />
      ))}
    </div>
  );
}
