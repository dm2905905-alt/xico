"use client";

import Link from "next/link";
import { useState } from "react";
import { Film, Link2, Loader2, Play, Trash2, Upload } from "lucide-react";
import { ocultarContacto } from "@/lib/contacto";
import type { Creador } from "@/lib/datos";
import { mensajeError } from "@/lib/firebase";
import { useProductosDe } from "@/lib/panel";
import { MAX_MB_VIDEO, MAX_SEGUNDOS, portadaDe, youtubeIdDe, type Video } from "@/lib/videos";
import { borrarVideo, guardarVideo, subirVideo, useVideosDe } from "@/lib/videos-cliente";
import { ConTienda } from "./ConTienda";

export function VistaVideos() {
  return <ConTienda volver="/panel/videos">{(creador) => <Videos creador={creador} />}</ConTienda>;
}

const campo = "h-11 w-full rounded-xl border border-arena-oscura bg-white px-3.5 text-sm outline-none focus:border-terracota focus:ring-2 focus:ring-terracota/15";

function Videos({ creador }: { creador: Creador }) {
  const { productos } = useProductosDe(creador.slug);
  const { videos, cargando } = useVideosDe(creador.slug);
  const [modo, setModo] = useState<"archivo" | "youtube">("archivo");
  const [producto, setProducto] = useState("");
  const [titulo, setTitulo] = useState("");
  const [archivo, setArchivo] = useState<File | null>(null);
  const [enlace, setEnlace] = useState("");
  const [avance, setAvance] = useState<number | null>(null);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  const nombreDe = (slug: string) => productos.find((p) => p.slug === slug)?.nombre ?? "Producto";

  async function publicar(e: React.FormEvent) {
    e.preventDefault();
    setMensaje(null);
    if (!producto) return setMensaje({ ok: false, texto: "Elige qué producto aparece en el video." });
    if (ocultarContacto(titulo).encontrados.length) return setMensaje({ ok: false, texto: "El texto no puede llevar teléfonos, correos ni redes sociales." });
    const base = {
      id: crypto.randomUUID(),
      creador: creador.slug,
      creadorUid: creador.uid!,
      taller: creador.taller,
      producto,
      titulo: titulo.trim(),
      creado: Date.now(),
    };
    try {
      if (modo === "youtube") {
        const id = youtubeIdDe(enlace);
        if (!id) return setMensaje({ ok: false, texto: "Ese enlace no parece de YouTube. Copia el enlace de tu Short o video." });
        await guardarVideo({ ...base, tipo: "youtube", youtubeId: id });
      } else {
        if (!archivo) return setMensaje({ ok: false, texto: "Elige el video que quieres subir." });
        setAvance(0);
        const subido = await subirVideo(archivo, creador.slug, setAvance);
        await guardarVideo({ ...base, tipo: "archivo", url: subido.url, ruta: subido.ruta, ...(subido.portada ? { portada: subido.portada } : {}) });
      }
      setTitulo("");
      setArchivo(null);
      setEnlace("");
      setMensaje({ ok: true, texto: "✓ Video publicado. Aparecerá en Descubre en 1 a 2 minutos." });
    } catch (err) {
      setMensaje({ ok: false, texto: err instanceof Error && !("code" in err) ? err.message : mensajeError(err) });
    } finally {
      setAvance(null);
    }
  }

  async function quitar(v: Video) {
    if (!window.confirm("¿Borrar este video? Ya no aparecerá en Descubre.")) return;
    try {
      await borrarVideo(v);
    } catch (err) {
      setMensaje({ ok: false, texto: mensajeError(err) });
    }
  }

  const ocupado = avance !== null;

  return (
    <div className="grid gap-4 sm:gap-6">
      <div>
        <Link href="/panel" className="text-sm text-cafe hover:underline">← Volver a mi tienda</Link>
        <h2 className="mt-2 font-display text-2xl font-bold">Mis videos</h2>
        <p className="text-sm text-cafe">Enseña cómo haces tus piezas. Los videos aparecen en Descubre con un botón para comprar el producto.</p>
      </div>

      <form onSubmit={publicar} className="grid gap-4 rounded-3xl bg-white p-4 ring-1 ring-arena-oscura/60 sm:p-6">
        <h3 className="font-display text-lg font-semibold">Nuevo video</h3>

        {productos.length === 0 ? (
          <p className="rounded-xl bg-maiz/20 px-4 py-3 text-sm">
            Primero sube un producto: cada video va ligado a uno.{" "}
            <Link href="/panel/producto/nuevo" className="font-semibold text-terracota underline">Subir producto</Link>
          </p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-2 rounded-full bg-arena p-1 text-sm font-semibold">
              {(
                [
                  ["archivo", "Subir desde mi celular", Upload],
                  ["youtube", "Enlace de YouTube", Link2],
                ] as const
              ).map(([id, texto, Icono]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setModo(id)}
                  className={`flex items-center justify-center gap-1.5 rounded-full py-2 ${modo === id ? "bg-white shadow-sm" : "text-cafe"}`}
                >
                  <Icono className="size-4" /> {texto}
                </button>
              ))}
            </div>

            {modo === "archivo" ? (
              <label className="flex cursor-pointer flex-col items-center gap-1 rounded-2xl border-2 border-dashed border-arena-oscura px-4 py-6 text-center text-sm hover:bg-arena/50">
                <Film className="size-7 text-terracota" />
                <span className="font-semibold">{archivo ? archivo.name : "Toca para elegir tu video"}</span>
                <span className="text-xs text-cafe">
                  Máximo {MAX_SEGUNDOS} segundos y {MAX_MB_VIDEO} MB. Mejor si lo grabas vertical.
                </span>
                <input type="file" accept="video/*" className="sr-only" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
              </label>
            ) : (
              <label className="grid gap-1 text-sm font-medium">
                Enlace de tu Short o video de YouTube
                <input className={campo} value={enlace} onChange={(e) => setEnlace(e.target.value)} placeholder="https://youtube.com/shorts/…" inputMode="url" />
              </label>
            )}

            <label className="grid gap-1 text-sm font-medium">
              ¿Qué producto aparece?
              <select className={campo} value={producto} onChange={(e) => setProducto(e.target.value)}>
                <option value="">Elige un producto</option>
                {productos.map((p) => (
                  <option key={p.slug} value={p.slug}>{p.nombre}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-sm font-medium">
              Texto del video (opcional)
              <input className={campo} maxLength={100} value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej. Así pinto cada funda a mano" />
            </label>

            {mensaje && (
              <p role={mensaje.ok ? "status" : "alert"} className={`rounded-xl px-4 py-3 text-sm ${mensaje.ok ? "bg-jade/10 text-jade" : "bg-rosa/10 text-rosa"}`}>
                {mensaje.texto}
              </p>
            )}

            <button type="submit" disabled={ocupado} className="degradado-xico flex h-12 items-center justify-center gap-2 rounded-full font-semibold text-white disabled:opacity-60 sm:w-64">
              {ocupado && <Loader2 className="size-5 animate-spin" />}
              {ocupado ? `Subiendo… ${avance}%` : "Publicar video"}
            </button>
          </>
        )}
      </form>

      <section>
        <h3 className="mb-2 font-display text-lg font-semibold">Publicados ({videos.length})</h3>
        {cargando ? (
          <div className="h-40 animate-pulse rounded-3xl bg-arena" />
        ) : videos.length === 0 ? (
          <p className="rounded-3xl bg-white p-6 text-center text-sm text-cafe ring-1 ring-arena-oscura/60">Aún no tienes videos.</p>
        ) : (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {videos.map((v) => {
              const portada = portadaDe(v);
              return (
                <li key={v.id} className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-tinta">
                  {portada ? (
                    // eslint-disable-next-line @next/next/no-img-element -- portada del video
                    <img src={portada} alt="" className="size-full object-cover opacity-90" />
                  ) : (
                    <Play className="absolute inset-0 m-auto size-8 text-white/70" />
                  )}
                  <Link href={`/descubre?v=${v.id}`} className="absolute inset-0" aria-label="Ver en Descubre" />
                  <span className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/80 p-2 text-[11px] leading-tight text-white">
                    {v.tipo === "youtube" && "▶ YouTube · "}
                    {nombreDe(v.producto)}
                    {v.oculto && <span className="block font-semibold text-rosa">Oculto por XICO</span>}
                  </span>
                  <button
                    onClick={() => quitar(v)}
                    aria-label="Borrar video"
                    className="absolute top-1.5 right-1.5 grid size-8 place-items-center rounded-full bg-black/50 text-white hover:bg-rosa"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
