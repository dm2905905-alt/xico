// Crea avisos para la campanita. Nunca rompe la acción principal: si falla, solo se registra.
import type { Aviso } from "../avisos";
import type { Creador } from "../datos";
import type { Pedido } from "../pedidos";
import { precio } from "../formato";
import { adminDb } from "./admin";

type NuevoAviso = Omit<Aviso, "id" | "fecha" | "leido">;

export async function avisar(avisos: NuevoAviso[]) {
  const lista = avisos.filter((a) => a.uid);
  if (!lista.length) return;
  try {
    const db = adminDb();
    const lote = db.batch();
    const fecha = Date.now();
    for (const a of lista) {
      const ref = db.collection("avisos").doc();
      lote.set(ref, { ...a, id: ref.id, fecha, leido: false } satisfies Aviso);
    }
    await lote.commit();
  } catch (e) {
    console.error("[XICO] No se pudieron crear los avisos:", (e as Error).message);
  }
}

const corto = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

async function duenos(slugs: string[]) {
  const db = adminDb();
  const docs = await Promise.all(slugs.map((s) => db.collection("creadores").doc(s).get()));
  return new Map(docs.filter((d) => d.exists).map((d) => [d.id, (d.data() as Creador).uid ?? ""]));
}

// Pago confirmado: al comprador y a cada tienda del pedido
export async function avisarPago(pedidoId: string) {
  try {
    const pedido = (await adminDb().collection("pedidos").doc(pedidoId).get()).data() as Pedido | undefined;
    if (!pedido) return;
    const uids = await duenos(pedido.grupos.map((g) => g.creador));
    await avisar([
      { uid: pedido.uid, tipo: "pago", titulo: "Pago confirmado", texto: `Tu pedido ${corto(pedido.id)} ya está pagado. La tienda lo está preparando.`, enlace: `/pedido/${pedido.id}` },
      ...pedido.grupos.map((g) => ({
        uid: uids.get(g.creador) ?? "",
        tipo: "venta" as const,
        titulo: "¡Vendiste! 🎉",
        texto: `${g.articulos.map((a) => a.nombre).join(", ").slice(0, 120)} · ${precio(g.subtotal)}. Prepáralo y márcalo como enviado.`,
        enlace: "/panel",
      })),
    ]);
  } catch (e) {
    console.error("[XICO] Aviso de pago:", (e as Error).message);
  }
}

// Paquete enviado (al comprador) o entregado (a la tienda)
export async function avisarEnvio(pedido: Pick<Pedido, "id" | "uid">, creador: string, taller: string, accion: "enviar" | "entregar") {
  if (accion === "enviar") {
    await avisar([{ uid: pedido.uid, tipo: "envio", titulo: "Tu pedido va en camino 🚚", texto: `${taller} envió tu paquete del pedido ${corto(pedido.id)}.`, enlace: `/pedido/${pedido.id}` }]);
  } else {
    const uid = (await duenos([creador])).get(creador) ?? "";
    await avisar([{ uid, tipo: "entrega", titulo: "Paquete entregado", texto: `El pedido ${corto(pedido.id)} ya se entregó. Entrará en tu próximo pago semanal.`, enlace: "/panel" }]);
  }
}
