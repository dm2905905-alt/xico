// POST /api/tiendas/reclamar — el dueño acepta la tienda que la administración le preparó
import { respuestaError, usuarioDePeticion } from "@/lib/servidor/admin";
import { aceptarInvitacion } from "@/lib/servidor/invitaciones";
import { HORA, limitar } from "@/lib/servidor/limite";

export async function POST(peticion: Request) {
  try {
    const usuario = await usuarioDePeticion(peticion);
    await limitar(usuario.uid, "reclamar", 10, HORA);
    const { codigo } = await peticion.json().catch(() => ({}));
    return Response.json(await aceptarInvitacion(usuario, codigo));
  } catch (e) {
    return respuestaError(e);
  }
}
