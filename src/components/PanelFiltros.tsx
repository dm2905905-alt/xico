"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { X } from "lucide-react";
import { categorias, estados } from "@/lib/datos";
import type { Filtros } from "@/lib/busqueda";

const precios = [
  { valor: 99, texto: "Hasta $99" },
  { valor: 300, texto: "Hasta $300" },
  { valor: 500, texto: "Hasta $500" },
  { valor: 1000, texto: "Hasta $1,000" },
];

const ordenes = [
  { valor: "relevancia", texto: "Relevancia" },
  { valor: "vendidos", texto: "Más vendidos" },
  { valor: "nuevos", texto: "Más nuevos" },
  { valor: "precio-asc", texto: "Precio: menor a mayor" },
  { valor: "precio-desc", texto: "Precio: mayor a menor" },
  { valor: "calificacion", texto: "Mejor calificados" },
];

type Clave = keyof Filtros;

export function PanelFiltros({
  valores,
  ruta,
  fijos = [],
}: {
  valores: Filtros;
  ruta: string; // página donde se aplican los filtros
  fijos?: Clave[]; // filtros que ya define la página (ej. la categoría)
}) {
  const router = useRouter();
  const [cargando, iniciar] = useTransition();

  // Actualiza la URL con el filtro cambiado; la página vuelve a calcular resultados
  function cambiar(clave: Clave, valor: string | boolean | undefined) {
    const sig: Record<string, string> = {};
    for (const [k, v] of Object.entries(valores)) {
      if (fijos.includes(k as Clave) || v === undefined || v === false || v === "") continue;
      sig[k] = v === true ? "1" : String(v);
    }
    if (valor === undefined || valor === false || valor === "") delete sig[clave];
    else sig[clave] = valor === true ? "1" : String(valor);
    const qs = new URLSearchParams(sig).toString();
    iniciar(() => router.replace(qs ? `${ruta}?${qs}` : ruta, { scroll: false }));
  }

  const hayFiltros =
    (!fijos.includes("categoria") && valores.categoria) ||
    (!fijos.includes("estado") && valores.estado) ||
    valores.max ||
    valores.personalizable ||
    valores.ofertas;

  const selectCls =
    "h-10 w-full rounded-xl border border-arena-oscura bg-white px-3 text-sm outline-none focus:border-terracota focus:ring-2 focus:ring-terracota/15";

  return (
    <div className={`grid gap-4 transition-opacity ${cargando ? "opacity-60" : ""}`} aria-busy={cargando}>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
        <label className="grid gap-1 text-xs font-semibold text-cafe">
          Ordenar por
          <select className={selectCls} value={valores.orden ?? "relevancia"} onChange={(e) => cambiar("orden", e.target.value === "relevancia" ? undefined : e.target.value)}>
            {ordenes.map((o) => (
              <option key={o.valor} value={o.valor}>{o.texto}</option>
            ))}
          </select>
        </label>

        {!fijos.includes("categoria") && (
          <label className="grid gap-1 text-xs font-semibold text-cafe">
            Categoría
            <select className={selectCls} value={valores.categoria ?? ""} onChange={(e) => cambiar("categoria", e.target.value)}>
              <option value="">Todas</option>
              {categorias.map((c) => (
                <option key={c.slug} value={c.slug}>{c.nombre}</option>
              ))}
            </select>
          </label>
        )}

        {!fijos.includes("estado") && (
          <label className="grid gap-1 text-xs font-semibold text-cafe">
            Estado
            <select className={selectCls} value={valores.estado ?? ""} onChange={(e) => cambiar("estado", e.target.value)}>
              <option value="">Todo México</option>
              {estados.map((e) => (
                <option key={e.slug} value={e.slug}>{e.nombre}</option>
              ))}
            </select>
          </label>
        )}

        <label className="grid gap-1 text-xs font-semibold text-cafe">
          Presupuesto
          <select className={selectCls} value={valores.max ?? ""} onChange={(e) => cambiar("max", e.target.value)}>
            <option value="">Cualquier precio</option>
            {precios.map((p) => (
              <option key={p.valor} value={p.valor}>{p.texto}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2 lg:flex-col">
        <label className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-2 text-sm ring-1 ring-arena-oscura has-checked:bg-terracota/10 has-checked:ring-terracota">
          <input type="checkbox" className="accent-terracota" checked={!!valores.personalizable} onChange={(e) => cambiar("personalizable", e.target.checked)} />
          ✍️ Solo personalizables
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-full bg-white px-3 py-2 text-sm ring-1 ring-arena-oscura has-checked:bg-rosa/10 has-checked:ring-rosa">
          <input type="checkbox" className="accent-rosa" checked={!!valores.ofertas} onChange={(e) => cambiar("ofertas", e.target.checked)} />
          🏷️ Solo ofertas
        </label>
      </div>

      {hayFiltros && (
        <button
          onClick={() => iniciar(() => router.replace(valores.q && !fijos.includes("q") ? `${ruta}?q=${encodeURIComponent(valores.q)}` : ruta, { scroll: false }))}
          className="flex items-center gap-1 self-start text-sm font-semibold text-terracota hover:underline"
        >
          <X className="size-4" /> Quitar filtros
        </button>
      )}
    </div>
  );
}
