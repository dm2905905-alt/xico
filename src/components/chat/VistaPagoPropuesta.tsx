"use client";

import Link from "next/link";
import { useState } from "react";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { crearAlmacen } from "@/lib/almacen";
import { usePropuesta } from "@/lib/chat";
import { precio } from "@/lib/formato";
import { camposDireccion, problemaDireccion, type Direccion } from "@/lib/pedidos";
import { FormularioEntrar } from "../FormularioEntrar";
import { useSesion } from "../Sesion";

// Misma dirección recordada que en el carrito
const almacenDireccion = crearAlmacen<Partial<Direccion>>("xico-direccion", {});

export function VistaPagoPropuesta({ id }: { id: string }) {
  const { usuario, cargando: cargandoSesion } = useSesion();
  const { propuesta: p, cargando } = usePropuesta(usuario ? id : undefined);
  const direccion = almacenDireccion.useValor();
  const [pagando, setPagando] = useState(false);
  const [error, setError] = useState("");

  if (cargandoSesion) return <div className="h-96 animate-pulse rounded-3xl bg-arena" />;
  if (!usuario) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60">
        <p className="mb-4 text-sm text-cafe">Entra a tu cuenta para pagar tu propuesta.</p>
        <FormularioEntrar volver={`/propuesta/${id}`} />
      </div>
    );
  }
  if (cargando) return <div className="h-96 animate-pulse rounded-3xl bg-arena" />;
  if (!p || p.compradorUid !== usuario.uid) {
    return <p className="rounded-3xl bg-white p-8 text-center ring-1 ring-arena-oscura/60">Esta propuesta no existe o no es para ti.</p>;
  }
  if (p.estado !== "pendiente") {
    return (
      <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-arena-oscura/60">
        <p className="font-display text-xl font-semibold">{p.estado === "pagada" ? "¡Esta propuesta ya está pagada! 🎉" : "Esta propuesta ya no está disponible."}</p>
        {p.pedidoId && (
          <Link href={`/pedido/${p.pedidoId}`} className="mt-3 inline-block text-terracota hover:underline">Ver el pedido</Link>
        )}
      </div>
    );
  }

  const envio = p.precio >= 999 ? 0 : 99;
  const poner = (k: keyof Direccion, v: string) => almacenDireccion.escribir((d) => ({ ...d, [k]: v }));

  async function pagar() {
    const problema = problemaDireccion(direccion);
    if (problema) return setError(problema);
    setError("");
    setPagando(true);
    try {
      const r = await fetch("/api/pagos/propuesta", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await usuario!.getIdToken()}` },
        body: JSON.stringify({ propuestaId: id, direccion }),
      });
      const datos = await r.json();
      if (!r.ok || !datos.url) throw new Error(datos.error ?? "No se pudo iniciar el pago.");
      window.location.href = datos.url;
    } catch (e) {
      setError((e as Error).message);
      setPagando(false);
    }
  }

  const campo = "h-11 w-full rounded-xl border border-arena-oscura bg-white px-3.5 text-sm outline-none focus:border-terracota";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <section className="rounded-[2rem] bg-white/90 p-6 ring-1 ring-white backdrop-blur">
        <h2 className="font-display text-xl font-bold">Dirección de envío</h2>
        <p className="mt-1 text-sm text-cafe">Solo se comparte con {p.taller} cuando se confirma tu pago.</p>
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
              />
            </label>
          ))}
        </div>
      </section>

      <aside className="self-start rounded-[2rem] bg-white/90 p-6 ring-1 ring-white backdrop-blur lg:sticky lg:top-36">
        <p className="text-xs font-bold tracking-wider text-terracota uppercase">Propuesta de {p.taller}</p>
        {p.foto && (
          // eslint-disable-next-line @next/next/no-img-element -- imagen del diseño, ya reducida
          <img src={p.foto.mini} alt="Diseño" className="mt-3 aspect-square w-full rounded-2xl object-cover" />
        )}
        <p className="mt-3 font-display text-xl leading-tight font-bold">{p.titulo}</p>
        <dl className="mt-2 grid gap-1 text-sm">
          {p.detalles.map((d, i) => (
            <div key={i} className="flex gap-1.5">
              <dt className="text-cafe">{d.etiqueta}:</dt>
              <dd className="font-medium">{d.valor}</dd>
            </div>
          ))}
          <div className="flex gap-1.5">
            <dt className="text-cafe">Elaboración:</dt>
            <dd className="font-medium">{p.diasElaboracion}</dd>
          </div>
        </dl>
        <dl className="mt-4 grid gap-1 border-t border-arena-oscura pt-3 text-sm">
          <div className="flex justify-between"><dt className="text-cafe">Precio</dt><dd>{precio(p.precio)}</dd></div>
          <div className="flex justify-between"><dt className="text-cafe">Envío</dt><dd>{envio ? precio(envio) : "Gratis"}</dd></div>
          <div className="mt-1 flex justify-between text-lg font-bold"><dt>Total</dt><dd>{precio(p.precio + envio)}</dd></div>
        </dl>
        {error && <p role="alert" className="mt-3 rounded-xl bg-rosa/10 px-3 py-2 text-sm text-rosa">{error}</p>}
        <button onClick={pagar} disabled={pagando} className="mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-full bg-[#009ee3] py-3 font-semibold text-white hover:bg-[#0089c7] disabled:opacity-60">
          {pagando ? <Loader2 className="size-5 animate-spin" /> : <Lock className="size-5" />} {pagando ? "Preparando tu pago…" : `Pagar ${precio(p.precio + envio)}`}
        </button>
        <p className="mt-3 flex items-start gap-2 text-xs text-cafe">
          <ShieldCheck className="size-4 shrink-0 text-jade" /> Compra protegida por XICO: si no llega o no es lo acordado, te devolvemos tu dinero.
        </p>
        <Link href={`/mensajes/${p.conversacion}`} className="mt-3 block text-center text-sm text-cafe hover:underline">← Volver al chat</Link>
      </aside>
    </div>
  );
}
