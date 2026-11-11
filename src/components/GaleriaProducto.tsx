"use client";

import { useState } from "react";
import type { Producto } from "@/lib/datos";
import { FotoProducto } from "./FotoProducto";

// Foto grande + miniaturas para cambiar entre las fotos del producto
export function GaleriaProducto({ producto }: { producto: Pick<Producto, "nombre" | "colores" | "forma" | "categoria" | "fotos"> }) {
  const fotos = producto.fotos ?? [];
  const [i, setI] = useState(0);

  if (!fotos.length) return <FotoProducto producto={producto} uniforme />;

  const actual = fotos[Math.min(i, fotos.length - 1)];
  return (
    <div>
      <div className="relative aspect-square overflow-hidden bg-arena">
        {/* eslint-disable-next-line @next/next/no-img-element -- foto ya reducida al subirla */}
        <img src={actual.url} alt={`${producto.nombre}, foto ${i + 1} de ${fotos.length}`} className="absolute inset-0 size-full object-cover" />
      </div>
      {fotos.length > 1 && (
        <div className="flex gap-2 bg-white/70 p-2">
          {fotos.map((f, j) => (
            <button
              key={f.ruta}
              type="button"
              onClick={() => setI(j)}
              aria-label={`Ver foto ${j + 1}`}
              aria-current={j === i}
              className={`size-16 shrink-0 overflow-hidden rounded-xl ring-2 transition ${j === i ? "ring-terracota" : "ring-transparent opacity-70 hover:opacity-100"}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- miniatura ya reducida */}
              <img src={f.mini} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
