import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { IconoCategoria } from "@/components/IconoCategoria";
import { categorias } from "@/lib/datos";
import { Catalogo, CatalogoCargando } from "@/components/Catalogo";
import { leerFiltros } from "@/lib/busqueda";

export const metadata: Metadata = {
  title: "Buscar productos hechos a mano",
};

export default function Buscar({ searchParams }: PageProps<"/buscar">) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:py-8">
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
      <h1 className="mb-3 font-display text-2xl font-bold tracking-tight sm:text-3xl">
        {filtros.q ? (
          <>
            Resultados para <span className="text-terracota">“{filtros.q}”</span>
          </>
        ) : (
          "Explorar"
        )}
      </h1>
      {/* Sin búsqueda: categorías para empezar a explorar */}
      {!filtros.q && !filtros.categoria && (
        <ul className="mb-4 grid grid-cols-4 gap-2 sm:grid-cols-5 lg:grid-cols-10">
          {categorias.map((c) => (
            <li key={c.slug}>
              <Link href={`/categoria/${c.slug}`} className="flex flex-col items-center gap-1.5 rounded-2xl p-1.5 text-center text-[11px] leading-tight font-medium hover:bg-arena sm:text-xs">
                <span className="grid size-14 place-items-center rounded-2xl bg-white ring-1 ring-arena-oscura">
                  <IconoCategoria slug={c.slug} className="size-6 text-terracota" strokeWidth={1.6} />
                </span>
                {c.nombre}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Catalogo filtros={filtros} ruta="/buscar" />
    </>
  );
}
