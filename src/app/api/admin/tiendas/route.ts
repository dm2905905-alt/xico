// POST /api/admin/tiendas — la administración crea una tienda para alguien y obtiene su liga de invitación
import { exigirAdmin, respuestaError } from "@/lib/servidor/admin";
import { crearInvitacion } from "@/lib/servidor/invitaciones";

export async function POST(peticion: Request) {
  try {
    await exigirAdmin(peticion);
    return Response.json(await crearInvitacion(await peticion.json().catch(() => ({}))));
  } catch (e) {
    return respuestaError(e);
  }
}
