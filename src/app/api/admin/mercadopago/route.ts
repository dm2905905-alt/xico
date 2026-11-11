// POST /api/admin/mercadopago — a qué cuenta de Mercado Pago está conectada la página (real o de prueba)
import { exigirAdmin, respuestaError } from "@/lib/servidor/admin";

export async function POST(peticion: Request) {
  try {
    await exigirAdmin(peticion);
    const t = process.env.MP_ACCESS_TOKEN;
    if (!t) return Response.json({ conectado: false });
    const r = await fetch("https://api.mercadopago.com/users/me", { headers: { Authorization: `Bearer ${t}` }, cache: "no-store" });
    if (!r.ok) return Response.json({ conectado: false, error: "La clave de Mercado Pago no es válida." });
    const d = await r.json();
    const prueba = Array.isArray(d.tags) && d.tags.includes("test_user");
    return Response.json({ conectado: true, prueba, cuenta: d.nickname ?? "", correo: prueba ? "" : (d.email ?? "") });
  } catch (e) {
    return respuestaError(e);
  }
}
