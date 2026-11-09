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
    ? { title: `${cat.nombre} hechos a mano`, description: `${cat.nombre} hechos por artesanos y creadores mexicanos.` }
    : {};
}

export default async function PaginaCategoria({ params, searchParams }: PageProps<"/categoria/[slug]">) {
  const { slug } = await params;
  const cat = categoriaPorSlug(slug);
  if (!cat) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav className="mb-4 flex items-center gap-1 text-sm text-cafe" aria-label="Ruta">
        <Link href="/" className="hover:text-terracota">Inicio</Link>
        <ChevronRight className="size-4" />
        <span className="text-tinta">{cat.nombre}</span>
      </nav>
      <div className="mb-8 flex items-center gap-4">
        <span className="grid size-14 place-items-center rounded-2xl bg-terracota/10">
          <IconoCategoria slug={cat.slug} className="size-7 text-terracota" />
        </span>
        <h1 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{cat.nombre}</h1>
      </div>

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
