// Envíos con Envia dentro de un pedido: precio real al pagar, guía automática y rastreo. Solo en el servidor.
import type { Creador, Paquete } from "../datos";
import type { DatosPrivados } from "../panel";
import type { Direccion, EstadoPedido, GrupoPedido, Pedido } from "../pedidos";
import { adminDb, ErrorXico } from "./admin";
import { avisar, avisarEnvio } from "./avisos";
import { bloquearServicio, cotizar, enviaConfigurado, generarGuia, juntarPaquetes, rastrear } from "./envia";

export { enviaConfigurado };
export type EleccionEnvio = { paqueteria: string; servicio: string };

// Dirección de recolección de la tienda (privada)
async function direccionTienda(creador: string) {
  const privado = (await adminDb().collection("tiendasPrivado").doc(creador).get()).data() as DatosPrivados | undefined;
  const d = privado?.direccion;
  if (!d?.cp) return null;
  return { nombre: "", telefono: "", calle: "", numero: "", colonia: "", ciudad: "", estado: "", ...d, cp: d.cp } as Direccion;
}

// Precio real del envío de un paquete. Se vuelve a cotizar en el servidor: nunca se confía en el precio del navegador.
export async function envioReal(creador: string, taller: string, piezas: { paquete?: Paquete; cantidad: number }[], valor: number, destino: Direccion, eleccion?: EleccionEnvio) {
  const origen = await direccionTienda(creador);
  if (!origen) throw new ErrorXico(`"${taller}" todavía no registró su dirección de envío. Quita sus productos o inténtalo más tarde.`);
  const paquete = juntarPaquetes(piezas);
  const { opciones } = await cotizar(origen, destino, paquete, valor);
  const elegida = (eleccion && opciones.find((o) => o.paqueteria === eleccion.paqueteria && o.servicio === eleccion.servicio)) ?? opciones[0];
  const costo = Math.ceil(elegida.precio); // pesos completos
  return {
    envio: costo,
    paquete,
    envia: { paqueteria: elegida.paqueteria, servicio: elegida.servicio, descripcion: `${elegida.descripcion}${elegida.dias ? ` (${elegida.dias})` : ""}`, costo: elegida.precio },
  };
}

// Nombre de la paquetería de Envia → la lista de XICO (para la liga de rastreo y el formulario)
const PAQUETERIAS: Record<string, string> = { estafeta: "estafeta", dhl: "dhl", fedex: "fedex", paquetexpress: "paquetexpress", redpack: "redpack", jtexpress: "jt" };
export const paqueteriaXico = (carrier: string) => PAQUETERIAS[carrier] ?? "otra";

// Compra las guías de un pedido recién pagado (una por tienda). Si alguna falla, queda marcada para reintentar.
export async function generarGuiasDePedido(pedidoId: string, soloCreador?: string) {
  const db = adminDb();
  const ref = db.collection("pedidos").doc(pedidoId);
  const pedido = (await ref.get()).data() as Pedido | undefined;
  if (!pedido || !["pagado", "enviado", "entregado"].includes(pedido.estado)) return [];
  const resultados: { creador: string; ok: boolean; mensaje?: string }[] = [];
  for (const g of pedido.grupos) {
    if (!g.envia || g.guia || (soloCreador && g.creador !== soloCreador)) continue;
    let cambio: Partial<GrupoPedido>;
    try {
      const origen = await direccionTienda(g.creador);
      if (!origen) throw new ErrorXico("La tienda no tiene dirección de envío registrada.");
      const tienda = (await db.collection("creadores").doc(g.creador).get()).data() as Creador | undefined;
      const o = { ...origen, nombre: origen.nombre || tienda?.taller || g.taller };
      const d = { ...pedido.direccion, correo: pedido.email || undefined };
      const paquete = g.paquete ?? juntarPaquetes([{ cantidad: 1 }]);
      const contenido = g.articulos.map((a) => a.nombre).join(", ");
      let envia = g.envia;
      let nueva;
      try {
        nueva = await generarGuia(o, d, paquete, g.subtotal, envia.paqueteria, envia.servicio, contenido);
      } catch (e) {
        // Servicio que solo se puede cotizar: se deja de ofrecer y se usa la siguiente opción más barata.
        // La diferencia de precio (si la hay) la absorbe XICO; queda anotada en el pedido.
        if (!/QUOTE_ONLY|branch code/i.test((e as Error).message)) throw e;
        await bloquearServicio(envia.paqueteria, envia.servicio);
        const { opciones } = await cotizar(o, d, paquete, g.subtotal);
        let ultimo = e;
        for (const otra of opciones.filter((x) => !(x.paqueteria === envia!.paqueteria && x.servicio === envia!.servicio)).slice(0, 4)) {
          try {
            nueva = await generarGuia(o, d, paquete, g.subtotal, otra.paqueteria, otra.servicio, contenido);
            envia = { paqueteria: otra.paqueteria, servicio: otra.servicio, descripcion: `${otra.descripcion}${otra.dias ? ` (${otra.dias})` : ""}`, costo: otra.precio, cobrado: g.envio };
            break;
          } catch (e2) {
            ultimo = e2;
            if (/QUOTE_ONLY|branch code/i.test((e2 as Error).message)) await bloquearServicio(otra.paqueteria, otra.servicio);
            else break;
          }
        }
        if (!nueva) throw ultimo;
      }
      cambio = { guia: nueva.guia, etiqueta: nueva.etiqueta, rastreoUrl: nueva.rastreoUrl, paqueteria: paqueteriaXico(envia.paqueteria), guiaError: "", envia };
      resultados.push({ creador: g.creador, ok: true });
      if (tienda?.uid) {
        await avisar([{ uid: tienda.uid, tipo: "venta", titulo: "Tu guía está lista 📦", texto: `Imprime la guía del pedido #${pedido.id.slice(0, 8).toUpperCase()} y lleva el paquete a ${g.envia.descripcion.split(" · ")[0]}.`, enlace: `/pedido/${pedido.id}` }]);
      }
    } catch (e) {
      cambio = { guiaError: (e as Error).message.slice(0, 200) };
      resultados.push({ creador: g.creador, ok: false, mensaje: (e as Error).message });
      console.error("[XICO] No se pudo generar la guía", pedido.id, g.creador, (e as Error).message);
    }
    // Se guarda solo el paquete de esta tienda, sobre la versión más reciente del pedido
    await db.runTransaction(async (tx) => {
      const actual = (await tx.get(ref)).data() as Pedido;
      const grupos = actual.grupos.map((x) => (x.creador === g.creador ? { ...x, ...cambio } : x));
      const guias = [...new Set([...(actual.guias ?? []), ...(cambio.guia ? [cambio.guia] : [])])];
      tx.update(ref, { grupos, guias });
    });
  }
  return resultados;
}

// Estados de Envia → estado del paquete en XICO
const ENTREGADO = /^(delivered|partially delivered)$/i;
const EN_CAMINO = /^(shipped|picked up|out for delivery|in transit|delivery attempt|[123] delivery attempts?|delayed|redirected|pickup at office|partially shipped|information)$/i;

function estadoGeneral(grupos: GrupoPedido[], actual: EstadoPedido): EstadoPedido {
  const estados = grupos.map((g) => g.envioEstado ?? "preparando");
  if (estados.every((e) => e === "entregado")) return "entregado";
  if (estados.some((e) => e !== "preparando")) return "enviado";
  return actual;
}

// Consulta en Envia el rastreo de las guías de un pedido y actualiza los paquetes
export async function actualizarRastreo(pedidoId: string) {
  const db = adminDb();
  const ref = db.collection("pedidos").doc(pedidoId);
  const pedido = (await ref.get()).data() as Pedido | undefined;
  if (!pedido) return null;
  const pendientes = pedido.grupos.filter((g) => g.envia && g.guia && g.envioEstado !== "entregado").map((g) => g.guia!);
  if (!pendientes.length) return pedido.estado;
  const estados = await rastrear(pendientes);
  const cambios: { grupo: GrupoPedido; antes?: string }[] = [];
  const ahora = Date.now();
  const grupos = pedido.grupos.map((g) => {
    const e = g.guia ? estados.get(g.guia) : undefined;
    if (!e || g.envioEstado === "entregado") return g;
    let nuevo: GrupoPedido = { ...g, rastreoEstado: e };
    if (ENTREGADO.test(e)) nuevo = { ...nuevo, envioEstado: "entregado", entregadoEn: ahora, enviadoEn: g.enviadoEn ?? ahora };
    else if (EN_CAMINO.test(e) && (g.envioEstado ?? "preparando") === "preparando") nuevo = { ...nuevo, envioEstado: "enviado", enviadoEn: ahora };
    if (nuevo.envioEstado !== g.envioEstado) cambios.push({ grupo: nuevo, antes: g.envioEstado });
    return nuevo;
  });
  const estado = estadoGeneral(grupos, pedido.estado);
  await ref.update({ grupos, estado });
  for (const c of cambios) await avisarEnvio(pedido, c.grupo.creador, c.grupo.taller, c.grupo.envioEstado === "entregado" ? "entregar" : "enviar");
  return estado;
}

// Aviso de Envia: se busca el pedido por su número de guía y se vuelve a consultar (no se confía en el aviso)
export async function rastreoPorGuia(guia: string) {
  if (!/^[A-Za-z0-9-]{4,60}$/.test(guia)) return null;
  const s = await adminDb().collection("pedidos").where("guias", "array-contains", guia).limit(1).get();
  return s.empty ? null : actualizarRastreo(s.docs[0].id);
}
