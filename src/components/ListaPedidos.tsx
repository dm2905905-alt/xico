"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { precio } from "@/lib/formato";
import { nombreEstado, type EstadoPedido, type Pedido } from "@/lib/pedidos";

const colorEstado: Record<EstadoPedido, string> = {
  pendiente_pago: "bg-maiz/20 text-terracota-oscura",
  pagado: "bg-jade/10 text-jade",
  rechazado: "bg-rosa/10 text-rosa",
  enviado: "bg-jade/10 text-jade",
  entregado: "bg-arena text-cafe",
  cancelado: "bg-rosa/10 text-rosa",
};

const fecha = (ms: number) => new Date(ms).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });

// Como comprador: todo el pedido. Como creador: solo su parte (lo que debe preparar y lo que recibe).
export function ListaPedidos({ pedidos, creador }: { pedidos: Pedido[]; creador?: string }) {
  if (!pedidos.length) return null;
  return (
    <ul className="divide-y divide-arena-oscura/50">
      {pedidos.map((p) => {
        const mio = creador ? p.grupos.find((g) => g.creador === creador) : undefined;
        const piezas = (mio ? mio.articulos : p.grupos.flatMap((g) => g.articulos)).reduce((s, a) => s + a.cantidad, 0);
        return (
          <li key={p.id}>
            <Link href={`/pedido/${p.id}`} className="flex items-center gap-4 py-3 hover:bg-arena/30">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                  #{p.id.slice(0, 8).toUpperCase()}
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${colorEstado[p.estado]}`}>{nombreEstado[p.estado]}</span>
                </p>
                <p className="truncate text-xs text-cafe">
                  {fecha(p.creado)} · {piezas} {piezas === 1 ? "pieza" : "piezas"}
                  {mio ? ` · para ${p.direccion.ciudad}, ${p.direccion.estado}` : ` · ${p.grupos.map((g) => g.taller).join(", ")}`}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold">{precio(mio ? mio.paraCreador : p.total)}</p>
                {mio && <p className="text-xs text-cafe">recibes</p>}
              </div>
              <ChevronRight className="size-4 shrink-0 text-cafe" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
