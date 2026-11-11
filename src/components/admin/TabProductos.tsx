"use client";

import Link from "next/link";
import { useState } from "react";
import { deleteField, doc, updateDoc } from "firebase/firestore";
import { Eye, EyeOff, Search } from "lucide-react";
import { mensajeError, obtenerDb } from "@/lib/firebase";
import { precio } from "@/lib/formato";
import type { Producto } from "@/lib/datos";
import { FotoProducto } from "../FotoProducto";
import type { DatosAdmin } from "./datos";

const motivos = [
  "Parece reventa o producto importado",
  "Posible falsificación de marca",
  "Fotos o descripción engañosas",
  "Producto prohibido",
  "Otro motivo",
];

// Moderación: ocultar productos que no cumplen la regla "100% hecho por quien lo crea"
export function TabProductos({ datos }: { datos: DatosAdmin }) {
  const [q, setQ] = useState("");
  const [soloOcultos, setSoloOcultos] = useState(false);
  const [error, setError] = useState("");

  async function ocultar(p: Producto, motivo: string | null) {
    const db = obtenerDb();
    if (!db) return;
    setError("");
    try {
      await updateDoc(
        doc(db, "productos", p.slug),
        motivo ? { oculto: true, motivoOculto: motivo } : { oculto: deleteField(), motivoOculto: deleteField() },
      );
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  const texto = q.trim().toLowerCase();
  const lista = datos.productos
    .filter((p) => (!soloOcultos || p.oculto) && (!texto || `${p.nombre} ${p.taller}`.toLowerCase().includes(texto)))
    .sort((a, b) => Number(!!b.oculto) - Number(!!a.oculto) || a.nombre.localeCompare(b.nombre));

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="relative min-w-60 flex-1">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-cafe" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por producto o tienda" className="h-10 w-full rounded-full border border-arena-oscura bg-white pr-4 pl-9 text-sm" />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="accent-rosa" checked={soloOcultos} onChange={(e) => setSoloOcultos(e.target.checked)} /> Solo ocultos
        </label>
      </div>
      {error && <p role="alert" className="rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa">{error}</p>}

      <ul className="grid gap-2">
        {lista.map((p) => (
          <li key={p.slug} className={`flex flex-wrap items-center gap-4 rounded-2xl bg-white p-3 ring-1 ${p.oculto ? "ring-rosa/40" : "ring-arena-oscura/60"}`}>
            <div className={`w-14 shrink-0 overflow-hidden rounded-xl ${p.oculto ? "opacity-40" : ""}`}>
              <FotoProducto producto={p} uniforme />
            </div>
            <div className="min-w-0 flex-1">
              <Link href={`/producto/${p.slug}`} target="_blank" className="line-clamp-1 font-medium hover:text-terracota">{p.nombre}</Link>
              <p className="text-xs text-cafe">
                {p.taller} · {precio(p.precio)} · {p.vendidos} vendidos
              </p>
              {p.oculto && <p className="mt-1 text-xs text-rosa">🚫 Oculto: {p.motivoOculto}</p>}
            </div>
            {p.oculto ? (
              <button onClick={() => ocultar(p, null)} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm ring-1 ring-arena-oscura hover:bg-arena">
                <Eye className="size-4" /> Volver a mostrar
              </button>
            ) : (
              <label className="flex items-center gap-1.5 text-sm">
                <EyeOff className="size-4 text-rosa" />
                <select
                  value=""
                  onChange={(e) => e.target.value && ocultar(p, e.target.value)}
                  className="h-9 rounded-full border border-arena-oscura bg-white px-3 text-sm"
                  aria-label={`Ocultar ${p.nombre}`}
                >
                  <option value="">Ocultar por…</option>
                  {motivos.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </label>
            )}
          </li>
        ))}
        {!lista.length && <li className="text-sm text-cafe">No hay productos con ese filtro.</li>}
      </ul>
      <p className="text-xs text-cafe">Ocultar no borra el producto: deja de verse en la tienda (en 1 a 2 minutos) y el creador ve el motivo en su panel.</p>
    </div>
  );
}
