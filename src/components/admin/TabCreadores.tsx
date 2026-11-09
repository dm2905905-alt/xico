"use client";

import Link from "next/link";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { BadgeCheck, ExternalLink, Star } from "lucide-react";
import { estadoPorSlug, type Creador } from "@/lib/datos";
import { mensajeError, obtenerDb } from "@/lib/firebase";
import { precio } from "@/lib/formato";
import { cobrados, type DatosAdmin } from "./datos";

// Tiendas: otorgar o quitar insignias después de revisar su trabajo
export function TabCreadores({ datos }: { datos: DatosAdmin }) {
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState<"todas" | "pendientes" | "ejemplo">("todas");

  const ventasDe = (slug: string) =>
    cobrados(datos.pedidos)
      .flatMap((p) => p.grupos)
      .filter((g) => g.creador === slug)
      .reduce((s, g) => s + g.subtotal, 0);

  async function cambiar(c: Creador, campo: "verificado" | "top", valor: boolean) {
    const db = obtenerDb();
    if (!db) return;
    setError("");
    try {
      await updateDoc(doc(db, "creadores", c.slug), { [campo]: valor });
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  const lista = datos.creadores
    .filter((c) => (filtro === "pendientes" ? c.uid && !c.verificado : filtro === "ejemplo" ? !c.uid : true))
    .sort((a, b) => Number(!!b.uid) - Number(!!a.uid) || a.taller.localeCompare(b.taller));

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            ["todas", "Todas"],
            ["pendientes", "Por verificar"],
            ["ejemplo", "De ejemplo"],
          ] as const
        ).map(([id, texto]) => (
          <button key={id} onClick={() => setFiltro(id)} className={`rounded-full px-4 py-1.5 text-sm ${filtro === id ? "bg-tinta text-crema" : "bg-white ring-1 ring-arena-oscura"}`}>
            {texto}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa">{error}</p>}
      <p className="text-xs text-cafe">
        Antes de verificar, revisa su tienda: que sus productos se vean hechos a mano y no sean reventa. &quot;Top vendedor&quot; es para quien vende bien y cumple a tiempo.
      </p>

      <ul className="grid gap-3">
        {lista.map((c) => {
          const productos = datos.productos.filter((p) => p.creador === c.slug).length;
          return (
            <li key={c.slug} className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-arena-oscura/60">
              <span className="size-10 shrink-0 rounded-full" style={{ background: `linear-gradient(135deg, ${c.colores[0]}, ${c.colores[1]})` }} />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 font-semibold">
                  {c.taller}
                  {c.verificado && <BadgeCheck className="size-4 text-jade" />}
                  {!c.uid && <span className="rounded-full bg-arena px-2 py-0.5 text-[11px] font-normal text-cafe">ejemplo</span>}
                </p>
                <p className="truncate text-xs text-cafe">
                  {c.nombre || "Sin nombre"} · {estadoPorSlug(c.estado)?.nombre ?? "—"} · {productos} productos · vendió {precio(ventasDe(c.slug))}
                </p>
              </div>
              <Link href={`/creador/${c.slug}`} target="_blank" className="flex items-center gap-1 text-xs text-terracota hover:underline">
                Ver tienda <ExternalLink className="size-3.5" />
              </Link>
              <label className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 ring-arena-oscura has-checked:bg-jade/10 has-checked:ring-jade">
                <input type="checkbox" className="accent-jade" checked={c.verificado} onChange={(e) => cambiar(c, "verificado", e.target.checked)} />
                <BadgeCheck className="size-4 text-jade" /> Verificado
              </label>
              <label className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 ring-arena-oscura has-checked:bg-maiz/20 has-checked:ring-maiz">
                <input type="checkbox" className="accent-maiz" checked={c.top} onChange={(e) => cambiar(c, "top", e.target.checked)} />
                <Star className="size-4 text-maiz" /> Top vendedor
              </label>
            </li>
          );
        })}
        {!lista.length && <li className="text-sm text-cafe">No hay tiendas en esta lista.</li>}
      </ul>
    </div>
  );
}
