// POST /api/admin/limpiar — borra datos de prueba. Primero se pide con "simular: true" para ver qué se borraría.
//   que = "pedidos-sin-pagar": pedidos que nunca se pagaron (más de 1 hora de antigüedad)
//   que = "ejemplo": productos y tiendas de ejemplo (las que no tienen dueño)
import type { Creador, Producto } from "@/lib/datos";
import type { Pedido } from "@/lib/pedidos";
import { adminDb, ErrorXico, exigirAdmin, respuestaError } from "@/lib/servidor/admin";

export async function POST(peticion: Request) {
  try {
    await exigirAdmin(peticion);
    const { que, simular } = await peticion.json();
    const db = adminDb();

    let refs: FirebaseFirestore.DocumentReference[] = [];
    let detalle = "";

    if (que === "pedidos-sin-pagar") {
      const hace1h = Date.now() - 3600_000;
      const snap = await db.collection("pedidos").where("estado", "in", ["pendiente_pago", "rechazado"]).get();
      refs = snap.docs.filter((d) => (d.data() as Pedido).creado < hace1h).map((d) => d.ref);
      detalle = `${refs.length} pedidos sin pagar`;
    } else if (que === "ejemplo") {
      const tiendas = await db.collection("creadores").get();
      const ejemplo = tiendas.docs.filter((d) => !(d.data() as Creador).uid);
      const slugs = new Set(ejemplo.map((d) => d.id));
      const productos = (await db.collection("productos").get()).docs.filter((d) => slugs.has((d.data() as Producto).creador));
      refs = [...productos.map((d) => d.ref), ...ejemplo.map((d) => d.ref)];
      detalle = `${productos.length} productos y ${ejemplo.length} tiendas de ejemplo`;
    } else {
      throw new ErrorXico("¿Qué quieres limpiar?");
    }

    if (simular) return Response.json({ detalle, total: refs.length });

    // Se borra en lotes (Firestore permite hasta 500 operaciones por lote)
    for (let i = 0; i < refs.length; i += 400) {
      const lote = db.batch();
      refs.slice(i, i + 400).forEach((r) => lote.delete(r));
      await lote.commit();
    }
    return Response.json({ detalle, total: refs.length, borrado: true });
  } catch (e) {
    return respuestaError(e);
  }
}
