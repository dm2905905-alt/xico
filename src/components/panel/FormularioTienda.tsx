"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { estados, type Creador } from "@/lib/datos";
import { mensajeError } from "@/lib/firebase";
import type { DatosTienda } from "@/lib/panel";
import { FotoPerfil } from "./FotoPerfil";

// Combinaciones de color para la portada de la tienda
const portadas: [string, string][] = [
  ["#d6246e", "#f08a4b"],
  ["#4a2c6b", "#e9a824"],
  ["#e9a824", "#c4511f"],
  ["#1e3a8a", "#4f7cd6"],
  ["#2f7d6b", "#e9a824"],
  ["#5c6b73", "#9fb1ba"],
];

export function FormularioTienda({
  inicial,
  textoBoton,
  alGuardar,
}: {
  inicial?: Creador;
  textoBoton: string;
  alGuardar: (datos: DatosTienda) => Promise<void>;
}) {
  const [datos, setDatos] = useState<DatosTienda>({
    nombre: inicial?.nombre ?? "",
    taller: inicial?.taller ?? "",
    estado: inicial?.estado ?? "",
    ciudad: inicial?.ciudad ?? "",
    especialidad: inicial?.especialidad ?? "",
    historia: inicial?.historia ?? "",
    colores: inicial?.colores ?? portadas[0],
    ...(inicial?.foto ? { foto: inicial.foto } : {}),
  });
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(false);

  const poner = <K extends keyof DatosTienda>(k: K, v: DatosTienda[K]) => {
    setDatos((d) => ({ ...d, [k]: v }));
    setGuardado(false);
  };

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (datos.taller.trim().length < 2) return setError("Escribe el nombre de tu taller o marca.");
    if (!datos.estado) return setError("Elige el estado donde está tu taller.");
    setError("");
    setOcupado(true);
    try {
      await alGuardar({ ...datos, taller: datos.taller.trim(), nombre: datos.nombre.trim() });
      setGuardado(true);
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setOcupado(false);
    }
  }

  const campo = "h-11 w-full rounded-xl border border-arena-oscura bg-white px-3.5 text-sm outline-none focus:border-terracota focus:ring-2 focus:ring-terracota/15";
  const etiqueta = "grid gap-1.5 text-sm font-medium";

  return (
    <form onSubmit={enviar} className="grid gap-5">
      {/* Foto de perfil (solo cuando la tienda ya existe) */}
      {inicial && (
        <FotoPerfil
          foto={datos.foto}
          nombre={datos.taller}
          colores={datos.colores}
          carpeta={`creadores/${inicial.slug}`}
          cambiar={(f) => poner("foto", f)}
        />
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className={etiqueta}>
          Nombre de tu taller o marca *
          <input className={campo} maxLength={60} value={datos.taller} onChange={(e) => poner("taller", e.target.value)} placeholder="Ej. Taller Xóchitl" required />
        </label>
        <label className={etiqueta}>
          Tu nombre
          <input className={campo} maxLength={60} value={datos.nombre} onChange={(e) => poner("nombre", e.target.value)} placeholder="Ej. Xóchitl Ramírez" />
        </label>
        <label className={etiqueta}>
          Estado *
          <select className={campo} value={datos.estado} onChange={(e) => poner("estado", e.target.value)} required>
            <option value="">Elige tu estado</option>
            {estados.map((e) => (
              <option key={e.slug} value={e.slug}>{e.nombre}</option>
            ))}
          </select>
        </label>
        <label className={etiqueta}>
          Ciudad o pueblo
          <input className={campo} maxLength={60} value={datos.ciudad} onChange={(e) => poner("ciudad", e.target.value)} placeholder="Ej. Teotitlán del Valle" />
        </label>
      </div>

      <label className={etiqueta}>
        ¿Qué haces?
        <input className={campo} maxLength={80} value={datos.especialidad} onChange={(e) => poner("especialidad", e.target.value)} placeholder="Ej. Textiles bordados a mano" />
      </label>

      <label className={etiqueta}>
        Tu historia
        <textarea
          className={`${campo} h-28 py-2.5`}
          maxLength={600}
          value={datos.historia}
          onChange={(e) => poner("historia", e.target.value)}
          placeholder="¿Desde cuándo creas? ¿Quién te enseñó? ¿Qué hace especial tu trabajo?"
        />
        <span className="text-right text-xs font-normal text-cafe">{datos.historia.length}/600</span>
      </label>

      <fieldset className="grid gap-2 text-sm font-medium">
        <legend className="mb-2">Color de tu portada</legend>
        <div className="flex flex-wrap gap-3">
          {portadas.map(([a, b]) => {
            const activo = datos.colores[0] === a && datos.colores[1] === b;
            return (
              <button
                key={a + b}
                type="button"
                onClick={() => poner("colores", [a, b])}
                aria-label={`Portada ${a} y ${b}`}
                aria-pressed={activo}
                className={`h-12 w-20 rounded-xl ring-offset-2 transition ${activo ? "ring-2 ring-tinta" : "hover:scale-105"}`}
                style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
              />
            );
          })}
        </div>
      </fieldset>

      {error && <p role="alert" className="rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa">{error}</p>}
      {guardado && inicial && <p role="status" className="rounded-xl bg-jade/10 px-4 py-3 text-sm text-jade">✓ Cambios guardados.</p>}

      <button type="submit" disabled={ocupado} className="flex h-12 items-center justify-center gap-2 rounded-full bg-terracota font-semibold text-crema hover:bg-terracota-oscura disabled:opacity-60 sm:w-64">
        {ocupado && <Loader2 className="size-5 animate-spin" />} {textoBoton}
      </button>
    </form>
  );
}
