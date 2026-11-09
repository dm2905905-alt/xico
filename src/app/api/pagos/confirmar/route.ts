// POST /api/pagos/confirmar — al regresar de Mercado Pago, el comprador pide revisar su pago.
// El servidor consulta el pago directo en Mercado Pago antes de marcar nada.
import { ErrorXico, adminDb, respuestaError, usuarioDePeticion } from "@/lib/servidor/admin";
import { confirmarPago } from "@/lib/servidor/cobros";
import type { Pedido } from "@/lib/pedidos";

export async function POST(peticion: Request) {
  try {
    const usuario = await usuarioDePeticion(peticion);
    const { pedidoId, pagoId } = await peticion.json();
    const snap = await adminDb().collection("pedidos").doc(String(pedidoId)).get();
    if (!snap.exists || (snap.data() as Pedido).uid !== usuario.uid) throw new ErrorXico("Pedido no encontrado.", 404);
    const estado = await confirmarPago(String(pagoId), String(pedidoId));
    return Response.json({ estado });
  } catch (e) {
    return respuestaError(e);
  }
}
