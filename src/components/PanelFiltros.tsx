"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { SlidersHorizontal, X } from "lucide-react";
import { categoriaPorSlug, categorias, estados } from "@/lib/datos";
import type { Filtros } from "@/lib/busqueda";

// Rangos de precio (mínimo y máximo)
const rangos = [
  { id: "0-99", min: undefined, max: 99, texto: "Hasta $99" },
  { id: "100-300", min: 100, max: 300, texto: "$100 a $300" },
  { id: "300-500", min: 300, max: 500, texto: "$300 a $500" },
  { id: "500-1000", min: 500, max: 1000, texto: "$500 a $1,000" },
  { id: "1000-", min: 1000, max: undefined, texto: "Más de $1,000" },
];
const rangoActual = (v: Filtros) => rangos.find((r) => r.min === v.min && r.max === v.max)?.id ?? "";

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
  function cambiar(clave: Clave, valor: string | number | boolean | undefined) {
    cambiarVarios({ [clave]: valor });
  }

  function cambiarVarios(cambios: Partial<Record<Clave, string | number | boolean | undefined>>) {
    const sig: Record<string, string> = {};
    for (const [k, v] of Object.entries(valores)) {
      if (fijos.includes(k as Clave) || v === undefined || v === false || v === "") continue;
      sig[k] = v === true ? "1" : String(v);
    }
    for (const [clave, valor] of Object.entries(cambios)) {
      if (valor === undefined || valor === false || valor === "") delete sig[clave];
      else sig[clave] = valor === true ? "1" : String(valor);
    }
    const qs = new URLSearchParams(sig).toString();
    iniciar(() => router.replace(qs ? `${ruta}?${qs}` : ruta, { scroll: false }));
  }

  const hayFiltros =
    (!fijos.includes("categoria") && valores.categoria) ||
    (!fijos.includes("estado") && valores.estado) ||
    valores.sub ||
    valores.min ||
    valores.max ||
    valores.calif ||
    valores.personalizable ||
    valores.ofertas;

  const selectCls =
    "h-10 w-full rounded-xl border border-arena-oscura bg-white px-3 text-sm outline-none focus:border-terracota focus:ring-2 focus:ring-terracota/15";

  const [hoja, setHoja] = useState(false);
  useEffect(() => {
    document.body.style.overflow = hoja ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [hoja]);

  const cuantos = [
    !fijos.includes("categoria") && valores.categoria,
    !fijos.includes("sub") && valores.sub,
    !fijos.includes("estado") && valores.estado,
    valores.min || valores.max,
    valores.calif,
  ].filter(Boolean).length;
  const categoriaElegida = valores.categoria ? categoriaPorSlug(valores.categoria) : undefined;

  const quitar = () =>
    iniciar(() => router.replace(valores.q && !fijos.includes("q") ? `${ruta}?q=${encodeURIComponent(valores.q)}` : ruta, { scroll: false }));

  // Listas desplegables (columna en computadora, ventana en celular)
  const selects = (
    <>
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
          <select className={selectCls} value={valores.categoria ?? ""} onChange={(e) => cambiarVarios({ categoria: e.target.value, sub: undefined })}>
            <option value="">Todas</option>
            {categorias.map((c) => (
              <option key={c.slug} value={c.slug}>{c.nombre}</option>
            ))}
          </select>
        </label>
      )}

      {categoriaElegida && !fijos.includes("sub") && (
        <label className="grid gap-1 text-xs font-semibold text-cafe">
          Tipo de producto
          <select className={selectCls} value={valores.sub ?? ""} onChange={(e) => cambiar("sub", e.target.value)}>
            <option value="">Todos</option>
            {categoriaElegida.subcategorias.map((sc) => (
              <option key={sc.slug} value={sc.slug}>{sc.nombre}</option>
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
        <select
          className={selectCls}
          value={rangoActual(valores)}
          onChange={(e) => {
            const r = rangos.find((x) => x.id === e.target.value);
            cambiarVarios({ min: r?.min, max: r?.max });
          }}
        >
          <option value="">Cualquier precio</option>
          {rangos.map((r) => (
            <option key={r.id} value={r.id}>{r.texto}</option>
          ))}
        </select>
      </label>

      <label className="grid gap-1 text-xs font-semibold text-cafe">
        Calificación
        <select className={selectCls} value={valores.calif ?? ""} onChange={(e) => cambiar("calif", e.target.value)}>
          <option value="">Cualquiera</option>
          <option value="4">4 estrellas o más</option>
          <option value="4.5">4.5 estrellas o más</option>
        </select>
      </label>
    </>
  );

  const chip = (activo: boolean) =>
    `flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium whitespace-nowrap ring-1 transition ${
      activo ? "bg-terracota text-white ring-terracota" : "bg-white ring-arena-oscura"
    }`;

  return (
    <div className={`transition-opacity ${cargando ? "opacity-60" : ""}`} aria-busy={cargando}>
      {/* Celular: botoncitos que se deslizan + ventana de filtros */}
      <div className="sin-barra -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
        <button type="button" onClick={() => setHoja(true)} className={chip(cuantos > 0)}>
          <SlidersHorizontal className="size-4" /> Filtros{cuantos > 0 && ` (${cuantos})`}
        </button>
        <button type="button" onClick={() => cambiar("personalizable", !valores.personalizable)} className={chip(!!valores.personalizable)}>
          ✍️ Personalizables
        </button>
        <button type="button" onClick={() => cambiar("ofertas", !valores.ofertas)} className={chip(!!valores.ofertas)}>
          🏷️ Ofertas
        </button>
        <button type="button" onClick={() => cambiar("calif", valores.calif ? undefined : 4.5)} className={chip(!!valores.calif)}>
          ⭐ 4.5+
        </button>
        {rangos.slice(0, 3).map((r) => {
          const activo = rangoActual(valores) === r.id;
          return (
            <button key={r.id} type="button" onClick={() => cambiarVarios(activo ? { min: undefined, max: undefined } : { min: r.min, max: r.max })} className={chip(activo)}>
              {r.texto}
            </button>
          );
        })}
        <button type="button" onClick={() => cambiar("orden", valores.orden === "vendidos" ? undefined : "vendidos")} className={chip(valores.orden === "vendidos")}>
          🔥 Más vendidos
        </button>
      </div>

      {hoja &&
        createPortal(
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtros">
            <div className="absolute inset-0 bg-tinta/40" onClick={() => setHoja(false)} />
            <div className="absolute inset-x-0 bottom-0 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-crema p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-xl">
              <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-arena-oscura" aria-hidden />
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display text-xl font-bold">Filtros</p>
                <button type="button" onClick={() => setHoja(false)} aria-label="Cerrar" className="grid size-10 place-items-center rounded-full hover:bg-arena">
                  <X className="size-5" />
                </button>
              </div>
              <div className="grid gap-4">{selects}</div>
              <div className="mt-6 flex gap-3">
                {hayFiltros && (
                  <button type="button" onClick={quitar} className="h-12 flex-1 rounded-full font-semibold text-terracota ring-1 ring-terracota/40">
                    Quitar filtros
                  </button>
                )}
                <button type="button" onClick={() => setHoja(false)} className="h-12 flex-1 rounded-full bg-terracota font-semibold text-white">
                  Ver resultados
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Computadora: columna de filtros */}
      <div className="hidden gap-4 lg:grid">
        <div className="grid gap-3">{selects}</div>
        <div className="flex flex-col gap-2">
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
          <button onClick={quitar} className="flex items-center gap-1 self-start text-sm font-semibold text-terracota hover:underline">
            <X className="size-4" /> Quitar filtros
          </button>
        )}
      </div>
    </div>
  );
}
