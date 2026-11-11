import type { Metadata } from "next";
import { Suspense } from "react";
import { FeedDescubre, type Diapositiva } from "@/components/FeedDescubre";
import { consultas, obtenerCatalogo, obtenerVideos } from "@/lib/catalogo";
import { miniaturaDe } from "@/lib/datos";

export const metadata: Metadata = {
  title: "Descubre: así se hace",
  description: "Videos de creadores mexicanos haciendo sus piezas a mano. Mira cómo se hacen y cómpralas sin salir del video.",
};

export default function Descubre() {
  return (
    <Suspense fallback={<div className="fixed inset-0 z-50 bg-black" />}>
      <Contenido />
    </Suspense>
  );
}

async function Contenido() {
  const [videos, catalogo] = await Promise.all([obtenerVideos(), obtenerCatalogo()]);
  const { productoPorSlug, creadorPorSlug } = consultas(catalogo);

  // Solo lo que necesita cada video (lo demás no viaja al navegador)
  const diapositivas: Diapositiva[] = videos.flatMap((v) => {
    const p = productoPorSlug(v.producto);
    const c = creadorPorSlug(v.creador);
    if (!p) return [];
    return [
      {
        video: v,
        producto: { slug: p.slug, nombre: p.nombre, precio: p.precio, foto: miniaturaDe(p), colores: p.colores },
        tienda: { slug: v.creador, taller: c?.taller ?? v.taller, foto: c?.foto?.mini, verificado: !!c?.verificado, colores: c?.colores ?? p.colores },
      },
    ];
  });

  return <FeedDescubre diapositivas={diapositivas} />;
}
