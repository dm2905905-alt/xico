import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, Package, Star } from "lucide-react";
import { TarjetaProducto } from "@/components/TarjetaProducto";
import { RELLENO, conRelleno, consultas, obtenerCatalogo } from "@/lib/catalogo";
import { estadoPorSlug } from "@/lib/datos";

export async function generateStaticParams() {
  const { creadores } = await obtenerCatalogo();
  return conRelleno(creadores.map((c) => c.slug));
}

export async function generateMetadata({ params }: PageProps<"/creador/[slug]">): Promise<Metadata> {
  const c = consultas(await obtenerCatalogo()).creadorPorSlug((await params).slug);
  return c ? { title: `${c.taller}: ${c.especialidad}`, description: c.historia } : {};
}

export default async function PaginaCreador({ params }: PageProps<"/creador/[slug]">) {
  const { slug } = await params;
  const { creadorPorSlug, productosDeCreador } = consultas(await obtenerCatalogo());
  const creador = slug === RELLENO ? undefined : creadorPorSlug(slug);
  if (!creador) notFound();

  const estado = estadoPorSlug(creador.estado);
  const suyos = productosDeCreador(slug);
  const vendidos = suyos.reduce((s, p) => s + p.vendidos, 0);
  const [a, b] = creador.colores;
  const iniciales = creador.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("");

  return (
    <>
      {/* Portada del taller */}
      <div className="patron-picado h-44 sm:h-60" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} />

      <div className="mx-auto max-w-7xl px-4">
        <div className="-mt-14 flex flex-col gap-5 sm:-mt-16 sm:flex-row sm:items-end">
          <span className="grid size-28 shrink-0 place-items-center rounded-full border-4 border-crema bg-tinta font-display text-4xl font-bold text-crema sm:size-32">
            {iniciales}
          </span>
          <div className="flex-1 pb-1">
            <h1 className="flex flex-wrap items-center gap-2 font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              {creador.taller}
              {creador.verificado && <BadgeCheck className="size-7 text-jade" aria-label="Artista verificado" />}
            </h1>
            <p className="mt-1 text-cafe">
              {creador.nombre} · {creador.especialidad}
            </p>
          </div>
        </div>

        {/* Insignias */}
        <div className="mt-5 flex flex-wrap gap-2 text-sm">
          {creador.verificado && (
            <span className="rounded-full bg-jade/10 px-3 py-1 font-semibold text-jade">✓ Artista verificado</span>
          )}
          {creador.top && (
            <span className="rounded-full bg-maiz/20 px-3 py-1 font-semibold text-terracota-oscura">⭐ Top vendedor</span>
          )}
          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-arena-oscura">100% hecho por quien lo crea</span>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
          {/* Historia */}
          <section>
            <h2 className="font-display text-2xl font-semibold">Su historia</h2>
            <p className="mt-3 max-w-2xl text-lg leading-relaxed text-tinta/85">{creador.historia}</p>
            <p className="mt-4 max-w-2xl text-sm text-cafe">
              Aquí el creador podrá mostrar fotos de su taller, sus materiales y videos de cómo trabaja (Fase 5).
            </p>
          </section>

          {/* Datos */}
          <aside className="grid gap-3 self-start rounded-2xl bg-white p-5 ring-1 ring-arena-oscura/60">
            <p className="flex items-center gap-3 text-sm">
              <Star className="size-5 fill-maiz text-maiz" />
              <span>
                <strong>{creador.calificacion}</strong> de calificación · {creador.resenas} reseñas
              </span>
            </p>
            <p className="flex items-center gap-3 text-sm">
              <Package className="size-5 text-terracota" />
              <span>
                <strong>{vendidos.toLocaleString("es-MX")}</strong> piezas vendidas
              </span>
            </p>
            {estado && (
              <Link href={`/estado/${estado.slug}`} className="flex items-center gap-3 text-sm hover:text-terracota">
                <MapPin className="size-5 text-jade" />
                <span>
                  {creador.ciudad}, <strong>{estado.nombre}</strong>
                </span>
              </Link>
            )}
          </aside>
        </div>

        {/* Productos */}
        <section className="mt-12">
          <h2 className="mb-5 font-display text-2xl font-semibold">
            Productos de {creador.taller} <span className="text-base font-normal text-cafe">({suyos.length})</span>
          </h2>
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 *:mb-4 *:break-inside-avoid">
            {suyos.map((p) => (
              <TarjetaProducto key={p.slug} producto={p} mosaico />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
