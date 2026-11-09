"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { mensajeError } from "@/lib/firebase";
import { guardarDireccionRecoleccion, useDireccionRecoleccion } from "@/lib/panel";
import { camposDireccion, problemaDireccion, type Direccion } from "@/lib/pedidos";

// Dirección desde donde la paquetería recogerá los paquetes de la tienda
export function FormularioRecoleccion({ slug }: { slug: string }) {
  const { direccion: guardada, cargando } = useDireccionRecoleccion(slug);
  if (cargando) return <div className="h-40 animate-pulse rounded-2xl bg-arena" />;
  return <Formulario slug={slug} inicial={guardada} />;
}

function Formulario({ slug, inicial }: { slug: string; inicial: Partial<Direccion> }) {
  const [d, setD] = useState<Partial<Direccion>>(inicial);
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const problema = problemaDireccion(d);
    if (problema) return setMensaje({ ok: false, texto: problema });
    setOcupado(true);
    setMensaje(null);
    try {
      await guardarDireccionRecoleccion(slug, d as Direccion);
      setMensaje({ ok: true, texto: "✓ Dirección de recolección guardada." });
    } catch (err) {
      setMensaje({ ok: false, texto: mensajeError(err) });
    } finally {
      setOcupado(false);
    }
  }

  const campo = "h-11 w-full rounded-xl border border-arena-oscura bg-white px-3.5 text-sm outline-none focus:border-terracota focus:ring-2 focus:ring-terracota/15";

  return (
    <form onSubmit={guardar} className="grid gap-4">
      <p className="flex items-start gap-2 rounded-xl bg-arena/60 p-3 text-sm text-cafe">
        <Lock className="mt-0.5 size-4 shrink-0" />
        Es privada: no aparece en tu tienda. Solo la usa XICO para que la paquetería recoja tus paquetes.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {camposDireccion.map((c) => (
          <label key={c.clave} className={`grid gap-1 text-sm font-medium ${c.ancho ? "sm:col-span-2" : ""}`}>
            {c.clave === "nombre" ? "Nombre de quien entrega los paquetes" : c.etiqueta}
            <input
              className={campo}
              type={c.tipo ?? "text"}
              inputMode={c.clave === "cp" || c.clave === "telefono" ? "numeric" : undefined}
              maxLength={c.max}
              value={d[c.clave] ?? ""}
              onChange={(e) => {
                setD((x) => ({ ...x, [c.clave]: e.target.value }));
                setMensaje(null);
              }}
            />
          </label>
        ))}
      </div>
      {mensaje && (
        <p role={mensaje.ok ? "status" : "alert"} className={`rounded-xl px-4 py-3 text-sm ${mensaje.ok ? "bg-jade/10 text-jade" : "bg-rosa/10 text-rosa"}`}>
          {mensaje.texto}
        </p>
      )}
      <button type="submit" disabled={ocupado} className="flex h-12 items-center justify-center gap-2 rounded-full bg-terracota font-semibold text-crema hover:bg-terracota-oscura disabled:opacity-60 sm:w-72">
        {ocupado && <Loader2 className="size-5 animate-spin" />} Guardar dirección de recolección
      </button>
    </form>
  );
}
