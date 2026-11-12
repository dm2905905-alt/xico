"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { Check, Copy, Download, Loader2 } from "lucide-react";
import { clabeLegible } from "@/lib/clabe";
import { bonos, momentoActual, type BonoPendiente } from "@/lib/eventos";
import { mensajeError, obtenerDb } from "@/lib/firebase";
import { precio } from "@/lib/formato";
import type { DatosCobro } from "@/lib/panel";
import { useSesion } from "../Sesion";
import { cobrados, llamar, type DatosAdmin } from "./datos";

type Parte = { pedido: string; monto: number; fecha: number };
type Fila = {
  slug: string;
  taller: string;
  listos: Parte[]; // entregados: ya se le pueden pagar
  porLiberar: Parte[]; // cobrados pero aún no entregados
  pagado: number;
  debe: number;
  pago?: DatosCobro & { actualizado?: number };
  cambioReciente: boolean;
};

const SEMANA = 7 * 24 * 60 * 60 * 1000;
const suma = (xs: Parte[]) => xs.reduce((s, x) => s + x.monto, 0);

// Corte semanal: cuánto le toca a cada creador por pedidos ENTREGADOS, a qué CLABE, y archivo para el banco
export function TabPagos({ datos }: { datos: DatosAdmin }) {
  const { usuario } = useSesion();
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState("");
  const [verPagados, setVerPagados] = useState(false);

  const mapa = new Map<string, { taller: string; listos: Parte[]; porLiberar: Parte[]; pagado: number }>();
  for (const p of cobrados(datos.pedidos)) {
    for (const g of p.grupos) {
      const c = mapa.get(g.creador) ?? { taller: g.taller, listos: [], porLiberar: [], pagado: 0 };
      const parte = { pedido: p.id, monto: g.paraCreador, fecha: p.pagado ?? p.creado };
      if (g.liquidado) c.pagado += g.paraCreador;
      else if (g.envioEstado === "entregado" || p.estado === "entregado") c.listos.push(parte);
      else c.porLiberar.push(parte);
      mapa.set(g.creador, c);
    }
  }
  const [ahora] = useState(() => Date.now());
  const filas: Fila[] = [...mapa.entries()]
    .map(([slug, c]) => {
      const pago = datos.privados[slug]?.pago;
      const creador = datos.creadores.find((x) => x.slug === slug);
      // CLABE cambiada en los últimos 7 días (y no es la del registro): revisar antes de transferir
      const cambioReciente = !!pago?.actualizado && ahora - pago.actualizado < SEMANA && pago.actualizado - (creador?.solicitada ?? 0) > 60_000;
      return { slug, ...c, debe: suma(c.listos), pago, cambioReciente };
    })
    .filter((f) => verPagados || f.debe > 0 || f.porLiberar.length > 0)
    .sort((a, b) => b.debe - a.debe || suma(b.porLiberar) - suma(a.porLiberar));

  const aPagar = filas.filter((f) => f.debe > 0 && f.pago);
  const totalSemana = aPagar.reduce((s, f) => s + f.debe, 0);
  const sinCuenta = filas.filter((f) => f.debe > 0 && !f.pago);

  async function liquidar(f: Fila, preguntar = true) {
    if (!usuario) return false;
    if (preguntar && !window.confirm(`¿Ya le transferiste ${precio(f.debe)} a ${f.taller}? Se marcarán ${f.listos.length} pedido(s) como pagados.`)) return false;
    setOcupado(f.slug);
    setError("");
    try {
      await llamar(usuario, "/api/admin/liquidar", { creador: f.slug, pedidos: f.listos.map((x) => x.pedido) });
      return true;
    } catch (e) {
      setError(`${f.taller}: ${(e as Error).message}`);
      return false;
    } finally {
      setOcupado(null);
    }
  }

  async function liquidarTodos() {
    if (!aPagar.length) return;
    if (!window.confirm(`¿Ya hiciste las ${aPagar.length} transferencias por un total de ${precio(totalSemana)}? Se marcarán todas como pagadas.`)) return;
    for (const f of aPagar) if (!(await liquidar(f, false))) break;
  }

  async function copiar(texto: string, id: string) {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(id);
      setTimeout(() => setCopiado(""), 1500);
    } catch {
      window.prompt("Copia la CLABE:", texto);
    }
  }

  // Archivo CSV (se abre en Excel) con lo necesario para hacer las transferencias desde el banco
  function descargarCsv() {
    const hoy = new Date();
    const concepto = `XICO ventas ${hoy.toLocaleDateString("es-MX", { day: "2-digit", month: "2-digit" })}`;
    const celda = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
    const lineas = [
      ["Titular", "Banco", "CLABE", "Monto", "Concepto", "RFC", "Tienda", "Pedidos"].map(celda).join(","),
      ...aPagar.map((f) =>
        [f.pago!.titular, f.pago!.banco, `'${f.pago!.clabe}`, f.debe.toFixed(2), concepto, f.pago!.rfc ?? "", f.taller, f.listos.length].map(celda).join(","),
      ),
    ];
    const blob = new Blob(["﻿" + lineas.join("\r\n")], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `xico-pagos-${hoy.toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl bg-maiz/15 p-4 text-sm">
        <p className="font-semibold">Cómo hacer el corte semanal</p>
        <ol className="mt-1 list-decimal pl-5 text-cafe">
          <li>Solo se paga lo de pedidos <strong>entregados</strong> (lo demás aparece como &quot;por liberar&quot;).</li>
          <li>Descarga el archivo o copia cada CLABE y haz las transferencias desde tu banco.</li>
          <li>Al terminar, presiona &quot;Ya les pagué a todos&quot;.</li>
        </ol>
      </div>

      {/* Resumen de la semana */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 ring-1 ring-arena-oscura/60">
        <div className="min-w-0 flex-1">
          <p className="text-sm text-cafe">A pagar esta semana</p>
          <p className="text-2xl font-bold">{precio(totalSemana)}</p>
          <p className="text-xs text-cafe">{aPagar.length} creador(es)</p>
        </div>
        <button
          onClick={descargarCsv}
          disabled={!aPagar.length}
          className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-arena-oscura hover:bg-arena disabled:opacity-50"
        >
          <Download className="size-4" /> Descargar para el banco
        </button>
        <button
          onClick={liquidarTodos}
          disabled={!aPagar.length || !!ocupado}
          className="flex items-center gap-1.5 rounded-full bg-jade px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          {ocupado ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Ya les pagué a todos
        </button>
      </div>

      <BonosPorPagar datos={datos} copiar={copiar} copiado={copiado} />

      {sinCuenta.length > 0 && (
        <p className="rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa">
          ⚠️ {sinCuenta.map((f) => f.taller).join(", ")} no tiene(n) cuenta de pago registrada. Aparecerá en su panel un aviso para agregarla.
        </p>
      )}

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" className="accent-terracota" checked={verPagados} onChange={(e) => setVerPagados(e.target.checked)} /> Mostrar también creadores ya pagados
      </label>
      {error && <p role="alert" className="rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa">{error}</p>}

      <ul className="grid gap-3">
        {filas.map((f) => (
          <li key={f.slug} className="rounded-2xl bg-white p-4 ring-1 ring-arena-oscura/60">
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{f.taller}</p>
                {f.pago ? (
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-cafe">
                    {f.pago.titular} · {f.pago.banco} ·<span className="font-mono text-tinta">{clabeLegible(f.pago.clabe)}</span>
                    <button onClick={() => copiar(f.pago!.clabe, f.slug)} className="flex items-center gap-1 rounded-full bg-arena px-2 py-0.5 text-terracota">
                      {copiado === f.slug ? <Check className="size-3" /> : <Copy className="size-3" />} {copiado === f.slug ? "Copiada" : "Copiar"}
                    </button>
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-rosa">Sin cuenta de pago</p>
                )}
                {f.cambioReciente && (
                  <p className="mt-1 rounded-lg bg-maiz/25 px-2 py-1 text-xs">
                    ⚠️ Cambió su CLABE hace poco. Por seguridad, confírmalo con el creador antes de transferir.
                  </p>
                )}
                <p className="mt-1 text-xs text-cafe">
                  Por liberar (aún no entregado): {precio(suma(f.porLiberar))} · ya pagado: {precio(f.pagado)}
                </p>
              </div>
              <p className="text-xl font-bold">{precio(f.debe)}</p>
              {f.debe > 0 && (
                <button
                  onClick={() => liquidar(f)}
                  disabled={!!ocupado}
                  className="flex items-center gap-1.5 rounded-full bg-jade px-4 py-2 text-sm font-semibold text-white hover:bg-jade/90 disabled:opacity-60"
                >
                  {ocupado === f.slug ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Ya le pagué
                </button>
              )}
            </div>
            {f.listos.length > 0 && (
              <ul className="mt-2 flex flex-wrap gap-1.5 text-[11px] text-cafe">
                {f.listos.map((x) => (
                  <li key={x.pedido} className="rounded-full bg-jade/10 px-2 py-0.5">
                    ✓ #{x.pedido.slice(0, 8).toUpperCase()} · {precio(x.monto)}
                  </li>
                ))}
                {f.porLiberar.map((x) => (
                  <li key={x.pedido} className="rounded-full bg-arena px-2 py-0.5">
                    🚚 #{x.pedido.slice(0, 8).toUpperCase()} · {precio(x.monto)}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
        {!filas.length && <li className="text-sm text-cafe">No le debes nada a ningún creador. 🎉</li>}
      </ul>
    </div>
  );
}

// Premios en dinero de los eventos (se pagan aparte de las ventas)
function BonosPorPagar({ datos, copiar, copiado }: { datos: DatosAdmin; copiar: (t: string, id: string) => void; copiado: string }) {
  const [error, setError] = useState("");
  const pendientes = bonos(datos.eventos).filter((b) => !b.pagado);
  if (!pendientes.length) return null;
  const total = pendientes.reduce((s, b) => s + b.monto, 0);

  async function pagado(b: BonoPendiente) {
    const db = obtenerDb();
    const evento = datos.eventos.find((e) => e.id === b.evento);
    if (!db || !evento || !window.confirm(`¿Ya le transferiste ${precio(b.monto)} a ${b.taller} por el premio "${b.titulo}"?`)) return;
    setError("");
    try {
      const momento = momentoActual();
      await updateDoc(doc(db, "eventos", evento.id), {
        ganadores: (evento.ganadores ?? []).map((g) => (g.creador === b.creador ? { ...g, pagado: momento } : g)),
      });
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-terracota/40">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-semibold">🏆 Premios de eventos por pagar</p>
        <p className="text-xl font-bold">{precio(total)}</p>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-rosa">{error}</p>}
      <ul className="mt-2 grid gap-2">
        {pendientes.map((b) => {
          const pago = datos.privados[b.creador]?.pago;
          const id = `bono-${b.evento}-${b.creador}`;
          return (
            <li key={id} className="flex flex-wrap items-center gap-3 rounded-xl bg-arena/50 p-3 text-sm">
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{b.taller}</p>
                <p className="text-xs text-cafe">{b.titulo}</p>
                {pago ? (
                  <p className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-cafe">
                    {pago.titular} · {pago.banco} ·<span className="font-mono text-tinta">{clabeLegible(pago.clabe)}</span>
                    <button onClick={() => copiar(pago.clabe, id)} className="flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-terracota">
                      {copiado === id ? <Check className="size-3" /> : <Copy className="size-3" />} {copiado === id ? "Copiada" : "Copiar"}
                    </button>
                  </p>
                ) : (
                  <p className="mt-0.5 text-xs text-rosa">Sin cuenta de pago</p>
                )}
              </div>
              <p className="font-bold">{precio(b.monto)}</p>
              <button onClick={() => pagado(b)} className="flex items-center gap-1.5 rounded-full bg-jade px-4 py-2 text-sm font-semibold text-white">
                <Check className="size-4" /> Ya le pagué
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
