import Link from "next/link";
import { Gift, MapPin, Play, ShieldCheck, Sparkles, Truck, Clock } from "lucide-react";
import { Buscador } from "@/components/Buscador";
import { IconoCategoria } from "@/components/IconoCategoria";
import { Carrusel, Seccion } from "@/components/Seccion";
import { TarjetaCreador } from "@/components/TarjetaCreador";
import { TarjetaProducto } from "@/components/TarjetaProducto";
import { consultas, obtenerCatalogo } from "@/lib/catalogo";
import { categorias, estados } from "@/lib/datos";

const busquedasPopulares = ["funda pintada", "cuadro de Frida", "vela de copal", "taza con nombre", "aretes de plata"];

export default async function Inicio() {
  const { productos, creadores, ofertas, nuevos, masVendidos, desde99 } = consultas(await obtenerCatalogo());

  return (
    <>
      {/* Portada */}
      <section className="degradado-xico relative overflow-hidden text-white">
        <div className="patron-picado absolute inset-0 opacity-70" aria-hidden />
        {/* Destellos de color */}
        <div className="absolute -top-24 -left-20 size-72 rounded-full bg-maiz/30 blur-3xl" aria-hidden />
        <div className="absolute -right-16 -bottom-28 size-80 rounded-full bg-white/20 blur-3xl" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.1fr_1fr] lg:py-20">
          <div>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles className="size-3.5 text-maiz" /> 100% hecho por quien lo crea
            </p>
            <h1 className="font-display text-4xl leading-[1.02] font-extrabold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              Cosas únicas, hechas a mano por <span className="text-maiz">gente creativa</span> de todo México
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/90">
              Fundas pintadas, ropa intervenida, arte, joyería, velas y regalos personalizados. Si alguien lo crea, aquí lo encuentras.
            </p>
            <div className="mt-8 max-w-xl text-tinta">
              <Buscador grande />
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-white/85">Populares:</span>
                {busquedasPopulares.map((b) => (
                  <Link
                    key={b}
                    href={`/buscar?q=${encodeURIComponent(b)}`}
                    className="rounded-full bg-white/20 px-3 py-1 text-white ring-1 ring-white/30 backdrop-blur transition hover:bg-white hover:text-terracota"
                  >
                    {b}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Collage juguetón: tarjetas blancas ligeramente inclinadas */}
          <div className="hidden grid-cols-3 gap-4 lg:grid" aria-hidden>
            {productos.slice(0, 6).map((p, i) => (
              <div
                key={p.slug}
                className={`rounded-3xl bg-white p-2 shadow-xl shadow-tinta/20 ${i % 2 ? "mt-10 rotate-3" : "-rotate-2"}`}
              >
                <div
                  className={`patron-picado grid place-items-center rounded-2xl ${i % 2 ? "h-40" : "h-48"}`}
                  style={{ background: `linear-gradient(135deg, ${p.colores[0]}, ${p.colores[1]})` }}
                >
                  <IconoCategoria slug={p.categoria} className="size-12 text-white/90" strokeWidth={1.25} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tienda recién creada: aún no hay productos en la base de datos */}
      {productos.length === 0 && (
        <div className="mx-auto mt-8 max-w-7xl px-4">
          <p className="rounded-2xl bg-maiz/20 px-5 py-4 text-sm">
            <strong>La tienda todavía no tiene productos.</strong> Si eres el administrador, entra a{" "}
            <Link href="/admin" className="font-semibold text-terracota underline">/admin</Link> para importar los datos de ejemplo.
          </p>
        </div>
      )}

      {/* Garantías */}
      <section className="border-b border-arena-oscura/60 bg-white">
        <ul className="mx-auto grid max-w-7xl grid-cols-1 gap-4 px-4 py-5 text-sm sm:grid-cols-3">
          <li className="flex items-center gap-3">
            <ShieldCheck className="size-6 shrink-0 text-jade" />
            <span><strong>Sin reventa ni importados.</strong> Cada creador es verificado.</span>
          </li>
          <li className="flex items-center gap-3">
            <Sparkles className="size-6 shrink-0 text-rosa" />
            <span><strong>Personaliza tu pieza</strong> con nombres, colores o tu foto.</span>
          </li>
          <li className="flex items-center gap-3">
            <Truck className="size-6 shrink-0 text-terracota" />
            <span><strong>Envíos a todo México</strong> con seguimiento.</span>
          </li>
        </ul>
      </section>

      {/* Categorías */}
      <section className="mx-auto mt-10 max-w-7xl px-4">
        <ul className="sin-barra -mx-4 flex gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-8">
          {categorias.map((c) => (
            <li key={c.slug} className="shrink-0">
              <Link
                href={`/categoria/${c.slug}`}
                className="flex w-24 flex-col items-center gap-2 rounded-2xl p-2 text-center text-xs font-medium hover:bg-arena sm:w-auto"
              >
                <span className="grid size-16 place-items-center rounded-full bg-white ring-1 ring-arena-oscura">
                  <IconoCategoria slug={c.slug} className="size-7 text-terracota" strokeWidth={1.5} />
                </span>
                {c.nombre}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* Ofertas del día */}
      <Seccion
        titulo={
          <span className="flex items-center gap-2">
            Ofertas del día <Clock className="size-6 text-rosa" />
          </span>
        }
        subtitulo="Precios especiales por tiempo limitado"
        verTodo="/buscar?ofertas=1"
      >
        <Carrusel>
          {ofertas().map((p) => (
            <TarjetaProducto key={p.slug} producto={p} />
          ))}
        </Carrusel>
      </Seccion>

      {/* Accesos especiales */}
      <section className="mx-auto mt-14 grid max-w-7xl gap-4 px-4 md:grid-cols-2">
        <Link href="/descubre" className="group relative overflow-hidden rounded-3xl bg-tinta p-7 text-crema">
          <div className="patron-picado absolute inset-0 opacity-40" aria-hidden />
          <div className="relative">
            <span className="grid size-12 place-items-center rounded-full bg-crema text-tinta transition group-hover:scale-110">
              <Play className="size-5 fill-tinta" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-semibold">Descubre: así se hace</h2>
            <p className="mt-1 max-w-sm text-crema/75">Videos del boceto al producto terminado. Dale like y compra sin salir del video.</p>
          </div>
        </Link>
        <Link href="/regalos" className="group relative overflow-hidden rounded-3xl bg-rosa p-7 text-white">
          <div className="patron-picado absolute inset-0 opacity-40" aria-hidden />
          <div className="relative">
            <span className="grid size-12 place-items-center rounded-full bg-white text-rosa transition group-hover:scale-110">
              <Gift className="size-5" />
            </span>
            <h2 className="mt-5 font-display text-2xl font-semibold">Encuentra un regalo</h2>
            <p className="mt-1 max-w-sm text-white/85">Dinos para quién, la ocasión y tu presupuesto. Te sugerimos lo ideal.</p>
          </div>
        </Link>
      </section>

      {/* Más vendidos: mosaico tipo Pinterest */}
      <Seccion titulo="Más vendidos" subtitulo="Lo que más se está llevando México" verTodo="/buscar?orden=vendidos">
        <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 *:mb-4 *:break-inside-avoid">
          {masVendidos().map((p) => (
            <TarjetaProducto key={p.slug} producto={p} mosaico />
          ))}
        </div>
      </Seccion>

      {/* Hecho en México: por estado */}
      <Seccion titulo="Hecho en México" subtitulo="Compra por estado y conoce su tradición" verTodo="/estados">
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {estados.map((e) => (
            <li key={e.slug}>
              <Link
                href={`/estado/${e.slug}`}
                className="patron-picado flex h-32 flex-col justify-end rounded-2xl p-4 text-white transition hover:brightness-110"
                style={{ background: `linear-gradient(160deg, ${e.colores[1]}, ${e.colores[0]})` }}
              >
                <span className="flex items-center gap-1 font-display text-lg font-semibold">
                  <MapPin className="size-4" /> {e.nombre}
                </span>
                <span className="text-xs text-white/85">{e.especialidad}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Seccion>

      {/* Nuevos */}
      <Seccion titulo="Nuevos productos" subtitulo="Recién salidos del taller" verTodo="/buscar?orden=nuevos">
        <Carrusel>
          {nuevos().map((p) => (
            <TarjetaProducto key={p.slug} producto={p} />
          ))}
        </Carrusel>
      </Seccion>

      {/* Creadores destacados */}
      <Seccion titulo="Creadores destacados" subtitulo="Conoce las manos detrás de cada pieza" verTodo="/creadores">
        <div className="sin-barra -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-3">
          {creadores.slice(0, 6).map((c) => (
            <TarjetaCreador key={c.slug} creador={c} />
          ))}
        </div>
      </Seccion>

      {/* Desde $99 */}
      <Seccion titulo="Desde $99" subtitulo="Detalles hechos a mano que caben en cualquier bolsillo" verTodo="/buscar?max=99">
        <Carrusel>
          {desde99().map((p) => (
            <TarjetaProducto key={p.slug} producto={p} />
          ))}
        </Carrusel>
      </Seccion>

      {/* Llamado a creadores */}
      <section className="mx-auto mt-16 max-w-7xl px-4">
        <div className="degradado-xico relative overflow-hidden rounded-3xl px-6 py-12 text-center text-white sm:px-12">
          <div className="patron-picado absolute inset-0 opacity-50" aria-hidden />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">¿Haces cosas increíbles con tus manos?</h2>
            <p className="mt-3 text-crema/90">
              Sube fotos desde tu celular y nuestra IA arma tu tienda: mejora tus fotos, escribe tus descripciones y te
              sugiere precios. Tú solo crea.
            </p>
            <Link
              href="/vende"
              className="mt-7 inline-block rounded-full bg-crema px-7 py-3 font-semibold text-terracota-oscura transition hover:bg-white"
            >
              Empieza a vender en XICO
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
