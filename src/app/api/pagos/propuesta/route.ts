// POST /api/pagos/propuesta — el comprador acepta una propuesta del chat y paga por Mercado Pago
import { respuestaError, usuarioDePeticion } from "@/lib/servidor/admin";
import { crearPedidoPropuesta } from "@/lib/servidor/cobros";
import { HORA, LIMITES, limitar } from "@/lib/servidor/limite";

export async function POST(peticion: Request) {
  try {
    const usuario = await usuarioDePeticion(peticion);
    await limitar(usuario.uid, "pedido", LIMITES.pedido, HORA);
    const { propuestaId, direccion } = await peticion.json();
    return Response.json(await crearPedidoPropuesta(usuario, String(propuestaId ?? ""), direccion));
  } catch (e) {
    return respuestaError(e);
  }
}
