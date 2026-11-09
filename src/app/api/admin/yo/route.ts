// POST /api/admin/yo — dice si la persona con sesión es administradora
import { esAdmin, respuestaError, usuarioDePeticion } from "@/lib/servidor/admin";

export async function POST(peticion: Request) {
  try {
    const usuario = await usuarioDePeticion(peticion);
    return Response.json({ admin: esAdmin(usuario) });
  } catch (e) {
    return respuestaError(e);
  }
}
