"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, ImagePlus, Loader2, ShoppingBag, X } from "lucide-react";
import { agregarAlCarrito } from "@/lib/carrito";
import { aTarjeta, type Producto } from "@/lib/datos";
import { precio as formatoPrecio } from "@/lib/formato";
import { comprimirImagen } from "@/lib/imagen";

type Valores = Record<string, string | boolean>;

export function Personalizador({ producto }: { producto: Producto }) {
  const precioBase = producto.precio;
  const opciones = producto.personalizacion ?? [];
  const colorInicial = () =>
    Object.fromEntries(opciones.flatMap((o) => (o.tipo === "colores" ? [[o.id, o.opciones[0].nombre]] : [])));

  const [valores, setValores] = useState<Valores>(colorInicial);
  const [fotos, setFotos] = useState<Record<string, string>>({}); // imágenes comprimidas
  const [procesando, setProcesando] = useState<string | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [errores, setErrores] = useState<string[]>([]);
  const [agregado, setAgregado] = useState(false);

  const extras = opciones.reduce((s, o) => s + (o.tipo === "extra" && valores[o.id] ? o.precio : 0), 0);
  const total = (precioBase + extras) * cantidad;

  const poner = (id: string, v: string | boolean) => {
    setValores((prev) => ({ ...prev, [id]: v }));
    setErrores((prev) => prev.filter((e) => e !== id));
    setAgregado(false);
  };

  async function elegirFoto(id: string, archivo?: File) {
    if (!archivo) return;
    setProcesando(id);
    try {
      const url = await comprimirImagen(archivo);
      setFotos((prev) => ({ ...prev, [id]: url }));
      poner(id, archivo.name);
    } catch {
      setErrores((prev) => [...prev, id]);
    } finally {
      setProcesando(null);
    }
  }

  function quitarFoto(id: string) {
    setFotos((prev) => {
      const resto = { ...prev };
      delete resto[id];
      return resto;
    });
    poner(id, "");
  }

  function agregar() {
    const faltan = opciones
      .filter((o) => (o.tipo === "texto" || o.tipo === "foto") && o.requerido && !String(valores[o.id] ?? "").trim())
      .map((o) => o.id);
    setErrores(faltan);
    if (faltan.length) return;

    // Resumen legible de lo que eligió el comprador
    const elegidas = opciones.flatMap((o) => {
      const v = valores[o.id];
      if (!v) return [];
      if (o.tipo === "extra") return [{ etiqueta: o.etiqueta.replace(/^¿|\?$/g, ""), valor: `+${formatoPrecio(o.precio)}` }];
      if (o.tipo === "foto") return [{ etiqueta: o.etiqueta.replace(/ \(opcional\)$/, ""), valor: "Foto adjunta" }];
      const texto = String(v).trim();
      return texto ? [{ etiqueta: o.etiqueta.replace(/ \(opcional\)$/, ""), valor: texto }] : [];
    });

    agregarAlCarrito({
      producto: { ...aTarjeta(producto), creador: producto.creador },
      cantidad,
      extras,
      extrasIds: opciones.filter((o) => o.tipo === "extra" && valores[o.id]).map((o) => o.id),
      opciones: elegidas,
      foto: Object.values(fotos)[0],
    });
    setAgregado(true);
  }

  const inputCls =
    "h-11 w-full rounded-xl border bg-white px-3.5 text-sm outline-none focus:border-terracota focus:ring-2 focus:ring-terracota/15";

  return (
    <div className="grid gap-5">
      {opciones.length > 0 && (
        <fieldset className="grid gap-5 rounded-2xl bg-white p-5 ring-1 ring-arena-oscura/60">
          <legend className="sr-only">Personaliza tu pieza</legend>
          <p className="font-display text-lg font-semibold">✍️ Personaliza tu pieza</p>

          {opciones.map((o) => {
            const conError = errores.includes(o.id);
            switch (o.tipo) {
              case "texto":
                return (
                  <label key={o.id} className="grid gap-1.5 text-sm font-medium">
                    <span>
                      {o.etiqueta} {o.requerido && <span className="text-rosa">*</span>}
                    </span>
                    <input
                      type="text"
                      maxLength={o.max}
                      value={String(valores[o.id] ?? "")}
                      onChange={(e) => poner(o.id, e.target.value)}
                      className={`${inputCls} ${conError ? "border-rosa" : "border-arena-oscura"}`}
                      aria-invalid={conError}
                    />
                    <span className="flex justify-between text-xs font-normal text-cafe">
                      <span>{conError ? <span className="text-rosa">Este dato es necesario</span> : o.ayuda}</span>
                      <span>{String(valores[o.id] ?? "").length}/{o.max}</span>
                    </span>
                  </label>
                );

              case "colores":
                return (
                  <div key={o.id} className="grid gap-2 text-sm font-medium">
                    <span>
                      {o.etiqueta}: <span className="font-normal text-cafe">{String(valores[o.id])}</span>
                    </span>
                    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={o.etiqueta}>
                      {o.opciones.map((c) => {
                        const activo = valores[o.id] === c.nombre;
                        return (
                          <button
                            key={c.nombre}
                            type="button"
                            role="radio"
                            aria-checked={activo}
                            aria-label={c.nombre}
                            title={c.nombre}
                            onClick={() => poner(o.id, c.nombre)}
                            className={`grid size-9 place-items-center rounded-full ring-offset-2 transition ${activo ? "ring-2 ring-tinta" : "hover:scale-110"}`}
                            style={{ backgroundColor: c.hex }}
                          >
                            {activo && <Check className="size-4 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );

              case "foto":
                return (
                  <div key={o.id} className="grid gap-1.5 text-sm font-medium">
                    <span>
                      {o.etiqueta} {o.requerido && <span className="text-rosa">*</span>}
                    </span>
                    {fotos[o.id] ? (
                      <div className="flex items-center gap-3 rounded-xl border border-arena-oscura p-2">
                        {/* eslint-disable-next-line @next/next/no-img-element -- vista previa local del archivo elegido */}
                        <img src={fotos[o.id]} alt="Vista previa" className="size-16 rounded-lg object-cover" />
                        <span className="flex-1 truncate text-xs font-normal text-cafe">{String(valores[o.id])}</span>
                        <button type="button" onClick={() => quitarFoto(o.id)} aria-label="Quitar foto" className="grid size-8 place-items-center rounded-full hover:bg-arena">
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <label
                        className={`flex cursor-pointer flex-col items-center gap-1 rounded-xl border-2 border-dashed px-4 py-5 text-center font-normal transition hover:bg-arena/50 ${
                          conError ? "border-rosa" : "border-arena-oscura"
                        }`}
                      >
                        {procesando === o.id ? <Loader2 className="size-6 animate-spin text-terracota" /> : <ImagePlus className="size-6 text-terracota" />}
                        <span className="text-sm">{procesando === o.id ? "Preparando foto…" : "Toca para subir una foto"}</span>
                        <span className="text-xs text-cafe">
                          {conError ? <span className="text-rosa">Sube una foto (JPG o PNG)</span> : o.ayuda}
                        </span>
                        <input type="file" accept="image/*" className="sr-only" onChange={(e) => elegirFoto(o.id, e.target.files?.[0])} />
                      </label>
                    )}
                  </div>
                );

              case "extra":
                return (
                  <label
                    key={o.id}
                    className="flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-arena-oscura px-4 py-3 text-sm has-checked:border-terracota has-checked:bg-terracota/5"
                  >
                    <span className="flex items-center gap-3">
                      <input type="checkbox" className="size-4 accent-terracota" checked={!!valores[o.id]} onChange={(e) => poner(o.id, e.target.checked)} />
                      {o.etiqueta}
                    </span>
                    <span className="font-semibold text-terracota">+{formatoPrecio(o.precio)}</span>
                  </label>
                );
            }
          })}
        </fieldset>
      )}

      {/* Compra: en celular queda fija abajo de la pantalla (como en una app) */}
      <div className="h-24 md:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-arena-oscura/70 bg-crema/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:static md:z-auto md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
        {errores.length > 0 && (
          <p className="mb-2 rounded-xl bg-rosa/10 px-4 py-2.5 text-sm text-rosa" role="alert">
            Te falta llenar los campos marcados para que el creador pueda hacer tu pieza.
          </p>
        )}
        {agregado && (
          <div className="mb-2 flex items-center justify-between gap-3 rounded-xl bg-jade/10 px-4 py-2 text-sm text-jade" role="status">
            <span className="flex items-center gap-2 font-medium">
              <Check className="size-4" /> Agregado a tu carrito
            </span>
            <Link href="/carrito" className="rounded-full bg-jade px-4 py-1.5 font-semibold text-white hover:bg-jade/90">
              Ver carrito
            </Link>
          </div>
        )}
        <div className="flex items-center gap-3 md:flex-wrap md:gap-4">
          <div className="flex h-12 shrink-0 items-center rounded-full border border-arena-oscura bg-white">
            <button type="button" onClick={() => { setCantidad((c) => Math.max(1, c - 1)); setAgregado(false); }} className="size-10 rounded-full text-lg hover:bg-arena md:size-12" aria-label="Quitar uno">−</button>
            <span className="w-6 text-center font-semibold md:w-8" aria-live="polite">{cantidad}</span>
            <button type="button" onClick={() => { setCantidad((c) => Math.min(20, c + 1)); setAgregado(false); }} className="size-10 rounded-full text-lg hover:bg-arena md:size-12" aria-label="Agregar uno">+</button>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-cafe">Total</p>
            <p className="text-lg font-bold md:text-2xl" aria-live="polite">{formatoPrecio(total)}</p>
          </div>
          <button
            type="button"
            onClick={agregar}
            disabled={!!procesando}
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-terracota px-4 text-sm font-semibold text-crema transition hover:bg-terracota-oscura disabled:opacity-60 md:h-14 md:basis-full md:text-base"
          >
            <ShoppingBag className="size-5 shrink-0" /> <span className="truncate">Agregar al carrito</span>
          </button>
        </div>
      </div>
    </div>
  );
}
