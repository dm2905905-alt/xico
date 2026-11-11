// Asistente "Encuentra un regalo": puntúa productos según para quién, la ocasión y el presupuesto.
import type { CategoriaSlug, ProductoTarjeta } from "./datos";

// Lo que necesita el asistente de cada producto (se manda al navegador solo esto)
export type ProductoRegalo = ProductoTarjeta & { vendidos: number };

type Pesos = Partial<Record<CategoriaSlug, number>>;

export const destinatarios: { id: string; texto: string; emoji: string; pesos: Pesos }[] = [
  { id: "mama", texto: "Mamá", emoji: "💐", pesos: { decoracion: 3, joyeria: 3, velas: 3, belleza: 3, bolsas: 2, cocina: 2, jardin: 2, regalos: 2, ropa: 1, artesania: 2 } },
  { id: "papa", texto: "Papá", emoji: "🧔", pesos: { regalos: 3, cocina: 2, accesorios: 2, artesania: 2, cuadros: 2, calzado: 2, fundas: 2, jardin: 1 } },
  { id: "pareja", texto: "Mi pareja", emoji: "💘", pesos: { joyeria: 3, cuadros: 3, regalos: 3, ropa: 2, calzado: 2, bolsas: 2, velas: 2, belleza: 2, fundas: 2 } },
  { id: "amistad", texto: "Amiga o amigo", emoji: "🫶", pesos: { velas: 3, fundas: 3, accesorios: 3, joyeria: 2, papeleria: 2, belleza: 2, bolsas: 2, regalos: 2, decoracion: 1 } },
  { id: "peques", texto: "Niña o niño", emoji: "🧸", pesos: { juguetes: 3, bebes: 3, papeleria: 2, ropa: 2, accesorios: 2, regalos: 2, fiestas: 1 } },
  { id: "abuelos", texto: "Abuelita o abuelito", emoji: "👵", pesos: { decoracion: 3, artesania: 3, cocina: 3, jardin: 3, cuadros: 2, regalos: 2, velas: 1 } },
  { id: "trabajo", texto: "Alguien del trabajo", emoji: "💼", pesos: { velas: 3, papeleria: 3, cocina: 3, regalos: 3, jardin: 2, belleza: 2, artesania: 1 } },
  { id: "mascota", texto: "Mi mascota", emoji: "🐾", pesos: { mascotas: 5 } },
  { id: "yo", texto: "Para mí", emoji: "✨", pesos: { ropa: 2, calzado: 2, bolsas: 2, accesorios: 2, fundas: 2, cuadros: 2, joyeria: 2, belleza: 2, decoracion: 1, manualidades: 1 } },
];

export const ocasiones: { id: string; texto: string; emoji: string; pesos: Pesos; personal: boolean }[] = [
  { id: "cumple", texto: "Cumpleaños", emoji: "🎂", pesos: { regalos: 1, fiestas: 1 }, personal: true },
  { id: "aniversario", texto: "Aniversario", emoji: "💍", pesos: { joyeria: 2, cuadros: 2, regalos: 1 }, personal: true },
  { id: "madres", texto: "Día de las Madres", emoji: "🌷", pesos: { joyeria: 2, decoracion: 2, belleza: 2, jardin: 1, velas: 1 }, personal: true },
  { id: "navidad", texto: "Navidad", emoji: "🎄", pesos: { velas: 2, decoracion: 2, cocina: 1, juguetes: 1, regalos: 1 }, personal: false },
  { id: "graduacion", texto: "Graduación", emoji: "🎓", pesos: { regalos: 2, papeleria: 1, cuadros: 1, joyeria: 1 }, personal: true },
  { id: "boda", texto: "Boda", emoji: "💒", pesos: { fiestas: 2, decoracion: 2, cocina: 2, artesania: 1, velas: 1 }, personal: false },
  { id: "bebe", texto: "Nacimiento o baby shower", emoji: "🍼", pesos: { bebes: 3, juguetes: 2 }, personal: true },
  { id: "gracias", texto: "Agradecimiento", emoji: "🙏", pesos: { velas: 2, belleza: 1, jardin: 1, artesania: 1, regalos: 1 }, personal: false },
  { id: "porque-si", texto: "Porque sí", emoji: "😊", pesos: {}, personal: false },
];

export const presupuestos: { id: string; texto: string; min: number; max: number }[] = [
  { id: "300", texto: "Menos de $300", min: 0, max: 299 },
  { id: "500", texto: "$300 a $500", min: 300, max: 500 },
  { id: "1000", texto: "$500 a $1,000", min: 500, max: 1000 },
  { id: "mas", texto: "Más de $1,000", min: 1000, max: Infinity },
];

export type Sugerencia = { producto: ProductoRegalo; razones: string[] };

export function sugerirRegalos(productos: ProductoRegalo[], destinoId: string, ocasionId: string, presupuestoId: string): Sugerencia[] {
  const destino = destinatarios.find((d) => d.id === destinoId);
  const ocasion = ocasiones.find((o) => o.id === ocasionId);
  const presupuesto = presupuestos.find((p) => p.id === presupuestoId);
  if (!destino || !ocasion || !presupuesto) return [];

  const dentro = productos.filter((p) => p.precio >= presupuesto.min && p.precio <= presupuesto.max);

  const puntuados = dentro
    .map((p) => {
      const afinidad = (destino.pesos[p.categoria] ?? 0) + (ocasion.pesos[p.categoria] ?? 0);
      const toquePersonal = ocasion.personal && p.personalizable;
      const puntos = afinidad * 10 + (toquePersonal ? 8 : p.personalizable ? 3 : 0) + p.calificacion * 2 + Math.log10(p.vendidos + 1) * 3 + (p.precioAntes ? 2 : 0);

      const razones: string[] = [];
      if (toquePersonal) razones.push("✍️ Puedes personalizarlo");
      if ((destino.pesos[p.categoria] ?? 0) >= 3) razones.push(`${destino.emoji} Ideal para ${destino.texto.toLowerCase()}`);
      if (p.calificacion >= 4.8) razones.push("⭐ Muy bien calificado");
      if (p.precioAntes) razones.push("🏷️ En oferta");
      if (p.vendidos >= 500) razones.push("🔥 De los más vendidos");
      return { producto: p, razones: razones.slice(0, 2), puntos, afinidad };
    });

  // Primero lo que encaja con la persona; si nada encaja, lo mejor dentro del presupuesto
  const afines = puntuados.filter((s) => s.afinidad > 0 || destino.id === "yo");
  return (afines.length ? afines : puntuados)
    .sort((a, b) => b.puntos - a.puntos)
    .slice(0, 12)
    .map(({ producto, razones }) => ({ producto, razones }));
}
