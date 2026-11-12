// POST /api/pagos/confirmar — al regresar de Mercado Pago, el comprador pide revisar su pago.
// El servidor consulta el pago directo en Mercado Pago antes de marcar nada.
import { ErrorXico, adminDb, respuestaError, usuarioDePeticion } from "@/lib/servidor/admin";
import { confirmarPago, verificarPedido } from "@/lib/servidor/cobros";
import type { Pedido } from "@/lib/pedidos";
import { HORA, LIMITES, limitar } from "@/lib/servidor/limite";

export async function POST(peticion: Request) {
  try {
    const usuario = await usuarioDePeticion(peticion);
    await limitar(usuario.uid, "confirmar", LIMITES.confirmar, HORA);
    const { pedidoId, pagoId } = await peticion.json();
    const snap = await adminDb().collection("pedidos").doc(String(pedidoId)).get();
    if (!snap.exists || (snap.data() as Pedido).uid !== usuario.uid) throw new ErrorXico("Pedido no encontrado.", 404);
    const pedido = snap.data() as Pedido;
    if (pedido.estado !== "pendiente_pago" && pedido.estado !== "rechazado") return Response.json({ estado: pedido.estado });
    // Con número de pago se consulta ese; sin él, se buscan los pagos del pedido
    const estado = pagoId ? await confirmarPago(String(pagoId), String(pedidoId)) : await verificarPedido(String(pedidoId));
    return Response.json({ estado: estado ?? pedido.estado });
  } catch (e) {
    return respuestaError(e);
  }
}
