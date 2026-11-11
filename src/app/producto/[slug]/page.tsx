import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronRight, Clock, MapPin, Package, ShieldCheck, Star, Truck } from "lucide-react";
import { BotonFavorito } from "@/components/BotonFavorito";
import { BotonEscribir } from "@/components/chat/BotonEscribir";
import { GaleriaProducto } from "@/components/GaleriaProducto";
import { Personalizador } from "@/components/Personalizador";
import { Carrusel, Seccion } from "@/components/Seccion";
import { TarjetaProducto } from "@/components/TarjetaProducto";
import { RELLENO, conRelleno, consultas, obtenerCatalogo } from "@/lib/catalogo";
import { aTarjeta, categoriaPorSlug, estadoPorSlug } from "@/lib/datos";
import { descuento, precio } from "@/lib/formato";

export async function generateStaticParams() {
  const { productos } = await obtenerCatalogo();
  return conRelleno(productos.map((p) => p.slug));
}

export async function generateMetadata({ params }: PageProps<"/producto/[slug]">): Promise<Metadata> {
  const p = consultas(await obtenerCatalogo()).productoPorSlug((await params).slug);
  if (!p) return {};
  const descripcion = `${p.descripcion} Hecho a mano por ${p.taller}.`;
  return {
    title: p.nombre,
    description: descripcion,
    openGraph: { title: `${p.nombre} · XICO`, description: descripcion, type: "website", locale: "es_MX", siteName: "XICO" },
  };
}

export default async function PaginaProducto({ params }: PageProps<"/producto/[slug]">) {
  const { slug } = await params;
  const { productos, productoPorSlug, creadorPorSlug, productosDeCreador } = consultas(await obtenerCatalogo());
  const producto = slug === RELLENO ? undefined : productoPorSlug(slug);
  if (!producto) notFound();

  const creador = creadorPorSlug(producto.creador);
  const estado = estadoPorSlug(producto.estado);
  const categoria = categoriaPorSlug(producto.categoria);
  const off = descuento(producto.precio, producto.precioAntes);

  const delCreador = productosDeCreador(producto.creador).filter((p) => p.slug !== slug);
  const parecidos = productos.filter((p) => p.categoria === producto.categoria && p.slug !== slug && p.creador !== producto.creador);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <nav className="mb-6 flex flex-wrap items-center gap-1 text-sm text-cafe" aria-label="Ruta">
        <Link href="/" className="hover:text-terracota">Inicio</Link>
        <ChevronRight className="size-4" />
        {categoria && (
          <>
            <Link href={`/categoria/${categoria.slug}`} className="hover:text-terracota">{categoria.nombre}</Link>
            <ChevronRight className="size-4" />
          </>
        )}
        <span className="line-clamp-1 text-tinta">{producto.nombre}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Galería */}
        <div className="lg:sticky lg:top-36 lg:self-start">
          <div className="relative overflow-hidden rounded-3xl">
            <GaleriaProducto producto={producto} />
            <BotonFavorito producto={aTarjeta(producto)} grande className="absolute top-4 right-4" />
          </div>
        </div>

        {/* Información y compra */}
        <div>
          <div className="flex flex-wrap gap-2">
            {off > 0 && <span className="rounded-full bg-rosa px-2.5 py-0.5 text-xs font-bold text-white">-{off}%</span>}
            {producto.nuevo && <span className="rounded-full bg-maiz px-2.5 py-0.5 text-xs font-bold">Nuevo</span>}
            <span className="rounded-full bg-jade/10 px-2.5 py-0.5 text-xs font-semibold text-jade">100% hecho por quien lo crea</span>
          </div>

          <h1 className="mt-3 font-display text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">{producto.nombre}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-cafe">
            {producto.resenas > 0 ? (
              <span className="flex items-center gap-1">
                <Star className="size-4 fill-maiz text-maiz" />
                <strong className="text-tinta">{producto.calificacion.toFixed(1)}</strong> ({producto.resenas} reseñas)
              </span>
            ) : (
              <span>✨ Recién llegado: aún sin reseñas</span>
            )}
            {producto.vendidos > 0 && <span>{producto.vendidos.toLocaleString("es-MX")} vendidos</span>}
          </div>

          <p className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold">{precio(producto.precio)}</span>
            {producto.precioAntes && <span className="text-lg text-cafe/70 line-through">{precio(producto.precioAntes)}</span>}
          </p>

          <p className="mt-5 leading-relaxed text-tinta/85">{producto.descripcion}</p>

          <div className="mt-6">
            <Personalizador producto={producto} />
          </div>

          {/* Detalles */}
          <ul className="mt-8 grid gap-3 rounded-2xl bg-arena/60 p-5 text-sm">
            <li className="flex gap-3">
              <Clock className="size-5 shrink-0 text-terracota" />
              <span><strong>Tiempo de elaboración:</strong> {producto.diasElaboracion}</span>
            </li>
            <li className="flex gap-3">
              <Package className="size-5 shrink-0 text-terracota" />
              <span><strong>Materiales:</strong> {producto.materiales}</span>
            </li>
            <li className="flex gap-3">
              <Truck className="size-5 shrink-0 text-terracota" />
              <span><strong>Envío a todo México</strong> con número de guía para rastrear tu paquete.</span>
            </li>
            <li className="flex gap-3">
              <ShieldCheck className="size-5 shrink-0 text-terracota" />
              <span><strong>Compra protegida:</strong> si tu pedido no llega o no es lo que pediste, te devolvemos tu dinero.</span>
            </li>
          </ul>

          {/* ¿Lo quiere diferente? Chat con el creador */}
          {creador?.uid && (
            <BotonEscribir creador={creador} texto="💬 ¿Lo quieres diferente? Escribe al creador" className="mt-4" />
          )}

          {/* Creador */}
          {creador && (
            <Link
              href={`/creador/${creador.slug}`}
              className="mt-6 flex items-center gap-4 rounded-2xl bg-white p-4 ring-1 ring-arena-oscura/60 transition hover:shadow-md"
            >
              <span
                className="grid size-14 shrink-0 place-items-center rounded-full font-display text-lg font-bold text-white"
                style={{ background: `linear-gradient(135deg, ${creador.colores[0]}, ${creador.colores[1]})` }}
              >
                {creador.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("")}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 font-semibold">
                  {creador.taller}
                  {creador.verificado && <BadgeCheck className="size-4 text-jade" aria-label="Verificado" />}
                </span>
                <span className="flex items-center gap-1 text-xs text-cafe">
                  <MapPin className="size-3.5" /> {creador.ciudad}, {estado?.nombre}
                </span>
                <span className="mt-1 line-clamp-1 text-sm text-tinta/75">{creador.historia}</span>
              </span>
              <ChevronRight className="size-5 shrink-0 text-cafe" />
            </Link>
          )}
        </div>
      </div>

      {delCreador.length > 0 && (
        <Seccion titulo={`Más de ${creador?.taller}`} verTodo={`/creador/${producto.creador}`}>
          <Carrusel>
            {delCreador.map((p) => (
              <TarjetaProducto key={p.slug} producto={p} />
            ))}
          </Carrusel>
        </Seccion>
      )}

      {parecidos.length > 0 && (
        <Seccion titulo="También te puede gustar" verTodo={`/categoria/${producto.categoria}`}>
          <Carrusel>
            {parecidos.map((p) => (
              <TarjetaProducto key={p.slug} producto={p} />
            ))}
          </Carrusel>
        </Seccion>
      )}
    </div>
  );
}
