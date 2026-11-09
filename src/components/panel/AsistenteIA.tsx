"use client";

import { useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";
import { categoriaPorSlug, type CategoriaSlug } from "@/lib/datos";
import { precio } from "@/lib/formato";
import type { DatosProducto } from "@/lib/panel";
import { useSesion } from "../Sesion";

type Propuesta = {
  nombre: string;
  descripcion: string;
  materiales: string;
  categoria: CategoriaSlug;
  precioSugerido: number;
  precioMin: number;
  precioMax: number;
  razonPrecio: string;
};

// El creador describe su producto con sus palabras y la IA propone cómo publicarlo
export function AsistenteIA({ aplicar }: { aplicar: (cambios: Partial<DatosProducto>) => void }) {
  const { usuario } = useSesion();
  const [idea, setIdea] = useState("");
  const [propuesta, setPropuesta] = useState<Propuesta | null>(null);
  const [usados, setUsados] = useState<string[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  async function pedir() {
    if (!usuario) return;
    setOcupado(true);
    setError("");
    try {
      const r = await fetch("/api/ia/producto", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await usuario.getIdToken()}` },
        body: JSON.stringify({ idea }),
      });
      const datos = await r.json();
      if (!r.ok) throw new Error(datos.error ?? "La IA no pudo responder.");
      setPropuesta(datos);
      setUsados([]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  const usar = (clave: string, cambios: Partial<DatosProducto>) => {
    aplicar(cambios);
    setUsados((u) => [...u, clave]);
  };

  const botonUsar = (clave: string, cambios: Partial<DatosProducto>, texto = "Usar") => (
    <button
      type="button"
      onClick={() => usar(clave, cambios)}
      disabled={usados.includes(clave)}
      className="flex shrink-0 items-center gap-1 rounded-full bg-tinta px-3 py-1 text-xs font-semibold text-crema hover:bg-tinta/85 disabled:bg-jade"
    >
      {usados.includes(clave) ? <><Check className="size-3.5" /> Listo</> : texto}
    </button>
  );

  return (
    <section className="rounded-3xl bg-gradient-to-br from-rosa/10 via-maiz/10 to-jade/10 p-5 ring-1 ring-rosa/20 sm:p-6">
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
        <Sparkles className="size-5 text-rosa" /> Asistente con IA
      </h2>
      <p className="mt-1 text-sm text-cafe">
        Cuéntale tu producto como se lo contarías a un cliente. Te propone título, descripción y un precio justo; tú decides qué usar.
      </p>
      <textarea
        value={idea}
        onChange={(e) => setIdea(e.target.value)}
        maxLength={800}
        placeholder="Ej. Taza de barro de 350 ml pintada a mano con flores de colores, la hago en mi taller en Puebla, se puede poner el nombre que quieran"
        className="mt-3 h-24 w-full rounded-xl border border-arena-oscura bg-white px-3.5 py-2.5 text-sm outline-none focus:border-rosa focus:ring-2 focus:ring-rosa/15"
      />
      <button
        type="button"
        onClick={pedir}
        disabled={ocupado || idea.trim().length < 8}
        className="mt-2 flex items-center gap-2 rounded-full bg-rosa px-5 py-2.5 text-sm font-semibold text-white hover:bg-rosa/90 disabled:opacity-50"
      >
        {ocupado ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
        {ocupado ? "Escribiendo…" : propuesta ? "Pedir otra propuesta" : "Redactar con IA"}
      </button>

      {error && <p role="alert" className="mt-3 rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa">{error}</p>}

      {propuesta && (
        <div className="mt-4 grid gap-3 rounded-2xl bg-white p-4 text-sm ring-1 ring-arena-oscura/60">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-cafe uppercase">Título</p>
              <p className="font-medium">{propuesta.nombre}</p>
            </div>
            {botonUsar("nombre", { nombre: propuesta.nombre })}
          </div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-cafe uppercase">Descripción</p>
              <p className="text-tinta/85">{propuesta.descripcion}</p>
            </div>
            {botonUsar("descripcion", { descripcion: propuesta.descripcion })}
          </div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-cafe uppercase">Materiales y categoría</p>
              <p>{propuesta.materiales} · {categoriaPorSlug(propuesta.categoria)?.nombre}</p>
            </div>
            {botonUsar("detalles", { materiales: propuesta.materiales, categoria: propuesta.categoria })}
          </div>
          <div className="flex items-start justify-between gap-3 rounded-xl bg-maiz/15 p-3">
            <div>
              <p className="text-xs font-semibold text-cafe uppercase">Precio sugerido</p>
              <p className="text-lg font-bold">{precio(propuesta.precioSugerido)}</p>
              <p className="text-xs text-cafe">
                Rango razonable: {precio(propuesta.precioMin)} a {precio(propuesta.precioMax)}. {propuesta.razonPrecio}
              </p>
            </div>
            {botonUsar("precio", { precio: propuesta.precioSugerido })}
          </div>
          <button
            type="button"
            onClick={() => {
              aplicar({ nombre: propuesta.nombre, descripcion: propuesta.descripcion, materiales: propuesta.materiales, categoria: propuesta.categoria, precio: propuesta.precioSugerido });
              setUsados(["nombre", "descripcion", "detalles", "precio"]);
            }}
            className="justify-self-start rounded-full border border-tinta px-4 py-1.5 text-xs font-semibold hover:bg-arena"
          >
            Usar todo
          </button>
          <p className="text-xs text-cafe">La IA puede equivocarse: revisa que todo sea cierto antes de publicar.</p>
        </div>
      )}
    </section>
  );
}
