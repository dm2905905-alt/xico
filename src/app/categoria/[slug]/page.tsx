import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";
import { Catalogo, CatalogoCargando } from "@/components/Catalogo";
import { IconoCategoria } from "@/components/IconoCategoria";
import { leerFiltros } from "@/lib/busqueda";
import { categoriaPorSlug, categorias } from "@/lib/datos";

export function generateStaticParams() {
  return categorias.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/categoria/[slug]">): Promise<Metadata> {
  const cat = categoriaPorSlug((await params).slug);
  return cat
    ? { title: `${cat.nombre} hechos a mano`, description: `${cat.nombre} hechos a mano por creadores mexicanos.` }
    : {};
}

export default async function PaginaCategoria({ params, searchParams }: PageProps<"/categoria/[slug]">) {
  const { slug } = await params;
  const cat = categoriaPorSlug(slug);
  if (!cat) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:py-8">
      <nav className="mb-4 hidden items-center gap-1 text-sm text-cafe md:flex" aria-label="Ruta">
        <Link href="/" className="hover:text-terracota">Inicio</Link>
        <ChevronRight className="size-4" />
        <span className="text-tinta">{cat.nombre}</span>
      </nav>
      <div className="mb-3 flex items-center gap-3">
        <span className="grid size-10 place-items-center rounded-xl bg-terracota/10 sm:size-12">
          <IconoCategoria slug={cat.slug} className="size-5 text-terracota sm:size-6" />
        </span>
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{cat.nombre}</h1>
      </div>
      {/* Otras categorías a un toque */}
      <ul className="sin-barra -mx-4 mb-3 flex gap-2 overflow-x-auto px-4 pb-1">
        {categorias.map((c) => (
          <li key={c.slug} className="shrink-0">
            <Link
              href={`/categoria/${c.slug}`}
              aria-current={c.slug === cat.slug ? "page" : undefined}
              className={`block rounded-full px-3.5 py-1.5 text-sm whitespace-nowrap ${c.slug === cat.slug ? "bg-tinta font-semibold text-crema" : "bg-white ring-1 ring-arena-oscura hover:bg-arena"}`}
            >
              {c.nombre}
            </Link>
          </li>
        ))}
      </ul>

      <Suspense fallback={<CatalogoCargando />}>
        <Resultados slug={cat.slug} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Resultados({ slug, searchParams }: { slug: string; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filtros = { ...leerFiltros(await searchParams), categoria: slug };
  return <Catalogo filtros={filtros} ruta={`/categoria/${slug}`} fijos={["categoria"]} />;
}
