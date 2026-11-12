// POST /api/pagos/crear — crea el pedido y devuelve la liga de pago de Mercado Pago
import { respuestaError, usuarioDePeticion } from "@/lib/servidor/admin";
import { crearPedido } from "@/lib/servidor/cobros";
import { HORA, LIMITES, limitar } from "@/lib/servidor/limite";

export async function POST(peticion: Request) {
  try {
    const usuario = await usuarioDePeticion(peticion);
    await limitar(usuario.uid, "pedido", LIMITES.pedido, HORA);
    const { articulos, direccion, envios } = await peticion.json();
    const resultado = await crearPedido(usuario, articulos, direccion, envios && typeof envios === "object" ? envios : undefined);
    return Response.json(resultado);
  } catch (e) {
    return respuestaError(e);
  }
}
