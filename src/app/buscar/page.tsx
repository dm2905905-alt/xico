import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalogo, CatalogoCargando } from "@/components/Catalogo";
import { leerFiltros } from "@/lib/busqueda";

export const metadata: Metadata = {
  title: "Buscar productos hechos a mano",
};

export default function Buscar({ searchParams }: PageProps<"/buscar">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Suspense fallback={<CatalogoCargando />}>
        <Resultados searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Resultados({ searchParams }: { searchParams: PageProps<"/buscar">["searchParams"] }) {
  const filtros = leerFiltros(await searchParams);
  return (
    <>
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight">
        {filtros.q ? (
          <>
            Resultados para <span className="text-terracota">“{filtros.q}”</span>
          </>
        ) : (
          "Todos los productos"
        )}
      </h1>
      <Catalogo filtros={filtros} ruta="/buscar" />
    </>
  );
}
