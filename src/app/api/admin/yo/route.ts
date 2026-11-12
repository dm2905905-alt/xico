// POST /api/admin/yo — dice si la persona con sesión es administradora o moderadora
import { respuestaError, usuarioDePeticion } from "@/lib/servidor/admin";
import { rolDe } from "@/lib/servidor/equipo";

export async function POST(peticion: Request) {
  try {
    const usuario = await usuarioDePeticion(peticion);
    const rol = await rolDe(usuario);
    return Response.json({ admin: rol === "admin", rol });
  } catch (e) {
    return respuestaError(e);
  }
}
