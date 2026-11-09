import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight, MapPin } from "lucide-react";
import { Catalogo, CatalogoCargando } from "@/components/Catalogo";
import { TarjetaCreador } from "@/components/TarjetaCreador";
import { leerFiltros } from "@/lib/busqueda";
import { consultas, obtenerCatalogo } from "@/lib/catalogo";
import { estadoPorSlug, estados } from "@/lib/datos";

export function generateStaticParams() {
  return estados.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: PageProps<"/estado/[slug]">): Promise<Metadata> {
  const estado = estadoPorSlug((await params).slug);
  return estado
    ? { title: `Hecho a mano en ${estado.nombre}`, description: `${estado.especialidad} y más, directo de artesanos de ${estado.nombre}.` }
    : {};
}

export default async function PaginaEstado({ params, searchParams }: PageProps<"/estado/[slug]">) {
  const { slug } = await params;
  const estado = estadoPorSlug(slug);
  if (!estado) notFound();
  const suyos = consultas(await obtenerCatalogo()).creadoresDeEstado(slug);

  return (
    <>
      <section
        className="patron-picado text-white"
        style={{ background: `linear-gradient(135deg, ${estado.colores[0]}, ${estado.colores[1]})` }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12">
          <nav className="mb-6 flex items-center gap-1 text-sm text-white/80" aria-label="Ruta">
            <Link href="/" className="hover:text-white">Inicio</Link>
            <ChevronRight className="size-4" />
            <Link href="/estados" className="hover:text-white">Explora México</Link>
            <ChevronRight className="size-4" />
            <span className="text-white">{estado.nombre}</span>
          </nav>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-white/85">
            <MapPin className="size-4" /> Hecho en
          </p>
          <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">{estado.nombre}</h1>
          <p className="mt-2 text-lg text-white/90">{estado.especialidad}</p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        {suyos.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 font-display text-2xl font-semibold">Creadores de {estado.nombre}</h2>
            <div className="sin-barra -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-3">
              {suyos.map((c) => (
                <TarjetaCreador key={c.slug} creador={c} />
              ))}
            </div>
          </section>
        )}

        <section className="mt-12">
          <h2 className="mb-4 font-display text-2xl font-semibold">Productos</h2>
          <Suspense fallback={<CatalogoCargando />}>
            <Resultados slug={slug} searchParams={searchParams} />
          </Suspense>
        </section>
      </div>
    </>
  );
}

async function Resultados({ slug, searchParams }: { slug: string; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const filtros = { ...leerFiltros(await searchParams), estado: slug };
  return <Catalogo filtros={filtros} ruta={`/estado/${slug}`} fijos={["estado"]} />;
}
