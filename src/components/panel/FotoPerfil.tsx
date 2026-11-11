"use client";

import { useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import type { Foto } from "@/lib/datos";
import { subirFoto } from "@/lib/fotos";

// Foto de perfil del vendedor (se ve en su tienda, en las tarjetas y en el pin del mapa)
export function FotoPerfil({
  foto,
  nombre,
  colores,
  carpeta,
  cambiar,
}: {
  foto?: Foto;
  nombre: string;
  colores: [string, string];
  carpeta: string;
  cambiar: (f: Foto | undefined) => void;
}) {
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  async function elegir(archivo?: File) {
    if (!archivo) return;
    setSubiendo(true);
    setError("");
    try {
      cambiar(await subirFoto(archivo, carpeta, { grande: 800, mini: 240 }));
    } catch (e) {
      setError((e as { code?: string }).code === "storage/unauthorized" ? "No tienes permiso para subir fotos todavía." : (e as Error).message);
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-4">
      <span
        className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full font-display text-3xl font-extrabold text-white shadow-md ring-4 ring-white"
        style={{ background: `linear-gradient(135deg, ${colores[0]}, ${colores[1]})` }}
      >
        {subiendo ? (
          <Loader2 className="size-7 animate-spin" />
        ) : foto ? (
          // eslint-disable-next-line @next/next/no-img-element -- miniatura ya optimizada al subirla
          <img src={foto.mini} alt="Tu foto de perfil" className="size-full object-cover" />
        ) : (
          (nombre.trim()[0] ?? "?").toUpperCase()
        )}
      </span>
      <div className="grid gap-2">
        <p className="text-sm font-medium">Foto de perfil</p>
        <div className="flex flex-wrap gap-2">
          <label className="flex cursor-pointer items-center gap-1.5 rounded-full bg-terracota px-4 py-2 text-sm font-semibold text-white hover:bg-terracota-oscura">
            <Camera className="size-4" /> {foto ? "Cambiar foto" : "Subir foto"}
            <input type="file" accept="image/*" className="sr-only" disabled={subiendo} onChange={(e) => (elegir(e.target.files?.[0]), (e.target.value = ""))} />
          </label>
          {foto && (
            <button type="button" onClick={() => cambiar(undefined)} className="flex items-center gap-1.5 rounded-full border border-arena-oscura px-4 py-2 text-sm hover:bg-arena">
              <Trash2 className="size-4" /> Quitar
            </button>
          )}
        </div>
        <p className="text-xs text-cafe">Tu cara, tu taller o tu logo. Recuerda presionar &quot;Guardar cambios&quot;.</p>
        {error && <p role="alert" className="text-sm text-rosa">{error}</p>}
      </div>
    </div>
  );
}
