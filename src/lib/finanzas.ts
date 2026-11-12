// Cuentas de XICO: cuánto se cobró, cuánto ganó XICO y cuánto le toca a cada tienda en un periodo.
import type { Pedido } from "./pedidos";
import type { PagoSuscripcion } from "./suscripcion";
import type { BonoPendiente } from "./eventos";

export type FilaTienda = {
  creador: string;
  taller: string;
  pedidos: number;
  ventas: number; // productos vendidos (sin envío)
  comision: number;
  envio: number;
  paraTienda: number; // ventas - comisión + envío
  pagado: number; // ya transferido
  pendiente: number; // aún no transferido
  suscripciones: number; // mensualidades que pagó en el periodo
  premios: number; // premios de eventos que ganó en el periodo
};

export type Resumen = {
  pedidos: number;
  totalCobrado: number; // todo lo que entró por Mercado Pago (ventas + envíos + mensualidades)
  ventas: number;
  envios: number;
  comisiones: number;
  suscripciones: number;
  premios: number; // dinero de premios de eventos (gasto de XICO)
  premiosPendientes: number; // premios aún no transferidos
  gananciaXico: number; // comisiones + mensualidades - premios
  paraTiendas: number;
  pagadoTiendas: number;
  pendienteTiendas: number;
  porTienda: FilaTienda[];
};

const cobrado = (p: Pedido) => ["pagado", "enviado", "entregado"].includes(p.estado);
export const fechaPedido = (p: Pedido) => p.pagado ?? p.creado;

export function resumir(pedidos: Pedido[], pagos: PagoSuscripcion[], desde = 0, hasta = Infinity, premiosEventos: BonoPendiente[] = []): Resumen {
  const enRango = (t: number) => t >= desde && t < hasta;
  const filas = new Map<string, FilaTienda>();
  const fila = (creador: string, taller: string) => {
    const f = filas.get(creador) ?? { creador, taller, pedidos: 0, ventas: 0, comision: 0, envio: 0, paraTienda: 0, pagado: 0, pendiente: 0, suscripciones: 0, premios: 0 };
    filas.set(creador, f);
    return f;
  };

  const lista = pedidos.filter((p) => cobrado(p) && enRango(fechaPedido(p)));
  for (const p of lista) {
    for (const g of p.grupos) {
      const f = fila(g.creador, g.taller);
      f.pedidos++;
      f.ventas += g.subtotal;
      f.comision += g.comision;
      f.envio += g.envio;
      f.paraTienda += g.paraCreador;
      if (g.liquidado) f.pagado += g.paraCreador;
      else f.pendiente += g.paraCreador;
    }
  }
  const mensualidades = pagos.filter((s) => s.estado === "pagado" && enRango(s.pagado ?? s.creado));
  for (const s of mensualidades) fila(s.creador, s.taller).suscripciones += s.monto;
  const premiosRango = premiosEventos.filter((b) => enRango(b.fecha));
  for (const b of premiosRango) fila(b.creador, b.taller).premios += b.monto;

  const porTienda = [...filas.values()].sort((a, b) => b.paraTienda - a.paraTienda || b.suscripciones - a.suscripciones);
  const suma = (k: keyof FilaTienda) => porTienda.reduce((t, f) => t + (f[k] as number), 0);
  const ventasCobradas = lista.reduce((t, p) => t + p.total, 0);
  const suscripciones = suma("suscripciones");
  const comisiones = suma("comision");
  const premios = suma("premios");
  return {
    pedidos: lista.length,
    totalCobrado: ventasCobradas + suscripciones,
    ventas: suma("ventas"),
    envios: suma("envio"),
    comisiones,
    suscripciones,
    premios,
    premiosPendientes: premiosRango.filter((b) => !b.pagado).reduce((t, b) => t + b.monto, 0),
    gananciaXico: comisiones + suscripciones - premios,
    paraTiendas: suma("paraTienda"),
    pagadoTiendas: suma("pagado"),
    pendienteTiendas: suma("pendiente"),
    porTienda,
  };
}

// ---- Periodos para los reportes (hora del navegador, en México) ----
export type TipoPeriodo = "dia" | "semana" | "mes";
export type Periodo = { tipo: TipoPeriodo; desde: number; hasta: number; nombre: string; enCurso: boolean };

const inicioDia = (t: number) => {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};
const inicioSemana = (t: number) => {
  const d = new Date(inicioDia(t));
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // la semana empieza en lunes
  return d.getTime();
};
const inicioMes = (t: number) => {
  const d = new Date(inicioDia(t));
  d.setDate(1);
  return d.getTime();
};
const corto = (t: number) => new Date(t).toLocaleDateString("es-MX", { day: "numeric", month: "short" });

// Los últimos `cuantos` periodos (el primero es el que está en curso)
export function periodos(tipo: TipoPeriodo, ahora: number, cuantos: number): Periodo[] {
  const lista: Periodo[] = [];
  let desde = tipo === "dia" ? inicioDia(ahora) : tipo === "semana" ? inicioSemana(ahora) : inicioMes(ahora);
  for (let i = 0; i < cuantos; i++) {
    const d = new Date(desde);
    const siguiente = new Date(desde);
    if (tipo === "dia") siguiente.setDate(d.getDate() + 1);
    else if (tipo === "semana") siguiente.setDate(d.getDate() + 7);
    else siguiente.setMonth(d.getMonth() + 1);
    const hasta = siguiente.getTime();
    const nombre =
      tipo === "dia"
        ? d.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })
        : tipo === "semana"
          ? `Semana del ${corto(desde)} al ${corto(hasta - 1)}`
          : d.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
    lista.push({ tipo, desde, hasta, nombre, enCurso: i === 0 });
    // Periodo anterior
    const anterior = new Date(desde);
    if (tipo === "dia") anterior.setDate(anterior.getDate() - 1);
    else if (tipo === "semana") anterior.setDate(anterior.getDate() - 7);
    else anterior.setMonth(anterior.getMonth() - 1);
    desde = anterior.getTime();
  }
  return lista;
}

// CSV (se abre en Excel) con el resumen y el detalle por tienda
export function reporteCsv(titulo: string, r: Resumen) {
  const celda = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const linea = (...v: (string | number)[]) => v.map(celda).join(",");
  return [
    linea("Reporte XICO", titulo),
    "",
    linea("Pedidos cobrados", r.pedidos),
    linea("Total cobrado (ventas + envíos + mensualidades)", r.totalCobrado.toFixed(2)),
    linea("Ventas de productos", r.ventas.toFixed(2)),
    linea("Envíos cobrados", r.envios.toFixed(2)),
    linea("Comisiones XICO", r.comisiones.toFixed(2)),
    linea("Mensualidades", r.suscripciones.toFixed(2)),
    linea("Premios de eventos", r.premios.toFixed(2)),
    linea("Ganancia XICO (comisiones + mensualidades - premios)", r.gananciaXico.toFixed(2)),
    linea("Para las tiendas", r.paraTiendas.toFixed(2)),
    linea("Ya pagado a tiendas", r.pagadoTiendas.toFixed(2)),
    linea("Pendiente de pagar a tiendas", r.pendienteTiendas.toFixed(2)),
    "",
    linea("Tienda", "Pedidos", "Ventas", "Comisión XICO", "Envío", "Le toca", "Ya pagado", "Pendiente", "Mensualidades pagadas", "Premios"),
    ...r.porTienda.map((f) =>
      linea(f.taller, f.pedidos, f.ventas.toFixed(2), f.comision.toFixed(2), f.envio.toFixed(2), f.paraTienda.toFixed(2), f.pagado.toFixed(2), f.pendiente.toFixed(2), f.suscripciones.toFixed(2), f.premios.toFixed(2)),
    ),
  ].join("\r\n");
}
