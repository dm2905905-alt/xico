// POST /api/admin/envia — administración de Envia:
//   { accion: "estado" }              → ¿está configurado y en qué modo?
//   { accion: "guias", pedidoId }      → reintentar las guías que fallaron (por ejemplo, por falta de saldo)
//   { accion: "rastreo" }              → registrar en Envia la dirección de avisos de rastreo
import { exigirAdmin, ErrorXico, respuestaError } from "@/lib/servidor/admin";
import { enviaConfigurado, enviaModo, registrarAvisoRastreo } from "@/lib/servidor/envia";
import { generarGuiasDePedido } from "@/lib/servidor/guias";
import { urlSitio } from "@/lib/sitio";

export async function POST(peticion: Request) {
  try {
    await exigirAdmin(peticion);
    const { accion, pedidoId } = await peticion.json().catch(() => ({}));
    if (accion === "estado") return Response.json({ configurado: enviaConfigurado(), modo: enviaModo() });
    if (accion === "guias") return Response.json({ resultados: await generarGuiasDePedido(String(pedidoId)) });
    if (accion === "rastreo") {
      await registrarAvisoRastreo(`${urlSitio()}/api/envios/rastreo`);
      return Response.json({ ok: true });
    }
    throw new ErrorXico("Acción no válida.");
  } catch (e) {
    return respuestaError(e);
  }
}
