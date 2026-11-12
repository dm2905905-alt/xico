// Eventos para vendedores: retos con premio que crea la administración.
// Ej.: "Este mes, quien venda más de $2,000 gana 1 mes de mensualidad gratis"
//      "Esta semana, los 10 que más vendan ganan el 100% de su producto más caro"
import type { Creador } from "./datos";
import type { Pedido } from "./pedidos";

// Qué hay que lograr
export type MetaEvento =
  | { tipo: "monto"; minimo: number } // vender $X o más
  | { tipo: "piezas"; minimo: number } // vender X piezas o más
  | { tipo: "top"; lugares: number }; // los N que más vendan

// Qué se ganan
export type PremioEvento =
  | { tipo: "meses"; meses: number } // meses de mensualidad gratis
  | { tipo: "bono"; monto: number } // dinero fijo
  | { tipo: "masCaro"; porcentaje: number } // % del precio de su producto más caro vendido en el evento
  | { tipo: "comision"; porcentaje: number }; // se les devuelve % de la comisión que pagaron en el evento

export type Ganador = {
  creador: string;
  taller: string;
  lugar: number;
  monto: number; // dinero que XICO le debe (0 si el premio son meses)
  meses: number;
  pagado?: number; // cuándo se le transfirió el dinero
};

export type Evento = {
  id: string;
  titulo: string;
  descripcion: string;
  inicio: number;
  fin: number; // milisegundos (no incluido)
  meta: MetaEvento;
  premio: PremioEvento;
  estado: "activo" | "premiado" | "cancelado";
  creado: number;
  premiado?: number;
  ganadores?: Ganador[];
};

export type Avance = { creador: string; taller: string; ventas: number; piezas: number; masCaro: number; comision: number };

const cobrado = (p: Pedido) => ["pagado", "enviado", "entregado"].includes(p.estado);

// Ventas de cada tienda dentro del periodo del evento (por fecha de pago)
export function avances(evento: Pick<Evento, "inicio" | "fin">, pedidos: Pedido[]): Avance[] {
  const mapa = new Map<string, Avance>();
  for (const p of pedidos) {
    const fecha = p.pagado ?? p.creado;
    if (!cobrado(p) || fecha < evento.inicio || fecha >= evento.fin) continue;
    for (const g of p.grupos) {
      const a = mapa.get(g.creador) ?? { creador: g.creador, taller: g.taller, ventas: 0, piezas: 0, masCaro: 0, comision: 0 };
      a.ventas += g.subtotal;
      a.comision += g.comision;
      for (const x of g.articulos) {
        a.piezas += x.cantidad;
        a.masCaro = Math.max(a.masCaro, x.precioUnitario);
      }
      mapa.set(g.creador, a);
    }
  }
  return [...mapa.values()].sort((a, b) => b.ventas - a.ventas || b.piezas - a.piezas);
}

// ¿Esta tienda cumple la meta? (sin contar el lugar en el top)
export function cumple(meta: MetaEvento, a: Avance) {
  if (meta.tipo === "monto") return a.ventas >= meta.minimo;
  if (meta.tipo === "piezas") return a.piezas >= meta.minimo;
  return a.ventas > 0;
}

export function valorPremio(premio: PremioEvento, a: Avance): { monto: number; meses: number } {
  const redondear = (n: number) => Math.round(n * 100) / 100;
  if (premio.tipo === "meses") return { monto: 0, meses: premio.meses };
  if (premio.tipo === "bono") return { monto: premio.monto, meses: 0 };
  if (premio.tipo === "masCaro") return { monto: redondear((a.masCaro * premio.porcentaje) / 100), meses: 0 };
  return { monto: redondear((a.comision * premio.porcentaje) / 100), meses: 0 };
}

// Quiénes ganan (solo tiendas reales y activas: las de ejemplo no tienen dueño)
export function calcularGanadores(evento: Evento, pedidos: Pedido[], creadores: Creador[]): (Ganador & { ventas: number })[] {
  const reales = new Set(creadores.filter((c) => c.uid && (c.estadoTienda ?? "aprobada") === "aprobada").map((c) => c.slug));
  let lista = avances(evento, pedidos).filter((a) => reales.has(a.creador) && cumple(evento.meta, a));
  if (evento.meta.tipo === "top") lista = lista.slice(0, evento.meta.lugares);
  return lista.map((a, i) => ({ creador: a.creador, taller: a.taller, lugar: i + 1, ventas: a.ventas, ...valorPremio(evento.premio, a) }));
}

// Textos para mostrar
const pesos = (n: number) => `$${n.toLocaleString("es-MX", { maximumFractionDigits: 2 })}`;

export function textoMeta(m: MetaEvento) {
  if (m.tipo === "monto") return `Vende ${pesos(m.minimo)} o más`;
  if (m.tipo === "piezas") return `Vende ${m.minimo} ${m.minimo === 1 ? "pieza" : "piezas"} o más`;
  return `Queda entre los ${m.lugares} que más venden`;
}

export function textoPremio(p: PremioEvento) {
  if (p.tipo === "meses") return `${p.meses} ${p.meses === 1 ? "mes" : "meses"} de mensualidad gratis`;
  if (p.tipo === "bono") return `un bono de ${pesos(p.monto)}`;
  if (p.tipo === "masCaro") return `el ${p.porcentaje}% del valor de tu producto más caro vendido`;
  return `la devolución del ${p.porcentaje}% de tu comisión`;
}

export const fechaCorta = (t: number) => new Date(t).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
export const textoPeriodo = (e: Pick<Evento, "inicio" | "fin">) => `Del ${fechaCorta(e.inicio)} al ${fechaCorta(e.fin - 1)}`;

export type FaseEvento = "proximo" | "en-curso" | "por-premiar" | "premiado" | "cancelado";
export function faseEvento(e: Evento, ahora: number): FaseEvento {
  if (e.estado === "cancelado") return "cancelado";
  if (e.estado === "premiado") return "premiado";
  if (ahora < e.inicio) return "proximo";
  return ahora < e.fin ? "en-curso" : "por-premiar";
}

// Dinero de premios que XICO debe a las tiendas (para Pagos y Finanzas)
export type BonoPendiente = Ganador & { evento: string; titulo: string; fecha: number };
export function bonos(eventos: Evento[]): BonoPendiente[] {
  return eventos.flatMap((e) =>
    e.estado === "premiado" ? (e.ganadores ?? []).filter((g) => g.monto > 0).map((g) => ({ ...g, evento: e.id, titulo: e.titulo, fecha: e.premiado ?? e.fin })) : [],
  );
}

// Hora actual (para guardar fechas desde los botones)
export const momentoActual = () => Date.now();
