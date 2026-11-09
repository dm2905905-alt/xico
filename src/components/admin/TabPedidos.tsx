"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { nombreEnvio } from "@/lib/envios";
import { precio } from "@/lib/formato";
import { nombreEstado, type EstadoPedido } from "@/lib/pedidos";
import type { DatosAdmin } from "./datos";

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
