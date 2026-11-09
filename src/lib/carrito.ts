"use client";

import { crearAlmacen } from "./almacen";
import type { ProductoTarjeta } from "./datos";

// Copia de los datos del producto al momento de agregarlo.
// El precio final se vuelve a verificar contra la base de datos al pagar (Fase 6).
export type ProductoEnCarrito = ProductoTarjeta & { creador: string };

export type ArticuloCarrito = {
  id: string; // único por producto + personalización
  producto: ProductoEnCarrito;
  cantidad: number;
  extras: number; // costo de extras por pieza
  opciones: { etiqueta: string; valor: string }[];
  foto?: string; // imagen de referencia comprimida (data URL)
  conFoto?: boolean; // la foto se quedó en otro dispositivo
};

// Envío estimado por creador (cada creador envía su paquete por separado).
// En la Fase 7 se reemplaza por la cotización real de la paquetería.
export const ENVIO_POR_CREADOR = 99;
export const ENVIO_GRATIS_DESDE = 999;

const almacen = crearAlmacen<ArticuloCarrito[]>("xico-carrito", []);

// Descarta artículos guardados con un formato anterior
const validos = (lista: unknown[]) =>
  lista.filter((x): x is ArticuloCarrito => typeof x === "object" && x !== null && "producto" in x && "id" in x);

export const useCarrito = () => validos(almacen.useValor());
export const leerCarrito = () => validos(almacen.leer());
export const suscribirCarrito = almacen.suscribir;
export const guardarCarrito = (lista: ArticuloCarrito[]) => almacen.escribir(lista);

export function agregarAlCarrito(a: Omit<ArticuloCarrito, "id">) {
  // Mismo producto con la misma personalización (y sin foto) = se suma la cantidad
  const slug = a.producto.slug;
  const id = a.foto ? `${slug}|${crypto.randomUUID()}` : `${slug}|${JSON.stringify(a.opciones)}|${a.extras}`;
  almacen.escribir((lista) => {
    const actuales = validos(lista);
    const existente = actuales.find((x) => x.id === id);
    if (existente) return actuales.map((x) => (x.id === id ? { ...x, cantidad: Math.min(20, x.cantidad + a.cantidad) } : x));
    return [...actuales, { ...a, id }];
  });
}

export function cambiarCantidad(id: string, cantidad: number) {
  almacen.escribir((lista) => validos(lista).map((x) => (x.id === id ? { ...x, cantidad: Math.max(1, Math.min(20, cantidad)) } : x)));
}

export function quitarDelCarrito(id: string) {
  almacen.escribir((lista) => validos(lista).filter((x) => x.id !== id));
}

export function vaciarCarrito() {
  almacen.escribir([]);
}

// Agrupa el carrito por creador y calcula subtotales y envío
export function resumirCarrito(lista: ArticuloCarrito[]) {
  type Grupo = {
    creador: string;
    taller: string;
    articulos: (ArticuloCarrito & { precioUnitario: number })[];
    subtotal: number;
    envio: number;
  };
  const grupos = new Map<string, Grupo>();

  for (const a of lista) {
    const precioUnitario = a.producto.precio + a.extras;
    const g = grupos.get(a.producto.creador) ?? {
      creador: a.producto.creador,
      taller: a.producto.taller,
      articulos: [],
      subtotal: 0,
      envio: 0,
    };
    g.articulos.push({ ...a, precioUnitario });
    g.subtotal += precioUnitario * a.cantidad;
    grupos.set(a.producto.creador, g);
  }

  const lista2 = [...grupos.values()];
  for (const g of lista2) g.envio = g.subtotal >= ENVIO_GRATIS_DESDE ? 0 : ENVIO_POR_CREADOR;

  const productos = lista2.reduce((s, g) => s + g.subtotal, 0);
  const envio = lista2.reduce((s, g) => s + g.envio, 0);
  const piezas = lista.reduce((s, a) => s + a.cantidad, 0);
  return { grupos: lista2, productos, envio, total: productos + envio, piezas };
}
