"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { crearAlmacen, useEnNavegador } from "@/lib/almacen";
import { resumirCarrito, useCarrito } from "@/lib/carrito";
import { precio } from "@/lib/formato";
import { camposDireccion, problemaDireccion, type ArticuloSolicitado, type Direccion } from "@/lib/pedidos";
import { FormularioEntrar } from "./FormularioEntrar";
import { useSesion } from "./Sesion";

// La última dirección usada se recuerda en este dispositivo para la próxima compra
const almacenDireccion = crearAlmacen<Partial<Direccion>>("xico-direccion", {});

export function VistaPagar() {
  const router = useRouter();
  const listo = useEnNavegador();
  const { usuario, cargando } = useSesion();
  const carrito = useCarrito();
  const { grupos, productos, envio, total, piezas } = resumirCarrito(carrito);
  const direccion = almacenDireccion.useValor();
  const [error, setError] = useState("");
  const [pagando, setPagando] = useState(false);

  // Sin productos no hay nada que pagar
  useEffect(() => {
    if (listo && !grupos.length && !pagando) router.replace("/carrito");
  }, [listo, grupos.length, pagando, router]);

  if (!listo || cargando || !grupos.length) return <div className="h-64 animate-pulse rounded-3xl bg-arena" />;

  const poner = (k: keyof Direccion, v: string) => almacenDireccion.escribir((d) => ({ ...d, [k]: v }));

  async function pagar() {
    const problema = problemaDireccion(direccion);
    if (problema) return setError(problema);
    if (!usuario) return setError("Primero entra a tu cuenta.");
    setError("");
    setPagando(true);
    try {
      const articulos: ArticuloSolicitado[] = carrito.map((a) => ({
        slug: a.producto.slug,
        cantidad: a.cantidad,
        extras: a.extras,
        extrasIds: a.extrasIds,
        opciones: a.opciones,
      }));
      const r = await fetch("/api/pagos/crear", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await usuario.getIdToken()}` },
        body: JSON.stringify({ articulos, direccion }),
      });
      const datos = await r.json();
      if (!r.ok || !datos.url) throw new Error(datos.error ?? "No se pudo iniciar el pago.");
      window.location.href = datos.url; // a Mercado Pago
    } catch (e) {
      setError((e as Error).message || "No se pudo iniciar el pago.");
      setPagando(false);
    }
  }

  const campo =
    "h-11 w-full rounded-xl border border-arena-oscura bg-white px-3.5 text-sm outline-none focus:border-terracota focus:ring-2 focus:ring-terracota/15";

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[1fr_360px] lg:gap-8">
      <div className="order-2 grid content-start gap-4 lg:order-1">
        {/* Paso 1: cuenta (solo se pide aquí, al pagar) */}
        <section className="rounded-3xl bg-white p-5 ring-1 ring-arena-oscura/60 sm:p-6">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <span className="grid size-7 place-items-center rounded-full bg-terracota text-sm text-crema">1</span> Tu cuenta
          </h2>
          {usuario ? (
            <p className="mt-3 text-sm">
              Comprando como <strong>{usuario.displayName ?? usuario.phoneNumber ?? usuario.email}</strong>
            </p>
          ) : (
            <div className="mt-4 max-w-sm">
              <p className="mb-4 text-sm text-cafe">Entra para guardar tu pedido y darle seguimiento. Es rápido, sin contraseñas.</p>
              <FormularioEntrar volver="/pagar" />
            </div>
          )}
        </section>

        {/* Paso 2: dirección */}
        <section className={`rounded-3xl bg-white p-5 ring-1 ring-arena-oscura/60 sm:p-6 ${usuario ? "" : "pointer-events-none opacity-50"}`}>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <span className={`grid size-7 place-items-center rounded-full text-sm ${usuario ? "bg-terracota text-crema" : "bg-arena-oscura"}`}>2</span>
            Dirección de envío
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {camposDireccion.map((c) => (
              <label key={c.clave} className={`grid gap-1 text-sm font-medium ${c.ancho ? "sm:col-span-2" : ""}`}>
                {c.etiqueta}
                <input
                  className={campo}
                  type={c.tipo ?? "text"}
                  inputMode={c.clave === "cp" || c.clave === "telefono" ? "numeric" : undefined}
                  maxLength={c.max}
                  value={direccion[c.clave] ?? ""}
                  onChange={(e) => poner(c.clave, e.target.value)}
                  autoComplete={
                    {
                      nombre: "name",
                      telefono: "tel-national",
                      cp: "postal-code",
                      calle: "address-line1",
                      numero: "address-line2",
                      colonia: "address-level3",
                      ciudad: "address-level2",
                      estado: "address-level1",
                      referencias: "off",
                    }[c.clave]
                  }
                  disabled={!usuario}
                />
              </label>
            ))}
          </div>
        </section>

        {/* Paso 3: pago */}
        <section className={`rounded-3xl bg-white p-5 ring-1 ring-arena-oscura/60 sm:p-6 ${usuario ? "" : "opacity-50"}`}>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <span className={`grid size-7 place-items-center rounded-full text-sm ${usuario ? "bg-terracota text-crema" : "bg-arena-oscura"}`}>3</span>
            Pago con Mercado Pago
          </h2>
          <p className="mt-3 text-sm text-cafe">
            Te llevamos a Mercado Pago para pagar con tarjeta, OXXO o tu saldo. Al terminar regresas aquí a ver tu pedido.
          </p>
          {error && (
            <p role="alert" className="mt-4 hidden rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa md:block">
              {error}
            </p>
          )}
          <button
            onClick={pagar}
            disabled={!usuario || pagando}
            className="mt-5 hidden h-14 w-auto items-center justify-center gap-2 rounded-full bg-[#009ee3] px-10 text-base font-semibold text-white transition hover:bg-[#0089c7] disabled:opacity-60 md:flex"
          >
            {pagando ? <Loader2 className="size-5 animate-spin" /> : <Lock className="size-5" />}
            {pagando ? "Preparando tu pago…" : `Pagar ${precio(total)} con Mercado Pago`}
          </button>
        </section>

        {/* Celular: botón de pago fijo abajo (como en una app) */}
        <div className="h-20 md:hidden" aria-hidden />
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-arena-oscura/70 bg-crema/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
          {error && (
            <p role="alert" className="mb-2 rounded-xl bg-rosa/10 px-4 py-2.5 text-sm text-rosa">
              {error}
            </p>
          )}
          <button
            onClick={pagar}
            disabled={!usuario || pagando}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#009ee3] font-semibold text-white disabled:opacity-60"
          >
            {pagando ? <Loader2 className="size-5 animate-spin" /> : <Lock className="size-5" />}
            {pagando ? "Preparando tu pago…" : usuario ? `Pagar ${precio(total)}` : "Entra a tu cuenta para pagar"}
          </button>
        </div>
      </div>

      <aside className="order-1 self-start rounded-3xl bg-white p-5 ring-1 ring-arena-oscura/60 sm:p-6 lg:sticky lg:top-24 lg:order-2">
        <h2 className="font-display text-xl font-semibold">Tu pedido</h2>
        <ul className="mt-4 grid gap-2 text-sm">
          {grupos.map((g) => (
            <li key={g.creador} className="flex justify-between gap-3">
              <span className="text-cafe">
                {g.taller} · {g.articulos.reduce((s, a) => s + a.cantidad, 0)} pz
              </span>
              <span>{precio(g.subtotal)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-4 grid gap-2 border-t border-arena-oscura/60 pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-cafe">Productos ({piezas})</dt>
            <dd>{precio(productos)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-cafe">Envío</dt>
            <dd>{envio === 0 ? "Gratis" : precio(envio)}</dd>
          </div>
          <div className="mt-1 flex justify-between text-lg font-bold">
            <dt>Total</dt>
            <dd>{precio(total)}</dd>
          </div>
        </dl>
        <p className="mt-4 flex items-start gap-2 text-xs text-cafe">
          <ShieldCheck className="size-4 shrink-0 text-jade" /> Compra protegida: si tu pedido no llega o no es lo que pediste, te devolvemos tu dinero.
        </p>
        <p className="mt-2 flex items-center gap-2 text-xs text-cafe">
          <Lock className="size-4 shrink-0" /> Pago seguro procesado por Mercado Pago. XICO nunca ve los datos de tu tarjeta.
        </p>
        <Link href="/carrito" className="mt-4 block text-center text-sm text-cafe hover:underline">
          ← Editar carrito
        </Link>
      </aside>
    </div>
  );
}
