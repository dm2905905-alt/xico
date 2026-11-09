"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { precio } from "@/lib/formato";
import { useSesion } from "../Sesion";
import { cobrados, llamar, type DatosAdmin } from "./datos";

// Cuánto le debe XICO a cada creador (mientras no haya reparto automático de Mercado Pago)
export function TabPagos({ datos }: { datos: DatosAdmin }) {
  const { usuario } = useSesion();
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [verPagados, setVerPagados] = useState(false);

  // Por creador: partes cobradas y aún no transferidas
  const porCreador = new Map<string, { taller: string; pendientes: { pedido: string; monto: number; fecha: number }[]; pagado: number }>();
  for (const p of cobrados(datos.pedidos)) {
    for (const g of p.grupos) {
      const c = porCreador.get(g.creador) ?? { taller: g.taller, pendientes: [], pagado: 0 };
      if (g.liquidado) c.pagado += g.paraCreador;
      else c.pendientes.push({ pedido: p.id, monto: g.paraCreador, fecha: p.pagado ?? p.creado });
      porCreador.set(g.creador, c);
    }
  }
  const filas = [...porCreador.entries()]
    .map(([slug, c]) => ({ slug, ...c, debe: c.pendientes.reduce((s, x) => s + x.monto, 0) }))
    .filter((f) => verPagados || f.debe > 0)
    .sort((a, b) => b.debe - a.debe);

  async function liquidar(slug: string, pedidos: string[], taller: string, monto: number) {
    if (!usuario) return;
    if (!window.confirm(`¿Ya le transferiste ${precio(monto)} a ${taller}? Se marcarán ${pedidos.length} pedido(s) como pagados al creador.`)) return;
    setOcupado(slug);
    setError("");
    try {
      await llamar(usuario, "/api/admin/liquidar", { creador: slug, pedidos });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(null);
    }
  }

  const tiendaReal = (slug: string) => !!datos.creadores.find((c) => c.slug === slug)?.uid;

  return (
    <div className="grid gap-4">
      <p className="rounded-2xl bg-maiz/15 p-4 text-sm">
        Mientras no esté activo el reparto automático de Mercado Pago, todo el dinero llega a la cuenta de XICO. Aquí ves
        <strong> cuánto le corresponde a cada creador</strong> (sus productos − 15% + envío). Haz la transferencia desde tu banco y
        luego márcala aquí.
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="accent-terracota" checked={verPagados} onChange={(e) => setVerPagados(e.target.checked)} /> Mostrar también creadores ya pagados
      </label>
      {error && <p role="alert" className="rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa">{error}</p>}

      <ul className="grid gap-3">
        {filas.map((f) => (
          <li key={f.slug} className="rounded-2xl bg-white p-4 ring-1 ring-arena-oscura/60">
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {f.taller}
                  {!tiendaReal(f.slug) && <span className="ml-2 rounded-full bg-arena px-2 py-0.5 text-[11px] font-normal text-cafe">ejemplo, sin dueño</span>}
                </p>
                <p className="text-xs text-cafe">
                  {f.pendientes.length} pedido(s) por pagar · ya pagado: {precio(f.pagado)}
                </p>
              </div>
              <p className="text-xl font-bold">{precio(f.debe)}</p>
              {f.debe > 0 && (
                <button
                  onClick={() => liquidar(f.slug, f.pendientes.map((x) => x.pedido), f.taller, f.debe)}
                  disabled={ocupado === f.slug}
                  className="flex items-center gap-1.5 rounded-full bg-jade px-4 py-2 text-sm font-semibold text-white hover:bg-jade/90 disabled:opacity-60"
                >
                  {ocupado === f.slug ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Ya le pagué
                </button>
              )}
            </div>
            {f.pendientes.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-cafe">
                {f.pendientes.map((x) => (
                  <li key={x.pedido} className="rounded-full bg-arena px-2 py-0.5">
                    #{x.pedido.slice(0, 8).toUpperCase()} · {precio(x.monto)} · {new Date(x.fecha).toLocaleDateString("es-MX")}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
        {!filas.length && <li className="text-sm text-cafe">No le debes nada a ningún creador. 🎉</li>}
      </ul>
      <p className="text-xs text-cafe">
        Pendiente para el lanzamiento: pedir a cada creador su CLABE para transferirle, o activar el reparto automático de Mercado Pago.
      </p>
    </div>
  );
}
