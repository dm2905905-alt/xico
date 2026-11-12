// POST /api/pedidos/envio — marcar un paquete como enviado (tienda) o entregado (comprador o tienda)
import { respuestaError, usuarioDePeticion } from "@/lib/servidor/admin";
import { actualizarEnvio } from "@/lib/servidor/envios";
import { HORA, LIMITES, limitar } from "@/lib/servidor/limite";

export async function POST(peticion: Request) {
  try {
    const usuario = await usuarioDePeticion(peticion);
    await limitar(usuario.uid, "envio", LIMITES.envio, HORA);
    const { pedidoId, creador, accion, paqueteria, guia } = await peticion.json();
    const cambio = accion === "enviar" ? { accion, paqueteria: String(paqueteria ?? ""), guia: String(guia ?? "") } : { accion: "entregar" as const };
    const resultado = await actualizarEnvio(usuario, String(pedidoId), String(creador), cambio);
    return Response.json(resultado);
  } catch (e) {
    return respuestaError(e);
  }
}
