// Límite de intentos por persona, guardado en Firestore (funciona aunque Vercel use varios servidores).
// La colección "limites" no tiene reglas públicas: solo el servidor la lee y escribe.
import { adminDb, ErrorXico } from "./admin";

export async function limitar(uid: string, accion: string, maximo: number, ventanaMs: number, mensaje?: string) {
  const db = adminDb();
  const ref = db.collection("limites").doc(`${accion}_${uid}`);
  await db.runTransaction(async (tx) => {
    const ahora = Date.now();
    const usos = ((await tx.get(ref)).data()?.usos as number[] | undefined) ?? [];
    const recientes = usos.filter((t) => ahora - t < ventanaMs);
    if (recientes.length >= maximo) {
      throw new ErrorXico(mensaje ?? "Hiciste demasiados intentos seguidos. Espera unos minutos e inténtalo de nuevo.", 429);
    }
    tx.set(ref, { usos: [...recientes, ahora], actualizado: ahora });
  });
}

// Máximos por hora para cada acción
export const LIMITES = {
  pedido: 20, // pedidos (carrito o propuesta) creados
  confirmar: 60, // revisiones de pago al regresar de Mercado Pago
  mensualidad: 10, // ligas de pago de mensualidad
  envio: 60, // marcar enviado / entregado
  ia: 30, // asistente de IA
} as const;
export const HORA = 3600_000;
