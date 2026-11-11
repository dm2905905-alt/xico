import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronRight, Clock, MapPin, Package, Play, ShieldCheck, Star, Truck } from "lucide-react";
import { BotonFavorito } from "@/components/BotonFavorito";
import { BotonEscribir } from "@/components/chat/BotonEscribir";
import { GaleriaProducto } from "@/components/GaleriaProducto";
import { Personalizador } from "@/components/Personalizador";
import { Fila } from "@/components/Fila";
import { TarjetaProducto } from "@/components/TarjetaProducto";
import { RELLENO, conRelleno, consultas, obtenerCatalogo, obtenerVideos } from "@/lib/catalogo";
import { aTarjeta, categoriaPorSlug, estadoPorSlug, subcategoriaDe } from "@/lib/datos";
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
  const video = (await obtenerVideos()).find((v) => v.producto === producto.slug);
  const estado = estadoPorSlug(producto.estado);
  const categoria = categoriaPorSlug(producto.categoria);
  const subcategoria = subcategoriaDe(producto.categoria, producto.subcategoria);
  const off = descuento(producto.precio, producto.precioAntes);

  const delCreador = productosDeCreador(producto.creador).filter((p) => p.slug !== slug);
  const parecidos = productos
    .filter((p) => p.categoria === producto.categoria && p.slug !== slug && p.creador !== producto.creador)
    .sort((a, b) => Number(b.subcategoria === producto.subcategoria) - Number(a.subcategoria === producto.subcategoria));

  const iniciales = creador?.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("") || creador?.taller.slice(0, 1);

  return (
    <div className="mx-auto max-w-7xl md:px-4 md:py-6">
      <nav className="mb-6 hidden flex-wrap items-center gap-1 text-sm text-cafe md:flex" aria-label="Ruta">
        <Link href="/" className="hover:text-terracota">Inicio</Link>
        <ChevronRight className="size-4" />
        {categoria && (
          <>
            <Link href={`/categoria/${categoria.slug}`} className="hover:text-terracota">{categoria.nombre}</Link>
            <ChevronRight className="size-4" />
          </>
        )}
        {categoria && subcategoria && (
          <>
            <Link href={`/categoria/${categoria.slug}?sub=${subcategoria.slug}`} className="hover:text-terracota">{subcategoria.nombre}</Link>
            <ChevronRight className="size-4" />
          </>
        )}
        <span className="line-clamp-1 text-tinta">{producto.nombre}</span>
      </nav>

      <div className="grid md:grid-cols-2 md:gap-10 lg:gap-12">
        {/* Galería: de orilla a orilla en celular */}
        <div className="md:sticky md:top-24 md:self-start">
          <div className="relative overflow-hidden md:rounded-3xl">
            <GaleriaProducto producto={producto} />
            <BotonFavorito producto={aTarjeta(producto)} grande className="absolute top-4 right-4" />
            {video && (
              <Link
                href={`/descubre?v=${video.id}`}
                className="absolute bottom-8 left-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur md:bottom-4"
              >
                <Play className="size-4 fill-white" /> Ver cómo se hace
              </Link>
            )}
          </div>
        </div>

        {/* Información y compra */}
        <div className="-mt-5 rounded-t-3xl bg-crema px-4 pt-5 md:mt-0 md:rounded-none md:bg-transparent md:px-0 md:pt-0">
          {/* Precio primero, como en una app */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-3xl font-extrabold tracking-tight">{precio(producto.precio)}</span>
            {producto.precioAntes && <span className="text-base text-cafe/70 line-through">{precio(producto.precioAntes)}</span>}
            {off > 0 && <span className="rounded-full bg-rosa px-2.5 py-0.5 text-xs font-bold text-white">-{off}%</span>}
            {producto.nuevo && <span className="rounded-full bg-maiz px-2.5 py-0.5 text-xs font-bold">Nuevo</span>}
          </div>

          <h1 className="mt-2 font-display text-xl leading-snug font-semibold tracking-tight sm:text-3xl">{producto.nombre}</h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-cafe">
            {producto.resenas > 0 ? (
              <span className="flex items-center gap-1">
                <Star className="size-4 fill-maiz text-maiz" />
                <strong className="text-tinta">{producto.calificacion.toFixed(1)}</strong> ({producto.resenas})
              </span>
            ) : (
              <span>✨ Recién llegado</span>
            )}
            {producto.vendidos > 0 && <span>· {producto.vendidos.toLocaleString("es-MX")} vendidos</span>}
            <span className="text-jade">· 100% hecho a mano</span>
          </div>

          {/* Creador: fila compacta */}
          {creador && (
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white p-3 ring-1 ring-arena-oscura/60">
              <Link href={`/creador/${creador.slug}`} className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  className="grid size-11 shrink-0 place-items-center overflow-hidden rounded-full font-display font-bold text-white"
                  style={{ background: `linear-gradient(135deg, ${creador.colores[0]}, ${creador.colores[1]})` }}
                >
                  {creador.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element -- miniatura ya reducida al subirla
                    <img src={creador.foto.mini} alt="" className="size-full object-cover" />
                  ) : (
                    iniciales
                  )}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-1 text-sm font-semibold">
                    <span className="truncate">{creador.taller}</span>
                    {creador.verificado && <BadgeCheck className="size-4 shrink-0 text-jade" aria-label="Verificado" />}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-cafe">
                    <MapPin className="size-3.5 shrink-0" /> <span className="truncate">{[creador.ciudad, estado?.nombre].filter(Boolean).join(", ")}</span>
                  </span>
                </span>
              </Link>
              <Link href={`/creador/${creador.slug}`} className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold text-terracota ring-1 ring-terracota/40 hover:bg-terracota/10">
                Ver tienda
              </Link>
            </div>
          )}

          {/* Detalles en cuadritos */}
          <ul className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <li className="flex items-start gap-2 rounded-2xl bg-arena/60 p-3">
              <Clock className="size-4 shrink-0 text-terracota" />
              <span><strong className="block text-tinta">Se hace en</strong>{producto.diasElaboracion}</span>
            </li>
            <li className="flex items-start gap-2 rounded-2xl bg-arena/60 p-3">
              <Truck className="size-4 shrink-0 text-terracota" />
              <span><strong className="block text-tinta">Envío</strong>A todo México con rastreo</span>
            </li>
            <li className="flex items-start gap-2 rounded-2xl bg-arena/60 p-3">
              <Package className="size-4 shrink-0 text-terracota" />
              <span className="min-w-0"><strong className="block text-tinta">Materiales</strong><span className="line-clamp-2">{producto.materiales}</span></span>
            </li>
            <li className="flex items-start gap-2 rounded-2xl bg-arena/60 p-3">
              <ShieldCheck className="size-4 shrink-0 text-terracota" />
              <span><strong className="block text-tinta">Compra protegida</strong>Si no llega, te devolvemos</span>
            </li>
          </ul>

          <div className="mt-5">
            <h2 className="mb-1.5 text-sm font-semibold">Descripción</h2>
            <p className="text-sm leading-relaxed text-tinta/85">{producto.descripcion}</p>
          </div>

          <div className="mt-5">
            <Personalizador producto={producto} />
          </div>

          {/* ¿Lo quiere diferente? Chat con el creador */}
          {creador?.uid && (
            <BotonEscribir creador={creador} texto="¿Lo quieres diferente? Escribe al creador" className="mt-4" />
          )}
        </div>
      </div>

      {delCreador.length > 0 && (
        <Fila titulo={`Más de ${creador?.taller}`} verTodo={`/creador/${producto.creador}`}>
          {delCreador.map((p) => (
            <TarjetaProducto key={p.slug} producto={p} />
          ))}
        </Fila>
      )}

      {parecidos.length > 0 && (
        <Fila titulo="También te puede gustar" verTodo={`/categoria/${producto.categoria}`}>
          {parecidos.map((p) => (
            <TarjetaProducto key={p.slug} producto={p} />
          ))}
        </Fila>
      )}
    </div>
  );
}
