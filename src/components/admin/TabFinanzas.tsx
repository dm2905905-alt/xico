"use client";

import { useState } from "react";
import { ChevronDown, Download, Printer } from "lucide-react";
import { precio } from "@/lib/formato";
import { periodos, reporteCsv, resumir, type Periodo, type Resumen, type TipoPeriodo } from "@/lib/finanzas";
import { estadoSuscripcion } from "@/lib/suscripcion";
import type { DatosAdmin } from "./datos";

const rangos: { id: string; texto: string }[] = [
  { id: "hoy", texto: "Hoy" },
  { id: "semana", texto: "Esta semana" },
  { id: "mes", texto: "Este mes" },
  { id: "todo", texto: "Todo" },
];

// Finanzas de XICO: totales, ganancia, lo que se debe a cada tienda y reportes por día, semana y mes
export function TabFinanzas({ datos }: { datos: DatosAdmin }) {
  const [ahora] = useState(() => Date.now());
  const [rango, setRango] = useState("mes");
  const [tipo, setTipo] = useState<TipoPeriodo>("semana");

  const actual: Record<string, Periodo | null> = {
    hoy: periodos("dia", ahora, 1)[0],
    semana: periodos("semana", ahora, 1)[0],
    mes: periodos("mes", ahora, 1)[0],
    todo: null,
  };
  const p = actual[rango];
  const r = resumir(datos.pedidos, datos.pagosSuscripcion, p?.desde ?? 0, p?.hasta ?? Infinity);
  const deuda = resumir(datos.pedidos, datos.pagosSuscripcion); // todo lo pendiente, sin importar la fecha

  return (
    <div className="grid gap-6">
      {/* Lo que se debe hoy */}
      <section className="grid gap-3 sm:grid-cols-3">
        <Cifra titulo="Debes pagar a tiendas" valor={deuda.pendienteTiendas} nota="Todo lo pendiente (ver Pagos a creadores)" fuerte />
        <Cifra titulo="Ganancia total de XICO" valor={deuda.gananciaXico} nota={`${precio(deuda.comisiones)} comisiones + ${precio(deuda.suscripciones)} mensualidades`} />
        <Cifra titulo="Total cobrado desde el inicio" valor={deuda.totalCobrado} nota={`${deuda.pedidos} pedidos pagados`} />
      </section>

      {/* Periodo */}
      <section className="grid gap-4">
        <div className="flex flex-wrap gap-2">
          {rangos.map((x) => (
            <button key={x.id} onClick={() => setRango(x.id)} className={`rounded-full px-4 py-1.5 text-sm ${rango === x.id ? "bg-tinta text-crema" : "bg-white ring-1 ring-arena-oscura"}`}>
              {x.texto}
            </button>
          ))}
        </div>
        <Detalle r={r} titulo={p?.nombre ?? "Desde el inicio"} />
      </section>

      {/* Reportes */}
      <section className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-xl font-bold">Reportes</h2>
          <div className="flex gap-1 rounded-full bg-white p-1 text-sm ring-1 ring-arena-oscura">
            {(
              [
                ["dia", "Diarios"],
                ["semana", "Semanales"],
                ["mes", "Mensuales"],
              ] as const
            ).map(([id, t]) => (
              <button key={id} onClick={() => setTipo(id)} className={`rounded-full px-3 py-1 ${tipo === id ? "bg-terracota font-semibold text-white" : ""}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <p className="text-xs text-cafe">
          Se genera uno nuevo cada día, cada semana (de lunes a domingo) y cada mes. El de hasta arriba es el que va en curso.
        </p>
        <ul className="grid gap-2">
          {periodos(tipo, ahora, tipo === "dia" ? 31 : 12).map((per) => (
            <Reporte key={per.desde} periodo={per} r={resumir(datos.pedidos, datos.pagosSuscripcion, per.desde, per.hasta)} />
          ))}
        </ul>
      </section>

      {/* Estado de mensualidades */}
      <section className="grid gap-2">
        <h2 className="font-display text-xl font-bold">Mensualidades de las tiendas</h2>
        <ul className="grid gap-2 text-sm">
          {datos.creadores
            .filter((c) => c.uid && c.estadoTienda !== "revision")
            .map((c) => {
              const e = estadoSuscripcion(c, ahora);
              const fecha = (ms: number) => new Date(ms).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
              const texto =
                e.fase === "exenta"
                  ? "Sin mensualidad"
                  : e.fase === "prueba"
                  ? `Gratis hasta ${fecha(e.finGratis)}`
                  : e.fase === "activa"
                    ? `Pagada hasta ${fecha(e.vence)}`
                    : e.fase === "vencida"
                      ? `Vencida · se pausa el ${fecha(e.pausaEn)}`
                      : e.fase === "pausada"
                        ? "Pausada por falta de pago"
                        : "Sin fecha";
              const color = e.fase === "pausada" ? "text-rosa" : e.fase === "vencida" ? "text-terracota" : "text-jade";
              return (
                <li key={c.slug} className="flex justify-between gap-3 rounded-2xl bg-white px-4 py-2.5 ring-1 ring-arena-oscura/60">
                  <span className="font-medium">{c.taller}</span>
                  <span className={`font-semibold ${color}`}>{texto}</span>
                </li>
              );
            })}
        </ul>
      </section>
    </div>
  );
}

function Cifra({ titulo, valor, nota, fuerte }: { titulo: string; valor: number; nota: string; fuerte?: boolean }) {
  return (
    <div className={`rounded-3xl p-5 ring-1 ${fuerte ? "bg-maiz/20 ring-maiz/60" : "bg-white ring-arena-oscura/60"}`}>
      <p className="text-sm text-cafe">{titulo}</p>
      <p className="mt-1 text-2xl font-bold">{precio(valor)}</p>
      <p className="text-xs text-cafe">{nota}</p>
    </div>
  );
}

function Detalle({ r, titulo }: { r: Resumen; titulo: string }) {
  const filas: [string, number, string?][] = [
    ["Total cobrado", r.totalCobrado, "Ventas + envíos + mensualidades"],
    ["Ventas de productos", r.ventas],
    ["Envíos cobrados", r.envios],
    ["Comisiones de XICO (15%)", r.comisiones],
    ["Mensualidades", r.suscripciones],
    ["Ganancia de XICO", r.gananciaXico, "Comisiones + mensualidades"],
    ["Para las tiendas", r.paraTiendas, "Ventas − comisión + envío"],
    ["Ya pagado a tiendas", r.pagadoTiendas],
    ["Pendiente de pagar", r.pendienteTiendas],
  ];
  return (
    <div className="grid gap-4 rounded-3xl bg-white p-5 ring-1 ring-arena-oscura/60">
      <p className="font-display text-lg font-semibold capitalize">{titulo}</p>
      <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
        {filas.map(([t, v, nota]) => (
          <div key={t} className={`flex justify-between gap-3 ${t === "Ganancia de XICO" ? "font-bold text-jade" : ""}`}>
            <dt className={t === "Ganancia de XICO" ? "" : "text-cafe"}>
              {t}
              {nota && <span className="block text-[11px] font-normal text-cafe/80">{nota}</span>}
            </dt>
            <dd className="font-semibold">{precio(v)}</dd>
          </div>
        ))}
      </dl>
      <TablaTiendas r={r} />
      <p className="text-[11px] text-cafe">
        Las cifras no descuentan la comisión que cobra Mercado Pago por cada pago; esa la ves en tu cuenta de Mercado Pago.
      </p>
    </div>
  );
}

function TablaTiendas({ r }: { r: Resumen }) {
  if (!r.porTienda.length) return <p className="text-sm text-cafe">Sin movimientos en este periodo.</p>;
  return (
    <div className="-mx-5 overflow-x-auto px-5">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="text-xs text-cafe">
          <tr>
            <th className="py-1.5 font-semibold">Tienda</th>
            <th className="py-1.5 text-right font-semibold">Pedidos</th>
            <th className="py-1.5 text-right font-semibold">Ventas</th>
            <th className="py-1.5 text-right font-semibold">Comisión</th>
            <th className="py-1.5 text-right font-semibold">Envío</th>
            <th className="py-1.5 text-right font-semibold">Le toca</th>
            <th className="py-1.5 text-right font-semibold">Pendiente</th>
            <th className="py-1.5 text-right font-semibold">Mensualidad</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-arena-oscura/50">
          {r.porTienda.map((f) => (
            <tr key={f.creador}>
              <td className="py-2 font-medium">{f.taller}</td>
              <td className="py-2 text-right">{f.pedidos}</td>
              <td className="py-2 text-right">{precio(f.ventas)}</td>
              <td className="py-2 text-right">{precio(f.comision)}</td>
              <td className="py-2 text-right">{precio(f.envio)}</td>
              <td className="py-2 text-right font-semibold">{precio(f.paraTienda)}</td>
              <td className={`py-2 text-right font-semibold ${f.pendiente > 0 ? "text-terracota" : ""}`}>{precio(f.pendiente)}</td>
              <td className="py-2 text-right">{precio(f.suscripciones)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Reporte({ periodo, r }: { periodo: Periodo; r: Resumen }) {
  const [abierto, setAbierto] = useState(false);
  const archivo = `xico-reporte-${periodo.tipo}-${new Date(periodo.desde).toISOString().slice(0, 10)}`;

  function descargar() {
    const blob = new Blob(["﻿" + reporteCsv(periodo.nombre, r)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${archivo}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // Versión para imprimir o guardar como PDF
  function imprimir() {
    const v = window.open("", "_blank");
    if (!v) return;
    const fila = (t: string, n: number) => `<tr><td>${t}</td><td style="text-align:right">${precio(n)}</td></tr>`;
    v.document.write(`<!doctype html><meta charset="utf-8"><title>${archivo}</title>
      <style>body{font-family:system-ui,sans-serif;padding:24px;color:#1d0b36}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border-bottom:1px solid #ddd;padding:6px;font-size:13px;text-align:left}h1{font-size:20px}</style>
      <h1>Reporte XICO · ${periodo.nombre}</h1>
      <table>${fila("Total cobrado", r.totalCobrado)}${fila("Ventas de productos", r.ventas)}${fila("Envíos", r.envios)}${fila("Comisiones XICO", r.comisiones)}${fila("Mensualidades", r.suscripciones)}${fila("Ganancia XICO", r.gananciaXico)}${fila("Para las tiendas", r.paraTiendas)}${fila("Pendiente de pagar", r.pendienteTiendas)}</table>
      <table><tr><th>Tienda</th><th>Pedidos</th><th>Ventas</th><th>Comisión</th><th>Envío</th><th>Le toca</th><th>Pendiente</th><th>Mensualidad</th></tr>
      ${r.porTienda.map((f) => `<tr><td>${f.taller.replace(/</g, "&lt;")}</td><td>${f.pedidos}</td><td>${precio(f.ventas)}</td><td>${precio(f.comision)}</td><td>${precio(f.envio)}</td><td>${precio(f.paraTienda)}</td><td>${precio(f.pendiente)}</td><td>${precio(f.suscripciones)}</td></tr>`).join("")}</table>
      <script>print()</script>`);
    v.document.close();
  }

  return (
    <li className="rounded-2xl bg-white ring-1 ring-arena-oscura/60">
      <button onClick={() => setAbierto(!abierto)} className="flex w-full flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-left text-sm">
        <span className="min-w-0 flex-1 font-semibold capitalize">
          {periodo.nombre}
          {periodo.enCurso && <span className="ml-2 rounded-full bg-maiz/30 px-2 py-0.5 text-[11px] font-normal">en curso</span>}
        </span>
        <span className="text-cafe">Cobrado <strong className="text-tinta">{precio(r.totalCobrado)}</strong></span>
        <span className="text-cafe">XICO <strong className="text-jade">{precio(r.gananciaXico)}</strong></span>
        <span className="text-cafe">Tiendas <strong className="text-tinta">{precio(r.paraTiendas)}</strong></span>
        <ChevronDown className={`size-4 transition ${abierto ? "rotate-180" : ""}`} />
      </button>
      {abierto && (
        <div className="grid gap-3 border-t border-arena-oscura/60 p-4">
          <Detalle r={r} titulo={periodo.nombre} />
          <div className="flex flex-wrap gap-2">
            <button onClick={descargar} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-arena-oscura hover:bg-arena">
              <Download className="size-4" /> Descargar (Excel)
            </button>
            <button onClick={imprimir} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-arena-oscura hover:bg-arena">
              <Printer className="size-4" /> Imprimir o guardar PDF
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
