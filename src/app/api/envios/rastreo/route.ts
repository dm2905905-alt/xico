// POST /api/envios/rastreo — Envia avisa aquí cada cambio de rastreo.
// No se confía en el contenido: con el número de guía se vuelve a consultar el rastreo en Envia.
import { rastreoPorGuia } from "@/lib/servidor/guias";

export async function POST(peticion: Request) {
  const cuerpo = await peticion.json().catch(() => ({}));
  const guia = String(cuerpo?.data?.tracking_number ?? cuerpo?.data?.trackingNumber ?? cuerpo?.tracking_number ?? "");
  if (guia) {
    try {
      await rastreoPorGuia(guia);
    } catch (e) {
      console.error("[XICO] Aviso de rastreo no procesado:", guia, (e as Error).message);
    }
  }
  return new Response("ok");
}
