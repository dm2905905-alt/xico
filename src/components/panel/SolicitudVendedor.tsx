"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { mensajeError } from "@/lib/firebase";
import { crearTienda, type DatosTienda } from "@/lib/panel";
import type { Direccion } from "@/lib/pedidos";
import { CamposCobro, CamposDireccion, aDatosCobro, problemaCobro, problemaDireccion, type ValoresCobro } from "./CamposCobro";
import { FormularioTienda } from "./FormularioTienda";

// Solicitud para vender en XICO: 1) la tienda (pública)  2) cobro y dirección (privados)
export function SolicitudVendedor({ uid }: { uid: string }) {
  const [paso, setPaso] = useState<1 | 2>(1);
  const [tienda, setTienda] = useState<DatosTienda | null>(null);
  const [cobro, setCobro] = useState<ValoresCobro>({ titular: "", clabe: "", rfc: "" });
  const [direccion, setDireccion] = useState<Partial<Direccion>>({});
  const [acepto, setAcepto] = useState(false);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!tienda) return setPaso(1);
    const problema = problemaCobro(cobro) ?? problemaDireccion(direccion);
    if (problema) return setError(problema);
    if (!acepto) return setError("Para continuar acepta los Términos y condiciones para vendedores.");
    setError("");
    setOcupado(true);
    try {
      await crearTienda(uid, tienda, { pago: aDatosCobro(cobro), direccion: direccion as Direccion });
      // La pantalla cambia sola al panel (la tienda se lee en vivo)
    } catch (err) {
      setError(mensajeError(err));
      setOcupado(false);
    }
  }

  return (
    <div className="rounded-[2rem] bg-white/90 p-6 ring-1 ring-white backdrop-blur sm:p-8">
      <h2 className="font-display text-2xl font-bold">Solicitud para vender en XICO</h2>
      <p className="mt-1 text-sm text-cafe">
        Revisamos cada solicitud para que en XICO solo vendan creadores reales. Tus primeros 3 meses son gratis; después, $400 al mes más 15% de comisión por venta.
      </p>

      {/* Avance */}
      <ol className="mt-5 mb-6 grid grid-cols-2 gap-2 text-xs font-semibold">
        {["1. Tu tienda", "2. Cobro y dirección"].map((t, i) => (
          <li key={t} className={`rounded-full px-3 py-2 text-center ${paso >= i + 1 ? "degradado-xico text-white" : "bg-arena text-cafe"}`}>
            {t}
          </li>
        ))}
      </ol>

      {paso === 1 && (
        <FormularioTienda
          borrador={tienda ?? undefined}
          textoBoton="Siguiente →"
          alGuardar={async (datos) => {
            setTienda(datos);
            setPaso(2);
          }}
        />
      )}

      {paso === 2 && (
        <form onSubmit={enviar} className="grid gap-6">
          <button type="button" onClick={() => setPaso(1)} className="flex items-center gap-1 self-start text-sm text-cafe hover:text-terracota">
            <ArrowLeft className="size-4" /> Volver a los datos de la tienda
          </button>

          <p className="flex items-start gap-2 rounded-2xl bg-arena/70 p-3 text-sm text-cafe">
            <Lock className="mt-0.5 size-4 shrink-0" />
            Estos datos son privados: no aparecen en tu tienda. Solo los usamos para pagarte tus ventas y para que la paquetería recoja tus paquetes.
          </p>

          <section className="grid gap-3">
            <h3 className="font-display text-lg font-semibold">💳 ¿Dónde te depositamos?</h3>
            <CamposCobro v={cobro} cambiar={setCobro} />
          </section>

          <section className="grid gap-3">
            <h3 className="font-display text-lg font-semibold">📍 Tu dirección</h3>
            <p className="-mt-2 text-xs text-cafe">Desde aquí la paquetería recogerá tus paquetes. Puedes cambiarla después.</p>
            <CamposDireccion d={direccion} cambiar={setDireccion} />
          </section>

          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" className="mt-1 size-4 accent-terracota" checked={acepto} onChange={(e) => setAcepto(e.target.checked)} />
            <span>
              Acepto los{" "}
              <Link href="/terminos" target="_blank" className="font-semibold text-terracota underline">
                Términos y condiciones para vendedores
              </Link>
: solo vendo lo que yo hago, cumplo los tiempos de entrega y acepto la comisión del 15% por venta y, después de 3 meses gratis, la mensualidad de $400. También acepto el{" "}
              <Link href="/privacidad" target="_blank" className="font-semibold text-terracota underline">
                Aviso de privacidad
              </Link>{" "}
              y autorizo que XICO use mis datos bancarios para pagarme mis ventas. Me comprometo a respetar las{" "}
              <Link href="/envios" target="_blank" className="font-semibold text-terracota underline">
                Reglas de envío
              </Link>{" "}
              y a empacar bien: si un pedido llega dañado por mal empaque, el reembolso se descuenta de mi pago.
            </span>
          </label>

          {error && <p role="alert" className="rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa">{error}</p>}

          <button type="submit" disabled={ocupado} className="degradado-xico flex h-12 items-center justify-center gap-2 rounded-full font-semibold text-white disabled:opacity-60 sm:w-72">
            {ocupado && <Loader2 className="size-5 animate-spin" />} Enviar solicitud
          </button>
        </form>
      )}
    </div>
  );
}
