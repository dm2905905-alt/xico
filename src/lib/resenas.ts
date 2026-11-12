// Reseñas con estrellas (1 a 5) de productos y de tiendas. Solo quien compró puede opinar.
export type TipoResena = "producto" | "tienda";

export type Resena = {
  id: string; // `${tipo}_${objetivo}_${uid}`: una por persona y producto/tienda
  tipo: TipoResena;
  objetivo: string; // slug del producto o de la tienda
  creador: string; // slug de la tienda (también en reseñas de producto)
  producto?: string; // nombre del producto (para mostrarlo en la tienda)
  uid: string;
  nombre: string; // "Ana G."
  estrellas: number;
  texto: string;
  fecha: number;
  editada?: boolean;
};

export const MAX_TEXTO_RESENA = 600;
export const idResena = (tipo: TipoResena, objetivo: string, uid: string) => `${tipo}_${objetivo}_${uid}`;

// Promedio con un decimal
export function promedio(estrellas: number[]) {
  if (!estrellas.length) return { calificacion: 0, resenas: 0 };
  const total = estrellas.reduce((s, n) => s + n, 0);
  return { calificacion: Math.round((total / estrellas.length) * 10) / 10, resenas: estrellas.length };
}

// "Ana García López" → "Ana G."
export function nombreCorto(completo?: string) {
  const partes = (completo ?? "").trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return "Cliente de XICO";
  return partes.length > 1 ? `${partes[0]} ${partes[1][0].toUpperCase()}.` : partes[0];
}

export const fechaResena = (t: number) => new Date(t).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
