// POST /api/suscripcion/pagar — la tienda paga su mensualidad con Mercado Pago
import { respuestaError, usuarioDePeticion } from "@/lib/servidor/admin";
import { crearPagoSuscripcion } from "@/lib/servidor/suscripcion";
import { HORA, LIMITES, limitar } from "@/lib/servidor/limite";

export async function POST(peticion: Request) {
  try {
    const usuario = await usuarioDePeticion(peticion);
    await limitar(usuario.uid, "mensualidad", LIMITES.mensualidad, HORA);
    const { meses } = await peticion.json().catch(() => ({}));
    return Response.json(await crearPagoSuscripcion(usuario, meses));
  } catch (e) {
    return respuestaError(e);
  }
}
