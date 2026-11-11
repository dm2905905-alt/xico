"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImagePlus, Loader2, X } from "lucide-react";
import type { Foto } from "@/lib/datos";
import { subirFoto } from "@/lib/fotos";

export const MAX_FOTOS = 6;

// Fotos de un producto: subir varias, ordenar (la primera es la portada) y quitar
export function EditorFotos({ fotos, cambiar, carpeta }: { fotos: Foto[]; cambiar: (f: Foto[]) => void; carpeta: string }) {
  const [subiendo, setSubiendo] = useState(0);
  const [error, setError] = useState("");

  async function elegir(archivos: FileList | null) {
    if (!archivos?.length) return;
    setError("");
    const lugar = MAX_FOTOS - fotos.length;
    const lista = Array.from(archivos).slice(0, lugar);
    if (archivos.length > lugar) setError(`Solo caben ${MAX_FOTOS} fotos por producto.`);
    setSubiendo(lista.length);
    let actuales = fotos;
    for (const archivo of lista) {
      try {
        const nueva = await subirFoto(archivo, carpeta);
        actuales = [...actuales, nueva];
        cambiar(actuales);
      } catch (e) {
        const msg = (e as { code?: string }).code === "storage/unauthorized" ? "No tienes permiso para subir fotos (¿ya se publicaron las reglas de fotos?)." : (e as Error).message;
        setError(msg || "No se pudo subir una foto.");
      } finally {
        setSubiendo((n) => n - 1);
      }
    }
  }

  const mover = (i: number, paso: -1 | 1) => {
    const j = i + paso;
    if (j < 0 || j >= fotos.length) return;
    const copia = [...fotos];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    cambiar(copia);
  };

  const boton = "grid size-7 place-items-center rounded-full bg-white/90 text-tinta shadow hover:bg-white";

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {fotos.map((f, i) => (
          <div key={f.ruta} className="group relative aspect-square overflow-hidden rounded-2xl bg-arena ring-1 ring-arena-oscura">
            {/* eslint-disable-next-line @next/next/no-img-element -- miniatura ya optimizada al subirla */}
            <img src={f.mini} alt={`Foto ${i + 1}`} className="size-full object-cover" />
            {i === 0 && <span className="absolute top-2 left-2 rounded-full bg-terracota px-2 py-0.5 text-[11px] font-bold text-white">Portada</span>}
            <div className="absolute inset-x-2 bottom-2 flex justify-between">
              <span className="flex gap-1">
                <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} className={`${boton} disabled:opacity-30`} aria-label="Mover a la izquierda">
                  <ChevronLeft className="size-4" />
                </button>
                <button type="button" onClick={() => mover(i, 1)} disabled={i === fotos.length - 1} className={`${boton} disabled:opacity-30`} aria-label="Mover a la derecha">
                  <ChevronRight className="size-4" />
                </button>
              </span>
              <button type="button" onClick={() => cambiar(fotos.filter((_, j) => j !== i))} className={`${boton} hover:text-rosa`} aria-label="Quitar foto">
                <X className="size-4" />
              </button>
            </div>
          </div>
        ))}

        {Array.from({ length: subiendo }, (_, i) => (
          <div key={`s${i}`} className="grid aspect-square place-items-center rounded-2xl bg-arena ring-1 ring-arena-oscura">
            <Loader2 className="size-6 animate-spin text-terracota" />
          </div>
        ))}

        {fotos.length + subiendo < MAX_FOTOS && (
          <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-terracota/40 bg-white/60 text-center text-sm text-terracota transition hover:bg-arena">
            <ImagePlus className="size-7" />
            <span className="font-semibold">Agregar fotos</span>
            <span className="text-[11px] text-cafe">
              {fotos.length}/{MAX_FOTOS}
            </span>
            <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => (elegir(e.target.files), (e.target.value = ""))} />
          </label>
        )}
      </div>
      {error && <p role="alert" className="mt-3 rounded-xl bg-rosa/10 px-4 py-2 text-sm text-rosa">{error}</p>}
      <p className="mt-3 text-xs text-cafe">
        Consejo: luz natural, fondo limpio y varias vistas (de frente, detalle, en uso). Se reducen solas para que la tienda cargue rápido.
      </p>
    </div>
  );
}
