"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronRight, Loader2, RefreshCw, Truck } from "lucide-react";
import { nombreEnvio } from "@/lib/envios";
import { precio } from "@/lib/formato";
import { nombreEstado, type EstadoPedido } from "@/lib/pedidos";
import { useSesion } from "../Sesion";
import { llamar, type DatosAdmin } from "./datos";

const filtros: { id: string; texto: string; estados: EstadoPedido[] }[] = [
  { id: "activos", texto: "Por atender", estados: ["pagado", "enviado"] },
  { id: "entregados", texto: "Entregados", estados: ["entregado"] },
  { id: "sin-pagar", texto: "Sin pagar", estados: ["pendiente_pago", "rechazado"] },
  { id: "todos", texto: "Todos", estados: ["pendiente_pago", "pagado", "rechazado", "enviado", "entregado", "cancelado"] },
];

// Todos los pedidos de XICO con el estado de cada paquete
export function TabPedidos({ datos }: { datos: DatosAdmin }) {
  const [filtro, setFiltro] = useState("activos");
  const estados = filtros.find((f) => f.id === filtro)!.estados;
  const lista = datos.pedidos.filter((p) => estados.includes(p.estado));

  return (
    <div className="grid gap-4">
      <PanelEnvia datos={datos} />
      <div className="flex flex-wrap gap-2">
        {filtros.map((f) => (
          <button key={f.id} onClick={() => setFiltro(f.id)} className={`rounded-full px-4 py-1.5 text-sm ${filtro === f.id ? "bg-tinta text-crema" : "bg-white ring-1 ring-arena-oscura"}`}>
            {f.texto} ({datos.pedidos.filter((p) => f.estados.includes(p.estado)).length})
          </button>
        ))}
      </div>

      <ul className="divide-y divide-arena-oscura/50 rounded-2xl bg-white px-4 ring-1 ring-arena-oscura/60">
        {lista.map((p) => (
          <li key={p.id}>
            <Link href={`/pedido/${p.id}`} target="_blank" className="flex items-center gap-4 py-3 hover:bg-arena/30">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">
                  #{p.id.slice(0, 8).toUpperCase()} · {nombreEstado[p.estado]}
                  <span className="ml-2 font-normal text-cafe">
                    {new Date(p.creado).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </p>
                <p className="truncate text-xs text-cafe">
                  {p.direccion.nombre} · {p.direccion.ciudad}, {p.direccion.estado}
                </p>
                <p className="mt-1 flex flex-wrap gap-1.5">
                  {p.grupos.map((g) => (
                    <span key={g.creador} className="rounded-full bg-arena px-2 py-0.5 text-[11px]">
                      {g.taller}: {nombreEnvio[g.envioEstado ?? "preparando"]}
                      {g.envia && !g.guia && " · ⚠️ sin guía"}
                    </span>
                  ))}
                </p>
              </div>
              <p className="font-bold">{precio(p.total)}</p>
              <ChevronRight className="size-4 text-cafe" />
            </Link>
          </li>
        ))}
        {!lista.length && <li className="py-6 text-center text-sm text-cafe">No hay pedidos en esta lista.</li>}
      </ul>
    </div>
  );
}

// Envia: modo, guías que fallaron (por ejemplo, sin saldo) y avisos de rastreo
function PanelEnvia({ datos }: { datos: DatosAdmin }) {
  const { usuario } = useSesion();
  const [estado, setEstado] = useState<{ configurado: boolean; modo: string } | null>(null);
  const [ocupado, setOcupado] = useState("");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    if (!usuario) return;
    llamar<{ configurado: boolean; modo: string }>(usuario, "/api/admin/envia", { accion: "estado" }).then(setEstado).catch(() => setEstado(null));
  }, [usuario]);

  const sinGuia = datos.pedidos.filter((p) => ["pagado", "enviado"].includes(p.estado) && p.grupos.some((g) => g.envia && !g.guia));

  async function accion(cuerpo: Record<string, string>, clave: string) {
    if (!usuario) return;
    setOcupado(clave);
    setMensaje("");
    try {
      const r = await llamar<{ resultados?: { ok: boolean; mensaje?: string }[] }>(usuario, "/api/admin/envia", cuerpo);
      if (cuerpo.accion === "rastreo") setMensaje("Listo: Envia avisará a XICO cada cambio de rastreo.");
      else {
        const fallas = (r.resultados ?? []).filter((x) => !x.ok);
        setMensaje(fallas.length ? `No se pudo: ${fallas.map((x) => x.mensaje).join("; ")}` : "Guía generada.");
      }
    } catch (e) {
      setMensaje((e as Error).message);
    } finally {
      setOcupado("");
    }
  }

  if (!estado) return null;
  return (
    <section className="rounded-2xl bg-white p-4 text-sm ring-1 ring-arena-oscura/60">
      <div className="flex flex-wrap items-center gap-3">
        <Truck className="size-5 text-terracota" />
        <p className="min-w-0 flex-1">
          <strong>Envia:</strong>{" "}
          {!estado.configurado ? (
            <span className="text-rosa">no configurado (se cobra el envío fijo)</span>
          ) : estado.modo === "real" ? (
            <span className="text-jade">guías reales</span>
          ) : (
            <span className="text-terracota">modo de prueba (guías de mentira)</span>
          )}
        </p>
        {estado.configurado && (
          <button onClick={() => accion({ accion: "rastreo" }, "rastreo")} disabled={!!ocupado} className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ring-1 ring-arena-oscura hover:bg-arena">
            {ocupado === "rastreo" && <Loader2 className="size-3.5 animate-spin" />} Activar avisos de rastreo
          </button>
        )}
      </div>
      {sinGuia.length > 0 && (
        <ul className="mt-3 grid gap-2">
          {sinGuia.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-2 rounded-xl bg-rosa/10 px-3 py-2">
              <span className="min-w-0 flex-1">
                ⚠️ Pedido #{p.id.slice(0, 8).toUpperCase()} sin guía
                <span className="block text-xs text-cafe">{p.grupos.filter((g) => g.envia && !g.guia).map((g) => `${g.taller}: ${g.guiaError || "pendiente"}`).join(" · ")}</span>
              </span>
              <button onClick={() => accion({ accion: "guias", pedidoId: p.id }, p.id)} disabled={!!ocupado} className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs ring-1 ring-arena-oscura">
                {ocupado === p.id ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" />} Reintentar
              </button>
            </li>
          ))}
          <li className="text-xs text-cafe">Si dice &quot;saldo&quot;, recarga saldo en tu cuenta de Envia y presiona Reintentar.</li>
        </ul>
      )}
      {mensaje && <p className="mt-2 text-xs">{mensaje}</p>}
    </section>
  );
}
