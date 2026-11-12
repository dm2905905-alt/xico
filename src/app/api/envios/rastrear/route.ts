// POST /api/envios/rastrear — al abrir un pedido, el comprador o la tienda actualizan su rastreo
import type { Pedido } from "@/lib/pedidos";
import { adminDb, ErrorXico, respuestaError, usuarioDePeticion } from "@/lib/servidor/admin";
import { actualizarRastreo } from "@/lib/servidor/guias";
import { HORA, limitar } from "@/lib/servidor/limite";

export async function POST(peticion: Request) {
  try {
    const usuario = await usuarioDePeticion(peticion);
    await limitar(usuario.uid, "rastrear", 60, HORA);
    const { pedidoId } = await peticion.json().catch(() => ({}));
    const pedido = (await adminDb().collection("pedidos").doc(String(pedidoId)).get()).data() as Pedido | undefined;
    if (!pedido || !pedido.participantes.includes(usuario.uid)) throw new ErrorXico("Pedido no encontrado.", 404);
    return Response.json({ estado: await actualizarRastreo(pedido.id) });
  } catch (e) {
    return respuestaError(e);
  }
}
