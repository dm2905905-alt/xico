"use client";

import { useState } from "react";
import { Check, Copy, Download, ExternalLink, Loader2, PackageCheck, Truck } from "lucide-react";
import { paqueteriaPorId, paqueterias } from "@/lib/envios";
import type { GrupoPedido, Pedido } from "@/lib/pedidos";
import { useSesion } from "./Sesion";

const fecha = (ms?: number) => (ms ? new Date(ms).toLocaleDateString("es-MX", { day: "numeric", month: "short" }) : "");

// Estado del envío de un paquete y, según quién lo ve, las acciones posibles
export function EnvioPaquete({ pedido, grupo, rol }: { pedido: Pedido; grupo: GrupoPedido; rol: "comprador" | "tienda" }) {
  const { usuario } = useSesion();
  const estado = grupo.envioEstado ?? "preparando";
  const [editando, setEditando] = useState(false);
  const [paqueteria, setPaqueteria] = useState(grupo.paqueteria ?? "");
  const [guia, setGuia] = useState(grupo.guia ?? "");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [copiado, setCopiado] = useState(false);

  const pagado = pedido.estado === "pagado" || pedido.estado === "enviado" || pedido.estado === "entregado";
  if (!pagado) return null;

  async function enviarCambio(cuerpo: Record<string, string>) {
    if (!usuario) return;
    setOcupado(true);
    setError("");
    try {
      const r = await fetch("/api/pedidos/envio", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await usuario.getIdToken()}` },
        body: JSON.stringify({ pedidoId: pedido.id, creador: grupo.creador, ...cuerpo }),
      });
      if (!r.ok) throw new Error((await r.json()).error ?? "No se pudo guardar.");
      setEditando(false); // el pedido se actualiza solo (se lee en vivo)
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  const empresa = paqueteriaPorId(grupo.paqueteria);
  const ligaRastreo = grupo.rastreoUrl || (empresa && grupo.guia ? empresa.rastreo(grupo.guia) : "");
  // Guía hecha por XICO con Envia: la tienda solo imprime y entrega el paquete
  const conEnvia = !!grupo.envia;
  const pasos = [
    { clave: "pagado", texto: "Pagado", hecho: true, cuando: fecha(pedido.pagado) },
    { clave: "enviado", texto: "Enviado", hecho: estado !== "preparando", cuando: fecha(grupo.enviadoEn) },
    { clave: "entregado", texto: "Entregado", hecho: estado === "entregado", cuando: fecha(grupo.entregadoEn) },
  ];
  const mostrarFormulario = !conEnvia && rol === "tienda" && (estado === "preparando" || editando);

  return (
    <div className="border-t border-arena-oscura/60 bg-arena/20 px-5 py-4 text-sm">
      {/* Línea de tiempo */}
      <ol className="flex items-center gap-2">
        {pasos.map((p, i) => (
          <li key={p.clave} className="flex flex-1 items-center gap-2">
            <span className={`grid size-6 shrink-0 place-items-center rounded-full ${p.hecho ? "bg-jade text-white" : "bg-arena-oscura text-cafe"}`}>
              {p.hecho ? <Check className="size-3.5" /> : i + 1}
            </span>
            <span className="min-w-0">
              <span className={`block text-xs font-semibold ${p.hecho ? "text-tinta" : "text-cafe"}`}>{p.texto}</span>
              {p.cuando && <span className="block text-[11px] text-cafe">{p.cuando}</span>}
            </span>
            {i < pasos.length - 1 && <span className={`h-0.5 flex-1 rounded ${pasos[i + 1].hecho ? "bg-jade" : "bg-arena-oscura"}`} />}
          </li>
        ))}
      </ol>

      {/* Datos del envío */}
      {estado !== "preparando" && !editando && empresa && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="flex items-center gap-1.5">
            <Truck className="size-4 text-terracota" /> {empresa.nombre}
          </span>
          {grupo.guia && (
            <button
              type="button"
              onClick={async () => {
                await navigator.clipboard.writeText(grupo.guia ?? "");
                setCopiado(true);
                setTimeout(() => setCopiado(false), 2000);
              }}
              className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1 font-mono text-xs ring-1 ring-arena-oscura hover:bg-arena"
              title="Copiar número de guía"
            >
              Guía {grupo.guia} {copiado ? <Check className="size-3.5 text-jade" /> : <Copy className="size-3.5" />}
            </button>
          )}
          {ligaRastreo && (
            <a href={ligaRastreo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-semibold text-terracota hover:underline">
              Rastrear paquete <ExternalLink className="size-3.5" />
            </a>
          )}
        </div>
      )}

      {/* Envío con Envia: guía automática */}
      {conEnvia && grupo.envia && (
        <div className="mt-3 grid gap-2">
          <p className="flex items-center gap-1.5 text-cafe">
            <Truck className="size-4 text-terracota" /> {grupo.envia.descripcion}
            {grupo.rastreoEstado && <span className="rounded-full bg-arena px-2 py-0.5 text-[11px]">{grupo.rastreoEstado}</span>}
          </p>
          {estado === "preparando" && grupo.guia && (
            <p className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white px-3 py-1 font-mono text-xs ring-1 ring-arena-oscura">Guía {grupo.guia}</span>
              {ligaRastreo && rol === "comprador" && (
                <a href={ligaRastreo} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 font-semibold text-terracota hover:underline">
                  Rastrear <ExternalLink className="size-3.5" />
                </a>
              )}
            </p>
          )}
          {rol === "tienda" && estado === "preparando" && (
            grupo.guia ? (
              <div className="grid gap-2 rounded-2xl bg-white p-3 ring-1 ring-terracota/30">
                <p className="font-semibold">Tu guía está lista</p>
                <ol className="list-decimal pl-5 text-xs text-cafe">
                  <li>Descarga e imprime la guía.</li>
                  <li>
                    Empaca bien: caja rígida, relleno por todos lados y doble caja si es frágil. Si llega dañado por mal empaque, el reembolso se
                    descuenta de tu pago.{" "}
                    <a href="/envios" target="_blank" className="font-semibold text-terracota underline">
                      Cómo empacar
                    </a>
                  </li>
                  <li>Toma una foto del paquete antes de cerrarlo y pega la guía.</li>
                  <li>Llévala a una sucursal de {grupo.envia.descripcion.split(" · ")[0]} (o espera la recolección si la programaste).</li>
                </ol>
                <div className="flex flex-wrap gap-2">
                  {grupo.etiqueta && (
                    <a href={grupo.etiqueta} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-terracota px-4 py-2 text-sm font-semibold text-crema">
                      <Download className="size-4" /> Descargar guía (PDF)
                    </a>
                  )}
                  <button
                    onClick={() => enviarCambio({ accion: "enviar" })}
                    disabled={ocupado}
                    className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm ring-1 ring-arena-oscura hover:bg-arena disabled:opacity-60"
                  >
                    {ocupado ? <Loader2 className="size-4 animate-spin" /> : <Truck className="size-4" />} Ya lo entregué a la paquetería
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-maiz/20 px-3 py-2 text-xs">
                {grupo.guiaError ? "No se pudo generar tu guía todavía. Puedes intentarlo de nuevo; si sigue fallando, XICO te ayuda." : "Generando tu guía…"}
                {grupo.guiaError && (
                  <button
                    onClick={async () => {
                      if (!usuario) return;
                      setOcupado(true);
                      setError("");
                      try {
                        const r = await fetch("/api/envios/guia", {
                          method: "POST",
                          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await usuario.getIdToken()}` },
                          body: JSON.stringify({ pedidoId: pedido.id, creador: grupo.creador }),
                        });
                        if (!r.ok) throw new Error((await r.json()).error ?? "No se pudo.");
                      } catch (e) {
                        setError((e as Error).message);
                      } finally {
                        setOcupado(false);
                      }
                    }}
                    disabled={ocupado}
                    className="mt-2 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold ring-1 ring-arena-oscura"
                  >
                    {ocupado && <Loader2 className="size-3.5 animate-spin" />} Generar mi guía
                  </button>
                )}
              </div>
            )
          )}
          {rol === "comprador" && estado === "preparando" && !grupo.guia && <p className="text-cafe">{grupo.taller} está preparando tu paquete.</p>}
        </div>
      )}

      {/* Comprador: confirmar que llegó */}
      {rol === "comprador" && estado === "preparando" && !conEnvia && <p className="mt-3 text-cafe">{grupo.taller} está preparando tu paquete.</p>}
      {rol === "comprador" && estado === "enviado" && (
        <button
          onClick={() => enviarCambio({ accion: "entregar" })}
          disabled={ocupado}
          className="mt-3 flex items-center gap-2 rounded-full bg-jade px-4 py-2 font-semibold text-white hover:bg-jade/90 disabled:opacity-60"
        >
          {ocupado ? <Loader2 className="size-4 animate-spin" /> : <PackageCheck className="size-4" />} Ya lo recibí
        </button>
      )}

      {/* Tienda: registrar o corregir el envío */}
      {mostrarFormulario && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            enviarCambio({ accion: "enviar", paqueteria, guia });
          }}
          className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
        >
          <label className="grid gap-1 text-xs font-medium">
            Paquetería
            <select value={paqueteria} onChange={(e) => setPaqueteria(e.target.value)} className="h-10 rounded-lg border border-arena-oscura bg-white px-3 text-sm" required>
              <option value="">Elige…</option>
              {paqueterias.map((p) => (
                <option key={p.id} value={p.id}>{p.nombre}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-medium">
            Número de guía
            <input
              value={guia}
              onChange={(e) => setGuia(e.target.value)}
              maxLength={40}
              disabled={paqueteria === "local"}
              placeholder={paqueteria === "local" ? "No aplica" : "Ej. 1234567890"}
              className="h-10 rounded-lg border border-arena-oscura bg-white px-3 font-mono text-sm disabled:opacity-50"
            />
          </label>
          <button type="submit" disabled={ocupado} className="flex h-10 items-center justify-center gap-2 rounded-full bg-terracota px-5 font-semibold text-crema hover:bg-terracota-oscura disabled:opacity-60">
            {ocupado ? <Loader2 className="size-4 animate-spin" /> : <Truck className="size-4" />} {estado === "preparando" ? "Marcar como enviado" : "Guardar"}
          </button>
        </form>
      )}
      {rol === "tienda" && estado === "enviado" && !editando && (
        <div className="mt-3 flex flex-wrap gap-2">
          {!conEnvia && <button onClick={() => setEditando(true)} className="rounded-full border border-arena-oscura px-3 py-1.5 text-xs hover:bg-arena">Corregir guía</button>}
          <button onClick={() => enviarCambio({ accion: "entregar" })} disabled={ocupado} className="rounded-full border border-arena-oscura px-3 py-1.5 text-xs hover:bg-arena disabled:opacity-60">
            Marcar como entregado
          </button>
        </div>
      )}
      {rol === "tienda" && estado === "preparando" && !conEnvia && (
        <p className="mt-2 text-xs text-cafe">Empaca con cuidado y envía a la dirección del pedido. Después registra aquí la guía para que el cliente pueda rastrearlo.</p>
      )}

      {error && <p role="alert" className="mt-3 rounded-lg bg-rosa/10 px-3 py-2 text-rosa">{error}</p>}
    </div>
  );
}
