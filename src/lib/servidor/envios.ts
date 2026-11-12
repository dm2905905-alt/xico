// Cambios de envío de un pedido. Solo en el servidor.
// - "enviar": solo el dueño de la tienda de ese paquete (puede corregir la guía después).
// - "entregar": el comprador o el dueño de la tienda.
import type { UsuarioVerificado } from "./admin";
import { avisarEnvio } from "./avisos";
import type { Creador } from "../datos";
import { paqueteriaPorId } from "../envios";
import type { EstadoPedido, GrupoPedido, Pedido } from "../pedidos";
import { adminDb, ErrorXico } from "./admin";

export type AccionEnvio = { accion: "enviar"; paqueteria: string; guia: string } | { accion: "entregar" };

// El estado general del pedido sale de sus paquetes
function estadoGeneral(grupos: GrupoPedido[], actual: EstadoPedido): EstadoPedido {
  const estados = grupos.map((g) => g.envioEstado ?? "preparando");
  if (estados.every((e) => e === "entregado")) return "entregado";
  if (estados.every((e) => e !== "preparando")) return "enviado";
  return actual === "enviado" || actual === "entregado" ? "pagado" : actual;
}

export async function actualizarEnvio(usuario: UsuarioVerificado, pedidoId: string, creadorSlug: string, cambio: AccionEnvio) {
  const db = adminDb();
  const ref = db.collection("pedidos").doc(String(pedidoId));

  const resultado = await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ErrorXico("Pedido no encontrado.", 404);
    const pedido = snap.data() as Pedido;
    if (!["pagado", "enviado", "entregado"].includes(pedido.estado)) {
      throw new ErrorXico("Este pedido todavía no está pagado.");
    }

    const i = pedido.grupos.findIndex((g) => g.creador === creadorSlug);
    if (i < 0) throw new ErrorXico("Este paquete no existe en el pedido.", 404);

    const tienda = (await tx.get(db.collection("creadores").doc(creadorSlug))).data() as Creador | undefined;
    const esDueno = !!tienda?.uid && tienda.uid === usuario.uid;
    const esComprador = pedido.uid === usuario.uid;

    const grupo = { ...pedido.grupos[i] };
    if (cambio.accion === "enviar") {
      if (!esDueno) throw new ErrorXico("Solo la tienda que vende este paquete puede marcarlo como enviado.", 403);
      if (grupo.envioEstado === "entregado") throw new ErrorXico("Este paquete ya se entregó.");
      if (!paqueteriaPorId(cambio.paqueteria)) throw new ErrorXico("Elige una paquetería.");
      const guia = String(cambio.guia ?? "").trim().slice(0, 40);
      const sinGuia = cambio.paqueteria === "local";
      if (!sinGuia && guia.length < 4) throw new ErrorXico("Escribe el número de guía.");
      Object.assign(grupo, {
        envioEstado: "enviado",
        paqueteria: cambio.paqueteria,
        guia: sinGuia ? "" : guia,
        enviadoEn: grupo.enviadoEn ?? Date.now(),
      });
    } else {
      if (!esComprador && !esDueno) throw new ErrorXico("No puedes cambiar este pedido.", 403);
      if (grupo.envioEstado !== "enviado") throw new ErrorXico("Este paquete aún no se ha enviado.");
      Object.assign(grupo, { envioEstado: "entregado", entregadoEn: Date.now() });
    }

    const grupos = pedido.grupos.map((g, j) => (j === i ? grupo : g));
    const estado = estadoGeneral(grupos, pedido.estado);
    tx.update(ref, { grupos, estado });
    return { estado, grupo, pedido: { id: pedido.id, uid: pedido.uid }, taller: grupo.taller, antes: pedido.grupos[i].envioEstado };
  });
  // Solo la primera vez (corregir la guía no vuelve a avisar)
  if (resultado.antes !== resultado.grupo.envioEstado) await avisarEnvio(resultado.pedido, creadorSlug, resultado.taller, cambio.accion);
  return { estado: resultado.estado, grupo: resultado.grupo };
}
