import Link from "next/link";
import { BadgeCheck, Clock, Gift, MapPin, Play, ShieldCheck, Sparkles, Store, Trophy, Truck } from "lucide-react";
import { CreadorDestacado } from "@/components/CreadorDestacado";
import { Fila } from "@/components/Fila";
import { IconoCategoria } from "@/components/IconoCategoria";
import { TarjetaProducto } from "@/components/TarjetaProducto";
import { consultas, obtenerCatalogo } from "@/lib/catalogo";
import { categorias, estados } from "@/lib/datos";

// Inicio estilo app: categorías como botones, banners que se deslizan y filas de productos
export default async function Inicio() {
  const { productos, creadores, ofertas, nuevos, masVendidos, desde99, creadoresDestacados, productosDeCreador } = consultas(await obtenerCatalogo());
  // Estados con creadores primero
  const conCreadores = new Set(creadores.map((c) => c.estado));
  const estadosFila = [...estados].sort((a, b) => Number(conCreadores.has(b.slug)) - Number(conCreadores.has(a.slug))).slice(0, 12);

  const listaOfertas = ofertas();
  const listaNuevos = nuevos();
  const listaBaratos = desde99();
  const destacado = creadoresDestacados(1)[0];

  const banners = [
    { href: "/descubre", titulo: "Descubre: así se hace", texto: "Videos de creadores haciendo sus piezas", icono: Play, fondo: "bg-tinta" },
    { href: "/destacados", titulo: "Lo más vendido", texto: "Los favoritos y los mejores creadores", icono: Trophy, fondo: "bg-terracota-oscura" },
    { href: "/regalos", titulo: "Encuentra un regalo", texto: "Dinos para quién y tu presupuesto", icono: Gift, fondo: "bg-rosa" },
    { href: "/estados", titulo: "Explora el mapa", texto: "Creadores de cada estado de México", icono: MapPin, fondo: "bg-jade" },
    { href: "/buscar?ofertas=1", titulo: "Ofertas del día", texto: "Precios especiales por tiempo limitado", icono: Clock, fondo: "bg-terracota" },
    { href: "/vende", titulo: "¿Haces cosas a mano?", texto: "Abre tu tienda en XICO", icono: Store, fondo: "degradado-xico" },
  ];

  return (
    <div className="pb-6">
      {/* Categorías: botones que se deslizan */}
      <nav aria-label="Categorías" className="mx-auto max-w-7xl">
        <ul className="sin-barra flex gap-2 overflow-x-auto px-4 pt-4 pb-1">
          {categorias.map((c) => (
            <li key={c.slug} className="shrink-0">
              <Link
                href={`/categoria/${c.slug}`}
                className="flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-sm font-medium whitespace-nowrap ring-1 ring-arena-oscura transition hover:bg-arena hover:ring-terracota"
              >
                <IconoCategoria slug={c.slug} className="size-4 text-terracota" />
                {c.nombre}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Tienda recién creada: aún no hay productos en la base de datos */}
      {productos.length === 0 && (
        <p className="mx-4 mt-4 rounded-2xl bg-maiz/20 px-5 py-4 text-sm">
          <strong>La tienda todavía no tiene productos.</strong> Si eres el administrador, entra a{" "}
          <Link href="/admin" className="font-semibold text-terracota underline">/admin</Link> para importar los datos de ejemplo.
        </p>
      )}

      {/* Banners */}
      <div className="mx-auto max-w-7xl">
        <ul className="sin-barra mt-3 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 *:w-[85%] *:shrink-0 *:snap-start sm:*:w-[360px] lg:*:w-[300px]">
          {banners.map((b, i) => (
            <li key={b.href}>
              <Link
                href={b.href}
                className={`${b.fondo} patron-picado relative flex h-32 flex-col justify-end overflow-hidden rounded-3xl p-5 text-white transition hover:brightness-110 ${i === 0 ? "sm:h-36" : ""}`}
              >
                <b.icono className="absolute top-4 right-4 size-10 text-white/35" strokeWidth={1.5} />
                <span className="font-display text-xl leading-tight font-extrabold">{b.titulo}</span>
                <span className="mt-0.5 text-sm text-white/85">{b.texto}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {listaOfertas.length > 0 && (
        <Fila titulo={<span className="flex items-center gap-1.5">Ofertas del día <Clock className="size-5 text-rosa" /></span>} verTodo="/buscar?ofertas=1">
          {listaOfertas.map((p) => (
            <TarjetaProducto key={p.slug} producto={p} />
          ))}
        </Fila>
      )}

      {productos.length > 0 && (
        <Fila titulo="Lo más vendido" verTodo="/destacados">
          {masVendidos().map((p) => (
            <TarjetaProducto key={p.slug} producto={p} />
          ))}
        </Fila>
      )}

      {/* Creador destacado */}
      {destacado && (
        <section className="mx-auto mt-7 max-w-7xl px-4 md:mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold tracking-tight sm:text-2xl">Creador destacado</h2>
            <Link href="/destacados" className="rounded-full px-2 py-1 text-sm font-semibold text-terracota hover:bg-terracota/10">
              Ver ranking →
            </Link>
          </div>
          <CreadorDestacado creador={destacado.creador} piezas={destacado.piezas} productos={productosDeCreador(destacado.creador.slug)} />
        </section>
      )}

      {/* Creadores: círculos tipo "historias" */}
      {creadores.length > 0 && (
        <Fila titulo="Creadores" verTodo="/creadores" tamano="creador">
          {creadores.slice(0, 16).map((c) => (
            <Link key={c.slug} href={`/creador/${c.slug}`} className="group flex flex-col items-center gap-1.5 text-center">
              <span className="rounded-full p-[3px]" style={{ background: `linear-gradient(135deg, ${c.colores[0]}, ${c.colores[1]})` }}>
                <span className="grid size-16 place-items-center overflow-hidden rounded-full border-[3px] border-white bg-tinta font-display text-lg font-bold text-crema sm:size-20">
                  {c.foto ? (
                    // eslint-disable-next-line @next/next/no-img-element -- miniatura ya reducida al subirla
                    <img src={c.foto.mini} alt="" className="size-full object-cover" />
                  ) : (
                    c.taller.slice(0, 1).toUpperCase()
                  )}
                </span>
              </span>
              <span className="flex w-full items-center justify-center gap-0.5 text-xs font-medium">
                <span className="truncate">{c.taller}</span>
                {c.verificado && <BadgeCheck className="size-3.5 shrink-0 text-jade" aria-label="Verificado" />}
              </span>
            </Link>
          ))}
        </Fila>
      )}

      {listaNuevos.length > 0 && (
        <Fila titulo="Recién salidos del taller" verTodo="/buscar?orden=nuevos">
          {listaNuevos.map((p) => (
            <TarjetaProducto key={p.slug} producto={p} />
          ))}
        </Fila>
      )}

      {/* Estados */}
      <section className="mx-auto mt-7 max-w-7xl md:mt-10">
        <div className="mb-3 flex items-center justify-between px-4">
          <h2 className="font-display text-lg font-bold tracking-tight sm:text-2xl">Hecho en México</h2>
          <Link href="/estados" className="flex items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold text-terracota hover:bg-terracota/10">
            <MapPin className="size-4" /> Ver mapa
          </Link>
        </div>
        <ul className="sin-barra flex gap-2 overflow-x-auto px-4 pb-1">
          {estadosFila.map((e) => (
            <li key={e.slug} className="shrink-0">
              <Link
                href={`/estado/${e.slug}`}
                className="flex items-center gap-2 rounded-2xl py-2 pr-4 pl-2 text-sm font-semibold text-white transition hover:brightness-110"
                style={{ background: `linear-gradient(135deg, ${e.colores[1]}, ${e.colores[0]})` }}
              >
                <span className="grid size-8 place-items-center rounded-xl bg-white/25">
                  <MapPin className="size-4" />
                </span>
                {e.nombre}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {listaBaratos.length > 0 && (
        <Fila titulo="Desde $99" verTodo="/buscar?max=99">
          {listaBaratos.map((p) => (
            <TarjetaProducto key={p.slug} producto={p} />
          ))}
        </Fila>
      )}

      {/* Todo: cuadrícula para seguir viendo */}
      {productos.length > 0 && (
        <section className="mx-auto mt-7 max-w-7xl px-4 md:mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-lg font-bold tracking-tight sm:text-2xl">Para ti</h2>
            <Link href="/buscar" className="rounded-full px-2 py-1 text-sm font-semibold text-terracota hover:bg-terracota/10">
              Ver todo →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
            {productos.slice(0, 20).map((p) => (
              <TarjetaProducto key={p.slug} producto={p} />
            ))}
          </div>
        </section>
      )}

      {/* Garantías */}
      <ul className="mx-auto mt-10 grid max-w-7xl gap-2 px-4 text-sm sm:grid-cols-3">
        {[
          { icono: ShieldCheck, color: "text-jade", titulo: "Sin reventa", texto: "Cada tienda es revisada por XICO" },
          { icono: Sparkles, color: "text-rosa", titulo: "Personalizable", texto: "Nombres, colores o tu foto" },
          { icono: Truck, color: "text-terracota", titulo: "Envíos a todo México", texto: "Con número de rastreo" },
        ].map((g) => (
          <li key={g.titulo} className="flex items-center gap-3 rounded-2xl bg-white/80 p-3 ring-1 ring-arena-oscura/60">
            <g.icono className={`size-6 shrink-0 ${g.color}`} />
            <span>
              <strong className="block">{g.titulo}</strong>
              <span className="text-xs text-cafe">{g.texto}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
