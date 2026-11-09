"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { useEnNavegador } from "@/lib/almacen";
import { resumirCarrito, useCarrito } from "@/lib/carrito";
import { precio } from "@/lib/formato";
import { FormularioEntrar } from "./FormularioEntrar";
import { useSesion } from "./Sesion";

export function VistaPagar() {
  const router = useRouter();
  const listo = useEnNavegador();
  const { usuario, cargando } = useSesion();
  const { grupos, productos, envio, total, piezas } = resumirCarrito(useCarrito());

  // Sin productos no hay nada que pagar
  useEffect(() => {
    if (listo && !grupos.length) router.replace("/carrito");
  }, [listo, grupos.length, router]);

  if (!listo || cargando || !grupos.length) return <div className="h-64 animate-pulse rounded-3xl bg-arena" />;

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="grid content-start gap-5">
        {/* Paso 1: cuenta (solo se pide aquí, al pagar) */}
        <section className="rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60">
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

        {/* Pasos siguientes: se construyen en la Fase 6 */}
        <section className={`rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60 ${usuario ? "" : "opacity-50"}`}>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <span className="grid size-7 place-items-center rounded-full bg-arena-oscura text-sm">2</span> Dirección de envío
          </h2>
          <p className="mt-3 text-sm text-cafe">Próximamente (Fase 6).</p>
        </section>
        <section className={`rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60 ${usuario ? "" : "opacity-50"}`}>
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
            <span className="grid size-7 place-items-center rounded-full bg-arena-oscura text-sm">3</span> Pago con Mercado Pago
          </h2>
          <p className="mt-3 text-sm text-cafe">
            Tarjeta, OXXO o saldo de Mercado Pago. Se conecta en la Fase 6, cuando tengas tu cuenta de vendedor.
          </p>
        </section>
      </div>

      <aside className="self-start rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60 lg:sticky lg:top-36">
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
            <dt className="text-cafe">Envío estimado</dt>
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
          <Lock className="size-4 shrink-0" /> Pago seguro procesado por Mercado Pago.
        </p>
        <Link href="/carrito" className="mt-4 block text-center text-sm text-cafe hover:underline">
          ← Editar carrito
        </Link>
      </aside>
    </div>
  );
}
