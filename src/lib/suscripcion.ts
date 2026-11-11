// Mensualidad de las tiendas: 3 meses gratis desde que se registran; después $400 al mes.
// Si no pagan, tienen 7 días de tolerancia; luego la tienda se pausa (no se borra nada).
import { tiendaActiva, type Creador } from "./datos";

export const MENSUALIDAD = 400;
export const MESES_GRATIS = 3;
export const DIAS_TOLERANCIA = 7;
const DIA = 24 * 60 * 60 * 1000;

// Lo guarda solo el servidor o la administración (las reglas no dejan que la tienda lo cambie)
export type Suscripcion = { inicio?: number; pagadoHasta?: number };

export type PagoSuscripcion = {
  id: string;
  creador: string;
  uid: string;
  taller: string;
  meses: number;
  monto: number;
  estado: "pendiente" | "pagado" | "rechazado";
  metodo: "mercadopago" | "manual";
  creado: number;
  pagado?: number;
  mp?: { preferencia?: string; pago?: string; estadoPago?: string };
};

export const sumarMeses = (ms: number, meses: number) => {
  const d = new Date(ms);
  d.setMonth(d.getMonth() + meses);
  return d.getTime();
};

export type FaseSuscripcion = "prueba" | "activa" | "vencida" | "pausada" | "sin-fecha";

export function estadoSuscripcion(c: Pick<Creador, "suscripcion" | "solicitada">, ahora: number) {
  const inicio = c.suscripcion?.inicio ?? c.solicitada;
  if (!inicio) return { fase: "sin-fecha" as FaseSuscripcion, finGratis: 0, vence: 0, pausaEn: 0 };
  const finGratis = sumarMeses(inicio, MESES_GRATIS);
  const vence = Math.max(finGratis, c.suscripcion?.pagadoHasta ?? 0);
  const pausaEn = vence + DIAS_TOLERANCIA * DIA;
  const fase: FaseSuscripcion = ahora < finGratis ? "prueba" : ahora < vence ? "activa" : ahora < pausaEn ? "vencida" : "pausada";
  return { fase, finGratis, vence, pausaEn };
}

// Hasta cuándo queda pagado si hoy paga `meses`: dentro de la tolerancia se cuenta desde que venció;
// si ya estaba pausada, desde hoy.
export function nuevoPagadoHasta(c: Pick<Creador, "suscripcion" | "solicitada">, meses: number, ahora: number) {
  const { fase, vence } = estadoSuscripcion(c, ahora);
  const base = fase === "pausada" || fase === "sin-fecha" ? ahora : vence;
  return sumarMeses(base, meses);
}

export const diasHasta = (ms: number, ahora: number) => Math.ceil((ms - ahora) / DIA);

// ¿Se muestra y puede vender? Aprobada y sin mensualidad vencida de más de 7 días.
// Las tiendas de ejemplo (sin dueño) no pagan mensualidad.
export const tiendaVisible = (c: Pick<Creador, "estadoTienda" | "suscripcion" | "solicitada" | "uid">, ahora: number) =>
  tiendaActiva(c) && (!c.uid || estadoSuscripcion(c, ahora).fase !== "pausada");
