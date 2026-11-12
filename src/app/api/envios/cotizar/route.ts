// POST /api/envios/cotizar — costo real del envío con Envia, por tienda, al código postal del comprador.
// Cuerpo: { cp: "58000", articulos: [{ slug, cantidad }] }
import type { Propuesta } from "@/lib/chat";
import type { Producto } from "@/lib/datos";
import type { DatosPrivados } from "@/lib/panel";
import { adminDb, esAdmin, ErrorXico, respuestaError, usuarioDePeticion } from "@/lib/servidor/admin";
import { cotizar, enviaModo, juntarPaquetes, type OpcionEnvio } from "@/lib/servidor/envia";
import { HORA, limitar } from "@/lib/servidor/limite";

export async function POST(peticion: Request) {
  try {
    const usuario = await usuarioDePeticion(peticion);
    await limitar(usuario.uid, "cotizar", 120, HORA);
    const { cp, articulos, propuesta } = await peticion.json().catch(() => ({}));
    if (!/^\d{5}$/.test(String(cp ?? ""))) throw new ErrorXico("Escribe un código postal de 5 números.");
    const db = adminDb();
    // Propuesta del chat: una pieza, caja estándar
    if (propuesta) {
      const p = (await db.collection("propuestas").doc(String(propuesta)).get()).data() as Propuesta | undefined;
      if (!p || p.compradorUid !== usuario.uid) throw new ErrorXico("Propuesta no encontrada.", 404);
      const origen = (await db.collection("tiendasPrivado").doc(p.creador).get()).data() as DatosPrivados | undefined;
      if (!origen?.direccion?.cp) return Response.json({ modo: enviaModo(), tiendas: [{ creador: p.creador, opciones: [], error: "La tienda aún no registró su dirección de envío." }] });
      const destino = { nombre: "Cliente", telefono: "0000000000", calle: "Conocida", numero: "1", colonia: "", cp: String(cp), ciudad: "" };
      const { opciones } = await cotizar({ nombre: "", telefono: "", calle: "", numero: "", colonia: "", ciudad: "", estado: "", ...origen.direccion, cp: origen.direccion.cp }, destino, juntarPaquetes([{ cantidad: 1 }]), p.precio);
      return Response.json({ modo: enviaModo(), tiendas: [{ creador: p.creador, opciones: opciones.slice(0, 6) }] });
    }
    if (!Array.isArray(articulos) || !articulos.length || articulos.length > 50) throw new ErrorXico("No hay productos para cotizar.");

    const docs = await db.getAll(...articulos.map((a: { slug: unknown }) => db.collection("productos").doc(String(a.slug))));
    const porTienda = new Map<string, { paquete?: Producto["paquete"]; cantidad: number; precio: number }[]>();
    docs.forEach((d, i) => {
      if (!d.exists) return;
      const p = d.data() as Producto;
      const cantidad = Math.min(20, Math.max(1, Math.floor(Number(articulos[i].cantidad) || 1)));
      porTienda.set(p.creador, [...(porTienda.get(p.creador) ?? []), { paquete: p.paquete, cantidad, precio: p.precio * cantidad }]);
    });

    const destino = { nombre: "Cliente", telefono: "0000000000", calle: "Conocida", numero: "1", colonia: "", cp: String(cp), ciudad: "" };
    const resultado: { creador: string; opciones: OpcionEnvio[]; error?: string }[] = [];
    const diagnostico: string[] = [];
    for (const [creador, piezas] of porTienda) {
      const privado = (await db.collection("tiendasPrivado").doc(creador).get()).data() as DatosPrivados | undefined;
      if (!privado?.direccion?.cp) {
        resultado.push({ creador, opciones: [], error: "La tienda aún no registró su dirección de envío." });
        continue;
      }
      try {
        const valor = piezas.reduce((s, x) => s + x.precio, 0);
        const { opciones, errores } = await cotizar({ nombre: "", telefono: "", calle: "", numero: "", colonia: "", ciudad: "", estado: "", ...privado.direccion, cp: privado.direccion.cp }, destino, juntarPaquetes(piezas), valor);
        resultado.push({ creador, opciones: opciones.slice(0, 6) });
        diagnostico.push(...errores);
      } catch (e) {
        resultado.push({ creador, opciones: [], error: (e as Error).message });
      }
    }
    return Response.json({ modo: enviaModo(), tiendas: resultado, ...(esAdmin(usuario) || enviaModo() === "prueba" ? { diagnostico } : {}) });
  } catch (e) {
    return respuestaError(e);
  }
}
