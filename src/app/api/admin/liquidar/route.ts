// POST /api/admin/liquidar — marca que XICO ya le transfirió al creador su parte de uno o varios pedidos
import type { Pedido } from "@/lib/pedidos";
import { adminDb, ErrorXico, exigirAdmin, respuestaError } from "@/lib/servidor/admin";

export async function POST(peticion: Request) {
  try {
    await exigirAdmin(peticion);
    const { creador, pedidos, deshacer } = await peticion.json();
    if (!creador || !Array.isArray(pedidos) || pedidos.length === 0 || pedidos.length > 200) throw new ErrorXico("Datos incompletos.");

    const db = adminDb();
    let marcados = 0;
    for (const id of pedidos.map(String)) {
      const ref = db.collection("pedidos").doc(id);
      await db.runTransaction(async (tx) => {
        const snap = await tx.get(ref);
        if (!snap.exists) return;
        const p = snap.data() as Pedido;
        if (!["pagado", "enviado", "entregado"].includes(p.estado)) return; // solo pedidos cobrados
        const grupos = p.grupos.map((g) => {
          if (g.creador !== creador) return g;
          marcados++;
          if (deshacer) {
            const resto = { ...g };
            delete resto.liquidado;
            return resto;
          }
          return { ...g, liquidado: g.liquidado ?? Date.now() };
        });
        tx.update(ref, { grupos });
      });
    }
    return Response.json({ marcados });
  } catch (e) {
    return respuestaError(e);
  }
}
