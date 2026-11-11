// Ubicación de los vendedores en el mapa de México
import { estadoPorSlug, type Creador, type Producto } from "./datos";

export type ProductoMini = Pick<Producto, "slug" | "nombre" | "precio" | "colores" | "forma" | "categoria"> & { foto?: string };
export type CreadorMapa = Creador & { productos: ProductoMini[]; totalProductos: number };

const normalizar = (t: string) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

// Número estable a partir de un texto (para que el mismo vendedor siempre caiga en el mismo lugar)
function semilla(texto: string) {
  let h = 2166136261;
  for (const ch of texto) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0) / 4294967295;
}

// Lugar del vendedor: su ciudad si la conocemos; si no, cerca de la capital de su estado
export function ubicarCreador(c: Pick<Creador, "slug" | "estado" | "ciudad">): { lat: number; lon: number } | null {
  const estado = estadoPorSlug(c.estado);
  if (!estado) return null;
  const buscada = normalizar(c.ciudad ?? "");
  const lugares = [estado.capital, ...estado.ciudades];
  const ciudad = buscada ? lugares.find((l) => normalizar(l.nombre) === buscada || buscada.includes(normalizar(l.nombre))) : undefined;
  const base = ciudad ?? estado.capital;
  // Pequeño desplazamiento para que varios vendedores de la misma ciudad no se encimen
  const ang = semilla(c.slug) * Math.PI * 2;
  const radio = (ciudad ? 0.1 : 0.16) + semilla(c.slug + "r") * 0.12;
  return { lat: base.lat + Math.sin(ang) * radio, lon: base.lon + Math.cos(ang) * radio };
}
