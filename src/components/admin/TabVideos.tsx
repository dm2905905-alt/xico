"use client";

import Link from "next/link";
import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { Eye, EyeOff, Play, Trash2 } from "lucide-react";
import { mensajeError, obtenerDb } from "@/lib/firebase";
import { portadaDe, type Video } from "@/lib/videos";
import { borrarVideo, useTodosLosVideos } from "@/lib/videos-cliente";

// Revisión de los videos de Descubre: ocultar o borrar los que no cumplan las reglas
export function TabVideos() {
  const videos = useTodosLosVideos(true);
  const [error, setError] = useState("");

  async function ocultar(v: Video, oculto: boolean) {
    const db = obtenerDb();
    if (!db) return;
    setError("");
    try {
      await updateDoc(doc(db, "videos", v.id), { oculto });
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  async function borrar(v: Video) {
    if (!window.confirm("¿Borrar este video para siempre?")) return;
    setError("");
    try {
      await borrarVideo(v);
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  if (!videos) return <div className="h-48 animate-pulse rounded-3xl bg-arena" />;

  return (
    <div className="grid gap-4">
      <p className="text-xs text-cafe">
        Revisa que cada video muestre el trabajo del creador. Ocultar lo quita de Descubre sin borrarlo; el creador lo verá marcado como oculto.
      </p>
      {error && <p role="alert" className="rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa">{error}</p>}
      {videos.length === 0 ? (
        <p className="text-sm text-cafe">Aún no hay videos.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {videos.map((v) => {
            const portada = portadaDe(v);
            return (
              <li key={v.id} className={`overflow-hidden rounded-2xl bg-white ring-1 ${v.oculto ? "ring-rosa/50" : "ring-arena-oscura/60"}`}>
                <Link href={`/descubre?v=${v.id}`} target="_blank" className="relative block aspect-[9/16] bg-tinta">
                  {portada ? (
                    // eslint-disable-next-line @next/next/no-img-element -- portada del video
                    <img src={portada} alt="" className={`size-full object-cover ${v.oculto ? "opacity-40" : ""}`} />
                  ) : (
                    <Play className="absolute inset-0 m-auto size-8 text-white/70" />
                  )}
                </Link>
                <div className="grid gap-1.5 p-2 text-xs">
                  <p className="truncate font-semibold">{v.taller}</p>
                  <p className="line-clamp-2 text-cafe">{v.titulo || "Sin texto"} · {v.tipo === "youtube" ? "YouTube" : "Subido"}</p>
                  <div className="flex gap-1">
                    <button onClick={() => ocultar(v, !v.oculto)} className="flex flex-1 items-center justify-center gap-1 rounded-full py-1.5 ring-1 ring-arena-oscura hover:bg-arena">
                      {v.oculto ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />} {v.oculto ? "Mostrar" : "Ocultar"}
                    </button>
                    <button onClick={() => borrar(v)} aria-label="Borrar" className="grid size-8 place-items-center rounded-full text-rosa ring-1 ring-rosa/40 hover:bg-rosa/10">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
