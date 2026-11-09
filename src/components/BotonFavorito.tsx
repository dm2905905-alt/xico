"use client";

import { Heart } from "lucide-react";
import type { ProductoTarjeta } from "@/lib/datos";
import { alternarFavorito, useFavoritos } from "@/lib/favoritos";

export function BotonFavorito({
  producto,
  grande = false,
  className = "",
}: {
  producto: ProductoTarjeta;
  grande?: boolean;
  className?: string;
}) {
  const activo = useFavoritos().some((f) => f.slug === producto.slug);
  return (
    <button
      type="button"
      onClick={() => alternarFavorito(producto)}
      aria-pressed={activo}
      aria-label={activo ? "Quitar de favoritos" : "Guardar en favoritos"}
      className={`grid place-items-center rounded-full bg-white/90 shadow-sm backdrop-blur transition hover:scale-110 ${grande ? "size-12" : "size-9"} ${className}`}
    >
      <Heart className={`${grande ? "size-6" : "size-4.5"} ${activo ? "fill-rosa text-rosa" : "text-tinta"}`} />
    </button>
  );
}
