// Tipos de pedido (compartidos por el servidor y el navegador)
import type { CategoriaSlug } from "./datos";
import type { EstadoEnvio } from "./envios";

export const COMISION_XICO = 0.15; // 15% por venta

export type Direccion = {
  nombre: string;
  telefono: string;
  calle: string;
  numero: string;
  colonia: string;
  cp: string;
  ciudad: string;
  estado: string;
  referencias?: string;
};

export type ArticuloPedido = {
  slug: string;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  opciones: { etiqueta: string; valor: string }[];
  colores: [string, string];
  forma: "alta" | "media" | "cuadrada";
  categoria: CategoriaSlug;
  foto?: string; // miniatura del producto al momento de comprar
};

export type GrupoPedido = {
  creador: string; // slug
  taller: string;
  articulos: ArticuloPedido[];
  subtotal: number;
  envio: number;
  comision: number; // lo que se queda XICO
  paraCreador: number; // lo que recibe el creador (subtotal - comisión + envío)
  // Envío de este paquete (cada creador manda el suyo)
  envioEstado?: EstadoEnvio;
  paqueteria?: string; // id de paqueteria (ver envios.ts)
  guia?: string;
  enviadoEn?: number;
  entregadoEn?: number;
  // Cuándo XICO le transfirió su parte al creador (mientras no haya reparto automático)
  liquidado?: number;
};

export type EstadoPedido = "pendiente_pago" | "pagado" | "rechazado" | "enviado" | "entregado" | "cancelado";

export type Pedido = {
  id: string;
  uid: string; // comprador
  email: string;
  participantes: string[]; // uid del comprador y de los creadores (para las reglas de lectura)
  creadores: string[]; // slugs
  grupos: GrupoPedido[];
  productos: number;
  envio: number;
  total: number;
  direccion: Direccion;
  estado: EstadoPedido;
  creado: number; // milisegundos
  pagado?: number;
  mp?: { preferencia?: string; pago?: string; estadoPago?: string };
  propuestaId?: string; // si viene de una propuesta personalizada del chat
};

// Lo que el navegador manda al servidor para pagar (sin precios: el servidor los calcula)
export type ArticuloSolicitado = {
  slug: string;
  cantidad: number;
  extras: number;
  extrasIds?: string[];
  opciones: { etiqueta: string; valor: string }[];
};

export const nombreEstado: Record<EstadoPedido, string> = {
  pendiente_pago: "Esperando pago",
  pagado: "Pagado · en preparación",
  rechazado: "Pago rechazado",
  enviado: "Enviado",
  entregado: "Entregado",
  cancelado: "Cancelado",
};

export const camposDireccion: { clave: keyof Direccion; etiqueta: string; max: number; requerido: boolean; ancho?: boolean; tipo?: string }[] = [
  { clave: "nombre", etiqueta: "Nombre de quien recibe", max: 80, requerido: true, ancho: true },
  { clave: "telefono", etiqueta: "Teléfono (10 dígitos)", max: 14, requerido: true, tipo: "tel" },
  { clave: "cp", etiqueta: "Código postal", max: 5, requerido: true },
  { clave: "calle", etiqueta: "Calle", max: 100, requerido: true, ancho: true },
  { clave: "numero", etiqueta: "Número exterior e interior", max: 20, requerido: true },
  { clave: "colonia", etiqueta: "Colonia", max: 80, requerido: true },
  { clave: "ciudad", etiqueta: "Ciudad o municipio", max: 80, requerido: true },
  { clave: "estado", etiqueta: "Estado", max: 40, requerido: true },
  { clave: "referencias", etiqueta: "Referencias (opcional)", max: 200, requerido: false, ancho: true },
];

// Revisa la dirección; devuelve el primer problema o null
export function problemaDireccion(d: Partial<Direccion>): string | null {
  for (const c of camposDireccion) {
    const v = String(d[c.clave] ?? "").trim();
    if (c.requerido && !v) return `Falta: ${c.etiqueta.toLowerCase()}.`;
    if (v.length > c.max) return `Demasiado largo: ${c.etiqueta.toLowerCase()}.`;
  }
  if (!/^\d{5}$/.test(String(d.cp ?? "").trim())) return "El código postal debe tener 5 números.";
  if (String(d.telefono ?? "").replace(/\D/g, "").length !== 10) return "El teléfono debe tener 10 dígitos.";
  return null;
}
