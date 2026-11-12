// POST /api/envios/guia — la tienda pide de nuevo su guía si no se pudo generar al pagar
import type { Creador } from "@/lib/datos";
import type { Pedido } from "@/lib/pedidos";
import { adminDb, ErrorXico, respuestaError, usuarioDePeticion } from "@/lib/servidor/admin";
import { generarGuiasDePedido } from "@/lib/servidor/guias";
import { HORA, limitar } from "@/lib/servidor/limite";

export async function POST(peticion: Request) {
  try {
    const usuario = await usuarioDePeticion(peticion);
    await limitar(usuario.uid, "guia", 10, HORA);
    const { pedidoId, creador } = await peticion.json().catch(() => ({}));
    const db = adminDb();
    const pedido = (await db.collection("pedidos").doc(String(pedidoId)).get()).data() as Pedido | undefined;
    const tienda = (await db.collection("creadores").doc(String(creador)).get()).data() as Creador | undefined;
    if (!pedido || !tienda?.uid || tienda.uid !== usuario.uid || !pedido.creadores.includes(String(creador))) throw new ErrorXico("Pedido no encontrado.", 404);
    const [resultado] = await generarGuiasDePedido(pedido.id, String(creador));
    if (resultado && !resultado.ok) throw new ErrorXico(`No se pudo generar la guía: ${resultado.mensaje}`, 502);
    return Response.json({ ok: true });
  } catch (e) {
    return respuestaError(e);
  }
}
