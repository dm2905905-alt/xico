// POST /api/ia/producto — la IA propone título, descripción, materiales, categoría y precio
// Solo para creadores con tienda (evita que cualquiera use la IA a costa de XICO).
import type { Creador } from "@/lib/datos";
import { adminDb, ErrorXico, respuestaError, usuarioDePeticion } from "@/lib/servidor/admin";
import { proponerProducto } from "@/lib/servidor/ia";
import { HORA, LIMITES, limitar } from "@/lib/servidor/limite";

export async function POST(peticion: Request) {
  try {
    const usuario = await usuarioDePeticion(peticion);

    const tiendas = await adminDb().collection("creadores").where("uid", "==", usuario.uid).limit(1).get();
    if (tiendas.empty) throw new ErrorXico("Primero abre tu tienda para usar el asistente.", 403);
    const tienda = tiendas.docs[0].data() as Creador;

    await limitar(usuario.uid, "ia", LIMITES.ia, HORA, "Usaste mucho el asistente esta hora. Inténtalo más tarde.");

    const { idea } = await peticion.json();
    return Response.json(await proponerProducto(String(idea ?? ""), tienda));
  } catch (e) {
    return respuestaError(e);
  }
}
