"use client";

import Link from "next/link";
import { useState } from "react";
import { CreditCard, Loader2, Lock, MapPin } from "lucide-react";
import { clabeOculta } from "@/lib/clabe";
import type { Creador } from "@/lib/datos";
import { mensajeError } from "@/lib/firebase";
import { guardarCobro, useDatosPrivados, type DatosPrivados } from "@/lib/panel";
import { CamposCobro, aDatosCobro, problemaCobro, type ValoresCobro } from "./CamposCobro";
import { ConTienda } from "./ConTienda";
import { FormularioRecoleccion } from "./FormularioRecoleccion";

export function VistaCuenta() {
  return <ConTienda volver="/panel/cuenta">{(creador) => <Cuenta creador={creador} />}</ConTienda>;
}

const fecha = (ms?: number) =>
  ms ? new Date(ms).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" }) : "";

function Cuenta({ creador }: { creador: Creador }) {
  const { datos, cargando } = useDatosPrivados(creador.slug);

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60 sm:p-8">
        <Link href="/panel" className="text-sm text-cafe hover:underline">← Volver a mi tienda</Link>
        <h2 className="mt-3 font-display text-2xl font-semibold">Mi cuenta de vendedor</h2>
        <p className="mt-1 flex items-start gap-2 text-sm text-cafe">
          <Lock className="mt-0.5 size-4 shrink-0" />
          Estos datos son privados. Solo tú y el equipo de XICO pueden verlos.
        </p>

        <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-2xl bg-arena/60 p-4">
            <dt className="text-cafe">Estado de la tienda</dt>
            <dd className="mt-1 font-semibold">
              {creador.estadoTienda === "revision"
                ? "⏳ En revisión"
                : creador.estadoTienda === "suspendida"
                  ? "🚫 Suspendida"
                  : "✅ Aprobada"}
            </dd>
          </div>
          <div className="rounded-2xl bg-arena/60 p-4">
            <dt className="text-cafe">Costo</dt>
            <dd className="mt-1 font-semibold">
              <Link href="/panel/suscripcion" className="hover:underline">$400/mes + 15% por venta</Link>
            </dd>
          </div>
          <div className="rounded-2xl bg-arena/60 p-4">
            <dt className="text-cafe">Pagos</dt>
            <dd className="mt-1 font-semibold">Cada semana, por pedidos entregados</dd>
          </div>
        </dl>
      </div>

      <section className="rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60 sm:p-8">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
          <CreditCard className="size-5 text-terracota" /> Cuenta donde recibes tus pagos
        </h2>
        {cargando ? <div className="h-32 animate-pulse rounded-2xl bg-arena" /> : <Cobro slug={creador.slug} datos={datos} />}
      </section>

      <section id="recoleccion" className="scroll-mt-40 rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60 sm:p-8">
        <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-semibold">
          <MapPin className="size-5 text-terracota" /> Dirección de recolección
        </h2>
        <FormularioRecoleccion slug={creador.slug} />
      </section>
    </div>
  );
}

function Cobro({ slug, datos }: { slug: string; datos: DatosPrivados }) {
  const pago = datos.pago;
  const [editando, setEditando] = useState(!pago);
  const [v, setV] = useState<ValoresCobro>({ titular: pago?.titular ?? "", clabe: "", rfc: pago?.rfc ?? "" });
  const [confirmo, setConfirmo] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const problema = problemaCobro(v);
    if (problema) return setMensaje({ ok: false, texto: problema });
    if (!confirmo) return setMensaje({ ok: false, texto: "Confirma que la cuenta está a tu nombre o al de tu negocio." });
    setOcupado(true);
    setMensaje(null);
    try {
      await guardarCobro(slug, aDatosCobro(v));
      setEditando(false);
      setConfirmo(false);
      setMensaje({ ok: true, texto: "✓ Cuenta actualizada. Tus próximos pagos llegarán a esta cuenta." });
    } catch (err) {
      setMensaje({ ok: false, texto: mensajeError(err) });
    } finally {
      setOcupado(false);
    }
  }

  const aviso = mensaje && (
    <p role={mensaje.ok ? "status" : "alert"} className={`rounded-xl px-4 py-3 text-sm ${mensaje.ok ? "bg-jade/10 text-jade" : "bg-rosa/10 text-rosa"}`}>
      {mensaje.texto}
    </p>
  );

  if (!editando && pago) {
    return (
      <div className="grid gap-4">
        <div className="rounded-2xl border border-arena-oscura p-4">
          <p className="font-semibold">{pago.banco}</p>
          <p className="mt-1 font-mono tracking-wider">{clabeOculta(pago.clabe)}</p>
          <p className="mt-1 text-sm text-cafe">
            A nombre de {pago.titular}
            {pago.rfc ? ` · RFC ${pago.rfc}` : ""}
          </p>
          {pago.actualizado && <p className="mt-2 text-xs text-cafe">Última actualización: {fecha(pago.actualizado)}</p>}
        </div>
        {aviso}
        <button
          onClick={() => {
            setEditando(true);
            setMensaje(null);
          }}
          className="h-11 rounded-full border border-arena-oscura px-5 text-sm font-semibold hover:bg-arena sm:w-60"
        >
          Cambiar cuenta de pago
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={guardar} className="grid gap-4">
      {!pago && (
        <p className="rounded-xl bg-maiz/20 px-4 py-3 text-sm">
          ⚠️ Aún no registras dónde te depositamos. Sin esta cuenta no podemos pagarte tus ventas.
        </p>
      )}
      {pago && (
        <p className="rounded-xl bg-arena/70 px-4 py-3 text-sm text-cafe">
          Escribe la CLABE nueva completa. Por seguridad, el equipo de XICO verá que la cambiaste antes de enviarte el siguiente pago.
        </p>
      )}
      <CamposCobro v={v} cambiar={(x) => { setV(x); setMensaje(null); }} />
      <label className="flex items-start gap-3 text-sm">
        <input type="checkbox" className="mt-1 size-4 accent-terracota" checked={confirmo} onChange={(e) => setConfirmo(e.target.checked)} />
        Confirmo que esta cuenta está a mi nombre o al de mi negocio, y que los datos son correctos.
      </label>
      {aviso}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={ocupado} className="degradado-xico flex h-11 items-center justify-center gap-2 rounded-full px-6 font-semibold text-white disabled:opacity-60">
          {ocupado && <Loader2 className="size-4 animate-spin" />} Guardar cuenta
        </button>
        {pago && (
          <button type="button" onClick={() => { setEditando(false); setMensaje(null); }} className="h-11 rounded-full px-5 text-sm text-cafe hover:bg-arena">
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}
