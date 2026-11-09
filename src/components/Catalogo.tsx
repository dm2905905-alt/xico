import Link from "next/link";
import { SearchX } from "lucide-react";
import { buscarProductos, type Filtros } from "@/lib/busqueda";
import { obtenerCatalogo } from "@/lib/catalogo";
import { PanelFiltros } from "./PanelFiltros";
import { TarjetaProducto } from "./TarjetaProducto";

// Catálogo reutilizable: filtros a la izquierda (arriba en celular) y mosaico de productos
export async function Catalogo({
  filtros,
  ruta,
  fijos = [],
}: {
  filtros: Filtros;
  ruta: string;
  fijos?: (keyof Filtros)[];
}) {
  const { productos } = await obtenerCatalogo();
  const resultados = buscarProductos(productos, filtros);

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-36 lg:self-start">
        <PanelFiltros valores={filtros} ruta={ruta} fijos={fijos} />
      </aside>

      <div>
        <p className="mb-4 text-sm text-cafe">
          {resultados.length} {resultados.length === 1 ? "producto" : "productos"}
        </p>
        {resultados.length ? (
          <div className="columns-2 gap-4 sm:columns-3 xl:columns-4 *:mb-4 *:break-inside-avoid">
            {resultados.map((p) => (
              <TarjetaProducto key={p.slug} producto={p} mosaico />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white px-6 py-16 text-center ring-1 ring-arena-oscura/50">
            <SearchX className="mx-auto size-10 text-cafe/60" />
            <h2 className="mt-4 font-display text-xl font-semibold">No encontramos productos con esos filtros</h2>
            <p className="mt-1 text-sm text-cafe">Prueba con otras palabras o quita algún filtro.</p>
            <Link href="/buscar" className="mt-6 inline-block rounded-full bg-terracota px-5 py-2.5 text-sm font-semibold text-crema">
              Ver todos los productos
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function CatalogoCargando() {
  return (
    <div className="grid gap-8 lg:grid-cols-[240px_1fr]" aria-busy>
      <div className="h-40 animate-pulse rounded-2xl bg-arena" />
      <div className="columns-2 gap-4 sm:columns-3 xl:columns-4 *:mb-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className={`animate-pulse rounded-2xl bg-arena ${i % 3 ? "h-64" : "h-80"}`} />
        ))}
      </div>
    </div>
  );
}
