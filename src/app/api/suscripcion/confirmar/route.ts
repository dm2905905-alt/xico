// POST /api/suscripcion/confirmar — al regresar de Mercado Pago, revisa el pago de la mensualidad
import { respuestaError, usuarioDePeticion } from "@/lib/servidor/admin";
import { verificarPagoSuscripcion } from "@/lib/servidor/suscripcion";
import { HORA, LIMITES, limitar } from "@/lib/servidor/limite";

export async function POST(peticion: Request) {
  try {
    const usuario = await usuarioDePeticion(peticion);
    await limitar(usuario.uid, "confirmar", LIMITES.confirmar, HORA);
    const { id, pagoId } = await peticion.json();
    const estado = await verificarPagoSuscripcion(usuario, String(id), pagoId ? String(pagoId) : undefined);
    return Response.json({ estado });
  } catch (e) {
    return respuestaError(e);
  }
}
