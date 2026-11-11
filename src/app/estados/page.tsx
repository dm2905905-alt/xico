import type { Metadata } from "next";
import { MapaMexico } from "@/components/mapa/MapaMexico";
import { consultas, obtenerCatalogo } from "@/lib/catalogo";
import { miniaturaDe } from "@/lib/datos";
import type { CreadorMapa } from "@/lib/mapa";

export const metadata: Metadata = {
  title: "Explora México: el mapa de los creadores",
  description: "Recorre el mapa de México, estado por estado, y conoce a los creadores que hacen a mano lo que venden: su historia y sus productos.",
};

export default async function ExploraMexico() {
  const { creadores, productosDeCreador } = consultas(await obtenerCatalogo());

  // Al navegador solo se manda lo que muestra el mapa
  const paraMapa: CreadorMapa[] = creadores.map((c) => {
    const suyos = productosDeCreador(c.slug);
    return {
      ...c,
      totalProductos: suyos.length,
      productos: [...suyos]
        .sort((a, b) => b.vendidos - a.vendidos)
        .slice(0, 3)
        .map((p) => ({
          slug: p.slug,
          nombre: p.nombre,
          precio: p.precio,
          colores: p.colores,
          forma: p.forma,
          categoria: p.categoria,
          ...(miniaturaDe(p) ? { foto: miniaturaDe(p) } : {}),
        })),
    };
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 max-w-2xl">
        <h1 className="font-display text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
          Explora <span className="texto-degradado">México</span> 🗺️
        </h1>
        <p className="mt-2 text-cafe">
          Acércate, arrastra y toca cualquier estado. Cada pin es una persona creativa: conoce su historia y lo que hace.
        </p>
      </div>
      <MapaMexico creadores={paraMapa} />
    </div>
  );
}
