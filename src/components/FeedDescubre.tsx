"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { BadgeCheck, ChevronLeft, Pause, Share2, ShoppingBag, Volume2, VolumeX } from "lucide-react";
import { precio } from "@/lib/formato";
import { portadaDe, type Video } from "@/lib/videos";

export type Diapositiva = {
  video: Video;
  producto: { slug: string; nombre: string; precio: number; foto?: string; colores: [string, string] };
  tienda: { slug: string; taller: string; foto?: string; verificado: boolean; colores: [string, string] };
};

// Videos en pantalla completa que se deslizan hacia arriba (como Reels o TikTok)
export function FeedDescubre({ diapositivas }: { diapositivas: Diapositiva[] }) {
  const inicial = useSearchParams().get("v");
  const caja = useRef<HTMLDivElement>(null);
  const [activa, setActiva] = useState(0);
  const [sonido, setSonido] = useState(false);

  // Detecta qué video está en pantalla
  useEffect(() => {
    const el = caja.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entradas) => entradas.forEach((e) => e.isIntersecting && setActiva(Number((e.target as HTMLElement).dataset.i))),
      { root: el, threshold: 0.6 },
    );
    el.querySelectorAll("[data-i]").forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, [diapositivas.length]);

  // Abre directo en el video del enlace (?v=…)
  useEffect(() => {
    if (!inicial) return;
    const i = diapositivas.findIndex((d) => d.video.id === inicial);
    if (i > 0) caja.current?.querySelector<HTMLElement>(`[data-i="${i}"]`)?.scrollIntoView({ behavior: "instant" });
  }, [inicial, diapositivas]);

  // Mientras está abierto, la página de fondo no se mueve
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black text-white">
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between bg-linear-to-b from-black/60 to-transparent p-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Link href="/" aria-label="Volver" className="pointer-events-auto grid size-10 place-items-center rounded-full bg-black/30 backdrop-blur">
          <ChevronLeft className="size-6" />
        </Link>
        <p className="font-display text-lg font-bold">Descubre</p>
        <button
          onClick={() => setSonido((s) => !s)}
          aria-label={sonido ? "Quitar sonido" : "Activar sonido"}
          className="pointer-events-auto grid size-10 place-items-center rounded-full bg-black/30 backdrop-blur"
        >
          {sonido ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        </button>
      </header>

      {diapositivas.length === 0 ? (
        <div className="grid h-full place-items-center p-8 text-center">
          <div>
            <p className="font-display text-2xl font-bold">Muy pronto</p>
            <p className="mt-2 text-white/75">Aquí verás a los creadores haciendo sus piezas a mano.</p>
            <Link href="/panel/videos" className="mt-6 inline-block rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-tinta">
              ¿Eres creador? Sube tu video
            </Link>
          </div>
        </div>
      ) : (
        <div ref={caja} className="sin-barra h-full snap-y snap-mandatory overflow-y-scroll">
          {diapositivas.map((d, i) => (
            <section key={d.video.id} data-i={i} className="relative h-dvh w-full snap-start snap-always overflow-hidden">
              <Reproductor video={d.video} activo={i === activa} cerca={Math.abs(i - activa) <= 1} sonido={sonido} />
              <Informacion d={d} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function Reproductor({ video, activo, cerca, sonido }: { video: Video; activo: boolean; cerca: boolean; sonido: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (activo && !pausado) v.play().catch(() => {});
    else v.pause();
    if (!activo) v.currentTime = 0;
  }, [activo, pausado]);

  const portada = portadaDe(video);

  if (video.tipo === "youtube") {
    // El reproductor de YouTube solo se carga en el video que está en pantalla
    return activo ? (
      <iframe
        className="absolute inset-0 size-full"
        src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?autoplay=1&mute=${sonido ? 0 : 1}&playsinline=1&loop=1&playlist=${video.youtubeId}&rel=0&modestbranding=1`}
        title={video.titulo || "Video de YouTube"}
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    ) : (
      // eslint-disable-next-line @next/next/no-img-element -- portada de YouTube
      <img src={portada} alt="" className="absolute inset-0 size-full object-cover" />
    );
  }

  return (
    <button type="button" onClick={() => setPausado((p) => !p)} className="absolute inset-0 size-full" aria-label={pausado ? "Reproducir" : "Pausar"}>
      <video
        ref={ref}
        src={cerca ? video.url : undefined}
        poster={portada}
        muted={!sonido}
        loop
        playsInline
        preload={cerca ? "auto" : "none"}
        className="size-full object-cover"
      />
      {pausado && (
        <span className="absolute inset-0 m-auto grid size-16 place-items-center rounded-full bg-black/40">
          <Pause className="size-8" />
        </span>
      )}
    </button>
  );
}

function Informacion({ d }: { d: Diapositiva }) {
  const { video, producto, tienda } = d;

  async function compartir() {
    const url = `${location.origin}/descubre?v=${video.id}`;
    try {
      if (navigator.share) await navigator.share({ title: producto.nombre, url });
      else {
        await navigator.clipboard.writeText(url);
        alert("Enlace copiado");
      }
    } catch {
      /* la persona canceló */
    }
  }

  return (
    <>
      <button
        onClick={compartir}
        aria-label="Compartir"
        className="absolute right-3 bottom-48 z-10 grid size-11 place-items-center rounded-full bg-black/30 backdrop-blur"
      >
        <Share2 className="size-5" />
      </button>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-linear-to-t from-black/85 via-black/40 to-transparent p-4 pt-24 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <Link href={`/creador/${tienda.slug}`} className="pointer-events-auto inline-flex items-center gap-2">
          <span
            className="grid size-9 place-items-center overflow-hidden rounded-full border-2 border-white font-display text-sm font-bold"
            style={{ background: `linear-gradient(135deg, ${tienda.colores[0]}, ${tienda.colores[1]})` }}
          >
            {tienda.foto ? (
              // eslint-disable-next-line @next/next/no-img-element -- miniatura de la tienda
              <img src={tienda.foto} alt="" className="size-full object-cover" />
            ) : (
              tienda.taller.slice(0, 1).toUpperCase()
            )}
          </span>
          <span className="flex items-center gap-1 font-semibold">
            {tienda.taller}
            {tienda.verificado && <BadgeCheck className="size-4 text-jade" aria-label="Verificado" />}
          </span>
        </Link>
        {video.titulo && <p className="mt-2 max-w-md text-sm text-white/90">{video.titulo}</p>}

        {/* El producto del video, a un toque */}
        <Link
          href={`/producto/${producto.slug}`}
          className="pointer-events-auto mt-3 flex max-w-md items-center gap-3 rounded-2xl bg-white/95 p-2 pr-3 text-tinta shadow-lg"
        >
          <span
            className="size-12 shrink-0 overflow-hidden rounded-xl"
            style={{ background: `linear-gradient(135deg, ${producto.colores[0]}, ${producto.colores[1]})` }}
          >
            {producto.foto && (
              // eslint-disable-next-line @next/next/no-img-element -- miniatura del producto
              <img src={producto.foto} alt="" className="size-full object-cover" />
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{producto.nombre}</span>
            <span className="text-sm font-bold text-terracota">{precio(producto.precio)}</span>
          </span>
          <span className="degradado-xico flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-xs font-bold text-white">
            <ShoppingBag className="size-4" /> Ver
          </span>
        </Link>
      </div>
    </>
  );
}
