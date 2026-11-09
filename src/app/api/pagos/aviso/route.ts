// POST /api/pagos/aviso — Mercado Pago avisa aquí cuando cambia un pago (solo con la página publicada).
// No se confía en el contenido del aviso: se usa solo el número de pago para consultarlo en Mercado Pago.
import { confirmarPago } from "@/lib/servidor/cobros";

export async function POST(peticion: Request) {
  const url = new URL(peticion.url);
  const cuerpo = await peticion.json().catch(() => ({}));
  const tipo = cuerpo?.type ?? url.searchParams.get("type") ?? url.searchParams.get("topic");
  const id = cuerpo?.data?.id ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");

  if (tipo === "payment" && id) {
    try {
      await confirmarPago(String(id));
    } catch (e) {
      console.error("[XICO] Aviso de pago no procesado:", id, e);
    }
  }
  // Siempre 200 para que Mercado Pago no repita el aviso sin fin
  return new Response("ok");
}
