// Anuncio del evento en curso para el inicio: "Apoya a nuestros emprendedores" con el top de tiendas.
// Se calcula en el servidor (los pedidos son privados) y solo se publica lo seguro: nombre, foto y piezas, nunca dinero.
import { cacheLife } from "next/cache";
import type { Creador, Producto } from "../datos";
import { avances, cumple, faseEvento, textoMeta, textoPremio, type Evento } from "../eventos";
import type { Pedido } from "../pedidos";
import { adminDb } from "./admin";

export type TiendaAnuncio = { slug: string; taller: string; foto?: string; colores: [string, string]; piezas: number; logro: boolean; cerca?: boolean };

export type Anuncio = {
  id: string;
  tipo: "meta" | "top" | "ganadores";
  titulo: string;
  reto: string; // "Vende $2,000 o más y gana 1 mes gratis"
  fin: number;
  dias: number; // días que faltan para que termine
  top: TiendaAnuncio[]; // en "top": los vendedores de hoy
  logradas: number; // tiendas que ya cumplen la meta
  participantes: number; // tiendas activas
  ganadores: TiendaAnuncio[];
};

const DIA = 24 * 60 * 60 * 1000;
const MEXICO = -6 * 60 * 60 * 1000; // Ciudad de México no tiene horario de verano desde 2022
const inicioDeHoy = (ahora: number) => Math.floor((ahora + MEXICO) / DIA) * DIA - MEXICO;

export async function obtenerAnuncio(): Promise<Anuncio | null> {
  "use cache";
  cacheLife("minutes");
  try {
    const db = adminDb();
    const ahora = Date.now();
    const eventos = (await db.collection("eventos").get()).docs.map((d) => d.data() as Evento);
    // El evento en curso que termina primero; si no hay, los ganadores de uno premiado hace menos de 3 días
    const enCurso = eventos.filter((e) => faseEvento(e, ahora) === "en-curso").sort((a, b) => a.fin - b.fin)[0];
    const premiado = eventos
      .filter((e) => e.estado === "premiado" && (e.ganadores?.length ?? 0) > 0 && (e.premiado ?? 0) > ahora - 3 * DIA)
      .sort((a, b) => (b.premiado ?? 0) - (a.premiado ?? 0))[0];
    const evento = enCurso ?? premiado;
    if (!evento) return null;

    const creadores = (await db.collection("creadores").get()).docs
      .map((d) => d.data() as Creador)
      .filter((c) => c.uid && (c.estadoTienda ?? "aprobada") === "aprobada");
    const porSlug = new Map(creadores.map((c) => [c.slug, c]));
    const tienda = (slug: string, piezas: number, logro: boolean): TiendaAnuncio | null => {
      const c = porSlug.get(slug);
      return c ? { slug, taller: c.taller, foto: c.foto?.mini, colores: c.colores, piezas, logro } : null;
    };
    const base = { id: evento.id, titulo: evento.titulo, reto: `${textoMeta(evento.meta)} y gana ${textoPremio(evento.premio)}`, fin: evento.fin, dias: Math.max(0, Math.ceil((evento.fin - ahora) / DIA)) };

    if (!enCurso) {
      const ganadores = (evento.ganadores ?? []).map((g) => tienda(g.creador, 0, true)).filter((x): x is TiendaAnuncio => !!x);
      return { ...base, tipo: "ganadores", top: [], logradas: ganadores.length, participantes: creadores.length, ganadores };
    }

    // Pedidos pagados desde que empezó el evento
    const pedidos = (await db.collection("pedidos").where("pagado", ">=", evento.inicio).get()).docs.map((d) => d.data() as Pedido);
    const delEvento = avances(evento, pedidos).filter((a) => porSlug.has(a.creador));

    if (evento.meta.tipo === "top") {
      const hoy = avances({ inicio: Math.max(evento.inicio, inicioDeHoy(ahora)), fin: evento.fin }, pedidos).filter((a) => porSlug.has(a.creador));
      return {
        ...base,
        tipo: "top",
        top: hoy.slice(0, 5).map((a) => tienda(a.creador, a.piezas, false)!),
        logradas: 0,
        participantes: creadores.length,
        ganadores: [],
      };
    }
    return {
      ...base,
      tipo: "meta",
      top: delEvento.slice(0, 5).map((a) => {
        const meta = evento.meta as { tipo: "monto" | "piezas"; minimo: number };
        const avance = meta.tipo === "piezas" ? a.piezas : a.ventas;
        return { ...tienda(a.creador, a.piezas, cumple(evento.meta, a))!, cerca: avance >= meta.minimo / 2 };
      }),
      logradas: delEvento.filter((a) => cumple(evento.meta, a)).length,
      participantes: creadores.length,
      ganadores: [],
    };
  } catch (e) {
    console.error("[XICO] No se pudo armar el anuncio del evento:", (e as Error).message);
    return null;
  }
}

// Detalles baratos para animar compras pequeñas
export const detallesPequenos = (productos: Producto[], max = 200) =>
  productos.filter((p) => p.precio <= max).sort((a, b) => a.precio - b.precio || b.vendidos - a.vendidos).slice(0, 10);
