// POST /api/resenas — escribir o cambiar una reseña (solo quien compró). Con { borrar: id } la borra.
import { respuestaError, usuarioDePeticion } from "@/lib/servidor/admin";
import { HORA, LIMITES, limitar } from "@/lib/servidor/limite";
import { borrarResena, guardarResena, responderResena } from "@/lib/servidor/resenas";

export async function POST(peticion: Request) {
  try {
    const usuario = await usuarioDePeticion(peticion);
    await limitar(usuario.uid, "resena", LIMITES.resena, HORA);
    const cuerpo = await peticion.json().catch(() => ({}));
    if (cuerpo?.responder) return Response.json(await responderResena(usuario, String(cuerpo.responder), cuerpo.texto));
    if (cuerpo?.borrar) return Response.json(await borrarResena(usuario, String(cuerpo.borrar)));
    return Response.json(await guardarResena(usuario, cuerpo ?? {}));
  } catch (e) {
    return respuestaError(e);
  }
}
