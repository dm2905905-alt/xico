"use client";

import { useState } from "react";
import { ImagePlus, Loader2, Plus, Trash2, X } from "lucide-react";
import { crearPropuesta, type Conversacion } from "@/lib/chat";
import { ocultarContacto } from "@/lib/contacto";
import type { Foto } from "@/lib/datos";
import { subirFoto } from "@/lib/fotos";

const sugerencias = ["Modelo de teléfono", "Diseño", "Colores", "Nombre o frase", "Talla", "Medidas", "Cantidad"];
const tiempos = ["1 a 3 días", "3 a 5 días", "5 a 7 días", "7 a 10 días", "10 a 15 días", "15 a 30 días"];

// El vendedor arma la propuesta personalizada que el cliente aceptará y pagará por XICO
export function FormularioPropuesta({ c, uid, cerrar }: { c: Conversacion; uid: string; cerrar: () => void }) {
  const [titulo, setTitulo] = useState("");
  const [detalles, setDetalles] = useState<{ etiqueta: string; valor: string }[]>([{ etiqueta: "Modelo de teléfono", valor: "" }]);
  const [foto, setFoto] = useState<Foto | undefined>();
  const [precioTexto, setPrecioTexto] = useState("");
  const [dias, setDias] = useState("3 a 5 días");
  const [subiendo, setSubiendo] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  const precio = Number(precioTexto);

  async function elegirFoto(archivo?: File) {
    if (!archivo) return;
    setSubiendo(true);
    setError("");
    try {
      setFoto(await subirFoto(archivo, `chats/${c.id}`));
    } catch (e) {
      setError((e as Error).message || "No se pudo subir la imagen.");
    } finally {
      setSubiendo(false);
    }
  }

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (titulo.trim().length < 3) return setError("Escribe un título para la propuesta.");
    if (!(precio > 0 && precio <= 200000)) return setError("Pon un precio válido.");
    if (ocultarContacto(titulo).encontrados.length) return setError("El título no puede llevar datos de contacto.");
    setOcupado(true);
    setError("");
    try {
      await crearPropuesta(c, uid, { titulo: titulo.trim(), detalles, foto, precio, diasElaboracion: dias });
      cerrar();
    } catch {
      setError("No se pudo enviar la propuesta. Inténtalo de nuevo.");
      setOcupado(false);
    }
  }

  const campo = "h-10 w-full rounded-xl border border-arena-oscura bg-white px-3 text-sm outline-none focus:border-terracota";

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-tinta/40 p-0 sm:place-items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Crear propuesta">
      <form onSubmit={enviar} className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:max-w-lg sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">📝 Nueva propuesta</h2>
          <button type="button" onClick={cerrar} className="grid size-9 place-items-center rounded-full hover:bg-arena" aria-label="Cerrar">
            <X className="size-5" />
          </button>
        </div>
        <p className="mb-4 text-sm text-cafe">
          Para {c.compradorNombre}. Cuando la acepte, pagará por XICO y te llegará como pedido con su dirección de envío.
        </p>

        <div className="grid gap-4">
          <label className="grid gap-1 text-sm font-medium">
            Título
            <input className={campo} maxLength={120} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Funda pintada a mano con tu mascota" />
          </label>

          <div className="grid gap-2 text-sm font-medium">
            Detalles
            {detalles.map((d, i) => (
              <div key={i} className="flex gap-2">
                <input className={`${campo} w-2/5`} maxLength={40} value={d.etiqueta} onChange={(e) => setDetalles((x) => x.map((y, j) => (j === i ? { ...y, etiqueta: e.target.value } : y)))} placeholder="Ej. Modelo" />
                <input className={campo} maxLength={200} value={d.valor} onChange={(e) => setDetalles((x) => x.map((y, j) => (j === i ? { ...y, valor: e.target.value } : y)))} placeholder="Ej. iPhone 15 Pro" />
                <button type="button" onClick={() => setDetalles((x) => x.filter((_, j) => j !== i))} className="grid size-10 shrink-0 place-items-center rounded-full text-cafe hover:bg-rosa/10 hover:text-rosa" aria-label="Quitar detalle">
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
            <div className="flex flex-wrap gap-1.5">
              {sugerencias
                .filter((s) => !detalles.some((d) => d.etiqueta === s))
                .map((s) => (
                  <button key={s} type="button" onClick={() => setDetalles((x) => [...x, { etiqueta: s, valor: "" }])} className="flex items-center gap-1 rounded-full bg-arena px-2.5 py-1 text-xs font-normal hover:bg-arena-oscura">
                    <Plus className="size-3" /> {s}
                  </button>
                ))}
            </div>
          </div>

          <div className="grid gap-1 text-sm font-medium">
            Imagen del diseño
            {foto ? (
              <div className="relative w-40 overflow-hidden rounded-2xl ring-1 ring-arena-oscura">
                {/* eslint-disable-next-line @next/next/no-img-element -- miniatura ya reducida */}
                <img src={foto.mini} alt="Diseño" className="aspect-square w-full object-cover" />
                <button type="button" onClick={() => setFoto(undefined)} className="absolute top-2 right-2 grid size-7 place-items-center rounded-full bg-white/90" aria-label="Quitar imagen">
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <label className="flex h-28 w-40 cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-terracota/40 text-xs text-terracota hover:bg-arena">
                {subiendo ? <Loader2 className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
                {subiendo ? "Subiendo…" : "Agregar imagen"}
                <input type="file" accept="image/*" className="sr-only" disabled={subiendo} onChange={(e) => (elegirFoto(e.target.files?.[0]), (e.target.value = ""))} />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1 text-sm font-medium">
              Precio (MXN)
              <input className={campo} type="number" inputMode="numeric" min={1} max={200000} value={precioTexto} onChange={(e) => setPrecioTexto(e.target.value)} placeholder="450" />
            </label>
            <label className="grid gap-1 text-sm font-medium">
              Tiempo de elaboración
              <select className={campo} value={dias} onChange={(e) => setDias(e.target.value)}>
                {tiempos.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <p className="text-xs text-cafe">El envío se calcula solo ($99, gratis desde $999). Recibes el precio menos 15% de comisión, más el envío.</p>

          {error && <p role="alert" className="rounded-xl bg-rosa/10 px-4 py-2 text-sm text-rosa">{error}</p>}

          <button type="submit" disabled={ocupado || subiendo} className="degradado-xico flex h-12 items-center justify-center gap-2 rounded-full font-semibold text-white disabled:opacity-60">
            {ocupado && <Loader2 className="size-5 animate-spin" />} Enviar propuesta
          </button>
        </div>
      </form>
    </div>
  );
}
