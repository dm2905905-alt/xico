"use client";

import Link from "next/link";
import { ShoppingBag, Trash2, Truck } from "lucide-react";
import { useEnNavegador } from "@/lib/almacen";
import { ENVIO_GRATIS_DESDE, cambiarCantidad, quitarDelCarrito, resumirCarrito, useCarrito } from "@/lib/carrito";
import { precio } from "@/lib/formato";
import { FotoProducto } from "./FotoProducto";

export function VistaCarrito() {
  const lista = useCarrito();
  const listo = useEnNavegador();
  const { grupos, productos, envio, total, piezas } = resumirCarrito(lista);

  if (!listo) return <div className="h-64 animate-pulse rounded-3xl bg-arena" />;

  if (!grupos.length) {
    return (
      <div className="rounded-3xl bg-white px-6 py-16 text-center ring-1 ring-arena-oscura/50">
        <ShoppingBag className="mx-auto size-12 text-cafe/50" />
        <h2 className="mt-4 font-display text-2xl font-semibold">Tu carrito está vacío</h2>
        <p className="mt-1 text-cafe">Descubre piezas hechas a mano por creadores de todo México.</p>
        <Link href="/" className="mt-6 inline-block rounded-full bg-terracota px-6 py-3 font-semibold text-crema hover:bg-terracota-oscura">
          Explorar productos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:gap-8">
      <div className="grid gap-4">
        {grupos.map((g) => {
          const faltaEnvioGratis = ENVIO_GRATIS_DESDE - g.subtotal;
          return (
            <section key={g.creador} className="overflow-hidden rounded-3xl bg-white ring-1 ring-arena-oscura/60">
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-arena-oscura/60 bg-arena/40 px-4 py-2.5">
                <Link href={`/creador/${g.creador}`} className="font-semibold hover:text-terracota">
                  {g.taller}
                </Link>
                <span className="flex items-center gap-1.5 text-xs text-cafe">
                  <Truck className="size-4" />
                  {g.envio === 0 ? (
                    <span className="font-semibold text-jade">Envío gratis</span>
                  ) : (
                    <>Te faltan {precio(faltaEnvioGratis)} para envío gratis</>
                  )}
                </span>
              </header>

              <ul className="divide-y divide-arena-oscura/50">
                {g.articulos.map((a) => (
                  <li key={a.id} className="flex gap-3 p-4">
                    <Link href={`/producto/${a.producto.slug}`} className="w-20 shrink-0 self-start overflow-hidden rounded-xl sm:w-24">
                      <FotoProducto producto={a.producto} uniforme />
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3">
                        <Link href={`/producto/${a.producto.slug}`} className="line-clamp-2 text-sm font-medium hover:text-terracota">
                          {a.producto.nombre}
                        </Link>
                        <p className="shrink-0 font-bold">{precio(a.precioUnitario * a.cantidad)}</p>
                      </div>

                      {a.opciones.length > 0 && (
                        <dl className="mt-1.5 grid gap-0.5 text-xs text-cafe">
                          {a.opciones.map((o) => (
                            <div key={o.etiqueta} className="flex gap-1">
                              <dt>{o.etiqueta}:</dt>
                              <dd className="truncate font-medium text-tinta">{o.valor}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                      {!a.foto && a.conFoto && (
                        <p className="mt-2 text-xs text-cafe">📷 Tu foto de referencia está en el dispositivo donde la subiste.</p>
                      )}
                      {a.foto && (
                        // eslint-disable-next-line @next/next/no-img-element -- foto de referencia guardada en el navegador
                        <img src={a.foto} alt="Tu foto de referencia" className="mt-2 size-12 rounded-lg object-cover ring-1 ring-arena-oscura" />
                      )}

                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex h-9 items-center rounded-full border border-arena-oscura">
                          <button onClick={() => cambiarCantidad(a.id, a.cantidad - 1)} className="size-9 rounded-full hover:bg-arena" aria-label="Quitar uno">−</button>
                          <span className="w-7 text-center text-sm font-semibold">{a.cantidad}</span>
                          <button onClick={() => cambiarCantidad(a.id, a.cantidad + 1)} className="size-9 rounded-full hover:bg-arena" aria-label="Agregar uno">+</button>
                        </div>
                        <button onClick={() => quitarDelCarrito(a.id)} aria-label={`Quitar ${a.producto.nombre}`} className="grid size-9 place-items-center rounded-full text-cafe hover:bg-rosa/10 hover:text-rosa">
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <footer className="flex justify-between border-t border-arena-oscura/60 px-4 py-2.5 text-sm">
                <span className="text-cafe">Subtotal de {g.taller}</span>
                <span className="font-semibold">{precio(g.subtotal)}</span>
              </footer>
            </section>
          );
        })}
      </div>

      {/* Resumen */}
      <aside className="self-start rounded-3xl bg-white p-5 ring-1 ring-arena-oscura/60 lg:sticky lg:top-24 lg:p-6">
        <h2 className="font-display text-xl font-semibold">Resumen</h2>
        <dl className="mt-4 grid gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-cafe">Productos ({piezas} {piezas === 1 ? "pieza" : "piezas"})</dt>
            <dd>{precio(productos)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-cafe">Envío estimado ({grupos.length} {grupos.length === 1 ? "paquete" : "paquetes"})</dt>
            <dd>{envio === 0 ? <span className="font-semibold text-jade">Gratis</span> : precio(envio)}</dd>
          </div>
          <div className="mt-2 flex justify-between border-t border-arena-oscura/60 pt-3 text-lg font-bold">
            <dt>Total</dt>
            <dd>{precio(total)}</dd>
          </div>
        </dl>
        {grupos.length > 1 && (
          <p className="mt-3 rounded-xl bg-arena/60 p-3 text-xs text-cafe">
            Compras a {grupos.length} creadores en un solo pago. Cada uno te envía su paquete por separado.
          </p>
        )}
        <Link
          href="/pagar"
          className="mt-5 hidden h-12 items-center justify-center rounded-full bg-terracota font-semibold text-crema transition hover:bg-terracota-oscura md:flex"
        >
          Continuar al pago
        </Link>
        <Link href="/" className="mt-3 block text-center text-sm text-cafe hover:underline">
          Seguir comprando
        </Link>
      </aside>

      {/* Celular: total y botón de pago fijos abajo (como en una app) */}
      <div className="h-20 md:hidden" aria-hidden />
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-arena-oscura/70 bg-crema/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
        <div className="min-w-0">
          <p className="text-xs text-cafe">Total ({piezas} {piezas === 1 ? "pieza" : "piezas"})</p>
          <p className="text-lg font-bold">{precio(total)}</p>
        </div>
        <Link href="/pagar" className="flex h-12 flex-1 items-center justify-center rounded-full bg-terracota font-semibold text-crema">
          Continuar al pago
        </Link>
      </div>
    </div>
  );
}
