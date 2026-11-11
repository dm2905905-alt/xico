import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, MapPin, Package, Star } from "lucide-react";
import { BotonEscribir } from "@/components/chat/BotonEscribir";
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
  const { creadorPorSlug, productosDeCreador, vendidosDeCreador } = consultas(await obtenerCatalogo());
  const creador = slug === RELLENO ? undefined : creadorPorSlug(slug);
  if (!creador) notFound();

  const estado = estadoPorSlug(creador.estado);
  const suyos = productosDeCreador(slug);
  const anteriores = vendidosDeCreador(slug);
  const vendidos = suyos.reduce((s, p) => s + p.vendidos, 0);
  const [a, b] = creador.colores;
  const iniciales = creador.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("");

  const numeros = [
    { valor: suyos.length, texto: "productos" },
    { valor: vendidos.toLocaleString("es-MX"), texto: "vendidos" },
    { valor: creador.resenas ? creador.calificacion.toFixed(1) : "—", texto: creador.resenas ? `${creador.resenas} reseñas` : "sin reseñas" },
  ];

  return (
    <>
      {/* Portada del taller */}
      <div className="patron-picado h-28 sm:h-44" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} />

      <div className="mx-auto max-w-5xl px-4">
        {/* Perfil: foto + números, como en una app */}
        <div className="-mt-12 flex items-end gap-4 sm:-mt-14">
          <span className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-full border-4 border-crema bg-tinta font-display text-3xl font-bold text-crema sm:size-28">
            {creador.foto ? (
              // eslint-disable-next-line @next/next/no-img-element -- miniatura ya reducida al subirla
              <img src={creador.foto.mini} alt={`Foto de ${creador.taller}`} className="size-full object-cover" />
            ) : (
              iniciales || creador.taller.slice(0, 1)
            )}
          </span>
          <ul className="grid flex-1 grid-cols-3 pb-1 text-center sm:max-w-sm">
            {numeros.map((n) => (
              <li key={n.texto}>
                <p className="flex items-center justify-center gap-0.5 text-lg font-bold sm:text-xl">
                  {n.texto.includes("reseñas") && creador.resenas > 0 && <Star className="size-4 fill-maiz text-maiz" />}
                  {n.valor}
                </p>
                <p className="text-xs text-cafe">{n.texto}</p>
              </li>
            ))}
          </ul>
        </div>

        <h1 className="mt-3 flex flex-wrap items-center gap-1.5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {creador.taller}
          {creador.verificado && <BadgeCheck className="size-6 text-jade" aria-label="Artista verificado" />}
        </h1>
        <p className="text-sm text-cafe">
          {[creador.nombre, creador.especialidad].filter(Boolean).join(" · ")}
        </p>
        {estado && (
          <Link href={`/estado/${estado.slug}`} className="mt-1 inline-flex items-center gap-1 text-sm text-jade hover:underline">
            <MapPin className="size-4" /> {[creador.ciudad, estado.nombre].filter(Boolean).join(", ")}
          </Link>
        )}

        {/* Insignias */}
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {creador.verificado && <span className="rounded-full bg-jade/10 px-3 py-1 font-semibold text-jade">✓ Artista verificado</span>}
          {creador.top && <span className="rounded-full bg-maiz/20 px-3 py-1 font-semibold text-terracota-oscura">⭐ Top vendedor</span>}
          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-arena-oscura">100% hecho por quien lo crea</span>
        </div>

        {/* Historia (se abre al tocar) */}
        {creador.historia && (
          <details className="group mt-4 rounded-2xl bg-white p-4 ring-1 ring-arena-oscura/60">
            <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
              Su historia <span className="text-terracota group-open:hidden">Leer más</span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-tinta/85">{creador.historia}</p>
          </details>
        )}

        {/* Pedir algo personalizado (dentro de XICO) */}
        {creador.uid && <BotonEscribir creador={creador} texto="Pedir algo personalizado" className="mt-4 sm:max-w-sm" />}

        {/* Productos */}
        <section className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold sm:text-2xl">
            <Package className="size-5 text-terracota" /> Productos <span className="text-sm font-normal text-cafe">({suyos.length})</span>
          </h2>
          {suyos.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {suyos.map((p) => (
                <TarjetaProducto key={p.slug} producto={p} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl bg-white p-6 text-center text-sm text-cafe ring-1 ring-arena-oscura/60">
              {anteriores.length ? "Por ahora no tiene piezas a la venta. Mira sus trabajos anteriores y pídele una parecida." : "Esta tienda aún no tiene productos."}
            </p>
          )}
        </section>

        {/* Piezas únicas ya vendidas: su portafolio */}
        {anteriores.length > 0 && (
          <section className="mt-8">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold sm:text-2xl">
              Trabajos anteriores <span className="text-sm font-normal text-cafe">({anteriores.length})</span>
            </h2>
            <p className="mb-3 text-sm text-cafe">Piezas que ya encontraron dueño. ¿Te gusta alguna? Pídele una parecida.</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {anteriores.map((p) => (
                <TarjetaProducto key={p.slug} producto={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
