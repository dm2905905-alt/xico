// Cobro de la mensualidad de las tiendas con Mercado Pago. Solo en el servidor.
import type { UsuarioVerificado } from "./admin";
import type { Creador } from "../datos";
import { urlSitio } from "../sitio";
import { MENSUALIDAD, estadoSuscripcion, nuevoPagadoHasta, type PagoSuscripcion } from "../suscripcion";
import { adminDb, ErrorXico } from "./admin";
import { buscarPagosDePedido, crearPreferencia, obtenerPago, type PagoMP } from "./mercadopago";

async function tiendaDe(uid: string) {
  const s = await adminDb().collection("creadores").where("uid", "==", uid).limit(1).get();
  if (s.empty) throw new ErrorXico("No tienes una tienda en XICO.", 404);
  return s.docs[0].data() as Creador;
}

// Crea el pago pendiente y la liga de Mercado Pago
export async function crearPagoSuscripcion(usuario: UsuarioVerificado, mesesPedidos: unknown) {
  const meses = [1, 3, 6].includes(Number(mesesPedidos)) ? Number(mesesPedidos) : 1;
  const tienda = await tiendaDe(usuario.uid);
  const db = adminDb();
  const ref = db.collection("pagosSuscripcion").doc();
  const pago: PagoSuscripcion = {
    id: ref.id,
    creador: tienda.slug,
    uid: usuario.uid,
    taller: tienda.taller,
    meses,
    monto: MENSUALIDAD * meses,
    estado: "pendiente",
    metodo: "mercadopago",
    creado: Date.now(),
  };
  await ref.set(pago);

  const url = `${urlSitio()}/panel/suscripcion?pago=${ref.id}`;
  const publico = url.startsWith("https://");
  const preferencia = await crearPreferencia(
    {
      items: [
        {
          id: "mensualidad",
          title: `Mensualidad XICO · ${meses} ${meses === 1 ? "mes" : "meses"}`,
          description: `Tienda ${tienda.taller}`,
          quantity: 1,
          unit_price: pago.monto,
          currency_id: "MXN",
        },
      ],
      external_reference: `sus_${ref.id}`,
      back_urls: { success: url, failure: url, pending: url },
      ...(publico ? { auto_return: "approved", notification_url: `${urlSitio()}/api/pagos/aviso` } : {}),
      statement_descriptor: "XICO",
    },
    `sus_${ref.id}`,
  );
  await ref.update({ "mp.preferencia": preferencia.id });
  return { pagoId: ref.id, url: preferencia.init_point };
}

// Consulta el pago en Mercado Pago y, si se aprobó, extiende la mensualidad (una sola vez)
export async function confirmarPagoSuscripcion(pago: PagoMP) {
  const id = String(pago.external_reference).slice(4);
  const db = adminDb();
  const ref = db.collection("pagosSuscripcion").doc(id);
  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ErrorXico("Pago de mensualidad no encontrado.", 404);
    const p = snap.data() as PagoSuscripcion;
    const base = { "mp.pago": String(pago.id), "mp.estadoPago": `${pago.status}/${pago.status_detail}` };
    if (p.estado === "pagado") return "pagado";

    if (pago.status === "approved") {
      if (pago.currency_id !== "MXN" || Math.abs(pago.transaction_amount - p.monto) > 0.5) {
        tx.update(ref, { ...base, estado: "rechazado" });
        return "rechazado";
      }
      const refTienda = db.collection("creadores").doc(p.creador);
      const tienda = (await tx.get(refTienda)).data() as Creador | undefined;
      const ahora = Date.now();
      tx.update(ref, { ...base, estado: "pagado", pagado: ahora });
      if (tienda) {
        tx.update(refTienda, {
          suscripcion: {
            ...tienda.suscripcion,
            inicio: tienda.suscripcion?.inicio ?? tienda.solicitada ?? ahora,
            pagadoHasta: nuevoPagadoHasta(tienda, p.meses, ahora),
          },
        });
      }
      return "pagado";
    }
    if (["rejected", "cancelled"].includes(pago.status)) {
      tx.update(ref, { ...base, estado: "rechazado" });
      return "rechazado";
    }
    tx.update(ref, base);
    return p.estado;
  });
}

// Al regresar de Mercado Pago: revisa el pago (con su número o buscándolo por la referencia)
export async function verificarPagoSuscripcion(usuario: UsuarioVerificado, id: string, pagoId?: string) {
  const snap = await adminDb().collection("pagosSuscripcion").doc(id).get();
  if (!snap.exists || (snap.data() as PagoSuscripcion).uid !== usuario.uid) throw new ErrorXico("Pago no encontrado.", 404);
  if (pagoId && /^\d+$/.test(pagoId)) {
    const pago = await obtenerPago(pagoId);
    if (pago.external_reference !== `sus_${id}`) throw new ErrorXico("El pago no corresponde.");
    return confirmarPagoSuscripcion(pago);
  }
  const pagos = await buscarPagosDePedido(`sus_${id}`);
  const elegido = pagos.find((p) => p.status === "approved") ?? pagos[0];
  return elegido ? confirmarPagoSuscripcion(elegido) : (snap.data() as PagoSuscripcion).estado;
}

export { estadoSuscripcion };
