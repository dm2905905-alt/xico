// Crear pedidos y confirmar pagos. Solo en el servidor.
// Regla de oro: nunca se confía en precios que manda el navegador; todo se recalcula aquí.
import { FieldValue } from "firebase-admin/firestore";
import type { UsuarioVerificado } from "./admin";
import type { Propuesta } from "../chat";
import { tiendaActiva, type Creador, type Producto } from "../datos";
import {
  COMISION_XICO,
  problemaDireccion,
  type ArticuloSolicitado,
  type Direccion,
  type GrupoPedido,
  type Pedido,
} from "../pedidos";
import { urlSitio } from "../sitio";
import { adminDb, ErrorXico } from "./admin";
import { buscarPagosDePedido, crearPreferencia, obtenerPago } from "./mercadopago";

// Mismas reglas de envío que muestra el carrito (en la Fase 7 se cotiza con la paquetería)
const ENVIO_POR_CREADOR = 99;
const ENVIO_GRATIS_DESDE = 999;

const sitio = urlSitio;
const recorta = (t: unknown, max: number) => String(t ?? "").trim().slice(0, max);

export async function crearPedido(usuario: UsuarioVerificado, solicitados: ArticuloSolicitado[], direccionCruda: Direccion) {
  if (!Array.isArray(solicitados) || solicitados.length === 0) throw new ErrorXico("Tu carrito está vacío.");
  if (solicitados.length > 50) throw new ErrorXico("Demasiados artículos en un solo pedido.");

  const problema = problemaDireccion(direccionCruda ?? {});
  if (problema) throw new ErrorXico(problema);
  const direccion: Direccion = {
    nombre: recorta(direccionCruda.nombre, 80),
    telefono: recorta(direccionCruda.telefono, 14),
    calle: recorta(direccionCruda.calle, 100),
    numero: recorta(direccionCruda.numero, 20),
    colonia: recorta(direccionCruda.colonia, 80),
    cp: recorta(direccionCruda.cp, 5),
    ciudad: recorta(direccionCruda.ciudad, 80),
    estado: recorta(direccionCruda.estado, 40),
    ...(direccionCruda.referencias ? { referencias: recorta(direccionCruda.referencias, 200) } : {}),
  };

  const db = adminDb();

  // Precios reales desde la base de datos
  const slugs = [...new Set(solicitados.map((a) => String(a.slug)))];
  const docs = await db.getAll(...slugs.map((s) => db.collection("productos").doc(s)));
  const productos = new Map(docs.filter((d) => d.exists).map((d) => [d.id, d.data() as Producto]));

  const grupos = new Map<string, GrupoPedido>();
  for (const a of solicitados) {
    const p = productos.get(String(a.slug));
    if (!p) throw new ErrorXico("Un producto de tu carrito ya no está disponible. Quítalo e inténtalo de nuevo.");
    const cantidad = Math.floor(Number(a.cantidad));
    if (!(cantidad >= 1 && cantidad <= 20)) throw new ErrorXico("Cantidad no válida.");

    // Extras: se toman sus precios del producto, no del navegador
    const ids = Array.isArray(a.extrasIds) ? a.extrasIds.map(String) : [];
    if (!a.extrasIds && Number(a.extras) > 0) {
      throw new ErrorXico(`Vuelve a agregar "${p.nombre}" al carrito para actualizar sus extras.`);
    }
    const extras = (p.personalizacion ?? [])
      .filter((o) => o.tipo === "extra" && ids.includes(o.id))
      .reduce((s, o) => s + (o.tipo === "extra" ? o.precio : 0), 0);
    const precioUnitario = p.precio + extras;

    const opciones = (Array.isArray(a.opciones) ? a.opciones : [])
      .slice(0, 12)
      .map((o) => ({ etiqueta: recorta(o.etiqueta, 60), valor: recorta(o.valor, 120) }));

    const g = grupos.get(p.creador) ?? {
      creador: p.creador,
      taller: p.taller,
      articulos: [],
      subtotal: 0,
      envio: 0,
      comision: 0,
      paraCreador: 0,
    };
    g.articulos.push({
      slug: p.slug,
      nombre: p.nombre,
      cantidad,
      precioUnitario,
      opciones,
      colores: p.colores,
      forma: p.forma,
      categoria: p.categoria,
      ...(p.fotos?.[0]?.mini ? { foto: p.fotos[0].mini } : {}),
    });
    g.subtotal += precioUnitario * cantidad;
    grupos.set(p.creador, g);
  }

  const listaGrupos = [...grupos.values()].map((g) => {
    const envio = g.subtotal >= ENVIO_GRATIS_DESDE ? 0 : ENVIO_POR_CREADOR;
    const comision = Math.round(g.subtotal * COMISION_XICO);
    return { ...g, envio, comision, paraCreador: g.subtotal - comision + envio };
  });
  const totalProductos = listaGrupos.reduce((s, g) => s + g.subtotal, 0);
  const totalEnvio = listaGrupos.reduce((s, g) => s + g.envio, 0);

  // Dueños de las tiendas: podrán ver el pedido para prepararlo
  const creadoresDocs = await db.getAll(...listaGrupos.map((g) => db.collection("creadores").doc(g.creador)));
  // Solo se puede comprar a tiendas aprobadas
  creadoresDocs.forEach((d, i) => {
    const c = d.data() as Creador | undefined;
    if (!c || !tiendaActiva(c)) throw new ErrorXico(`La tienda "${listaGrupos[i].taller}" no está disponible por ahora. Quita sus productos del carrito.`);
  });
  const uidsCreadores = creadoresDocs.map((d) => (d.data() as Creador | undefined)?.uid).filter((u): u is string => !!u);

  const ref = db.collection("pedidos").doc();
  const pedido: Pedido = {
    id: ref.id,
    uid: usuario.uid,
    email: usuario.email ?? "",
    participantes: [...new Set([usuario.uid, ...uidsCreadores])],
    creadores: listaGrupos.map((g) => g.creador),
    grupos: listaGrupos,
    productos: totalProductos,
    envio: totalEnvio,
    total: totalProductos + totalEnvio,
    direccion,
    estado: "pendiente_pago",
    creado: Date.now(),
  };
  await ref.set(pedido);
  return cobrar(ref, listaGrupos, totalEnvio);
}

// Crea el cobro en Mercado Pago para un pedido ya guardado
async function cobrar(ref: FirebaseFirestore.DocumentReference, listaGrupos: GrupoPedido[], totalEnvio: number) {
  const url = `${sitio()}/pedido/${ref.id}`;
  const publico = url.startsWith("https://"); // Mercado Pago solo regresa solo / avisa a direcciones públicas
  const items = listaGrupos.flatMap((g) =>
    g.articulos.map((a) => ({
      id: a.slug,
      title: a.nombre.slice(0, 250),
      description: `Hecho por ${g.taller}`,
      quantity: a.cantidad,
      unit_price: a.precioUnitario,
      currency_id: "MXN",
    })),
  );
  if (totalEnvio > 0) {
    items.push({ id: "envio", title: "Envío", description: `${listaGrupos.length} paquete(s)`, quantity: 1, unit_price: totalEnvio, currency_id: "MXN" });
  }

  const preferencia = await crearPreferencia(
    {
      items,
      // No se manda el correo del comprador: Mercado Pago lo pide en su pantalla. Mandarlo causa
      // el error "una de las partes es de prueba" al mezclar correos reales con cuentas de prueba.
      external_reference: ref.id,
      back_urls: { success: url, failure: url, pending: url },
      ...(publico ? { auto_return: "approved", notification_url: `${sitio()}/api/pagos/aviso` } : {}),
      statement_descriptor: "XICO",
      metadata: { pedido: ref.id },
    },
    ref.id,
  );
  await ref.update({ "mp.preferencia": preferencia.id });

  // Con credenciales de prueba (cuenta vendedora de prueba) la misma liga funciona en modo de pruebas
  return { pedidoId: ref.id, url: preferencia.init_point };
}

// Consulta el pago en Mercado Pago (la única fuente confiable) y actualiza el pedido
export async function confirmarPago(pagoId: string, pedidoEsperado?: string) {
  const pago = await obtenerPago(pagoId);
  const pedidoId = pago.external_reference;
  if (!pedidoId) throw new ErrorXico("El pago no corresponde a ningún pedido.");
  if (pedidoEsperado && pedidoId !== pedidoEsperado) throw new ErrorXico("El pago no corresponde a este pedido.");

  const db = adminDb();
  const ref = db.collection("pedidos").doc(pedidoId);

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) throw new ErrorXico("Pedido no encontrado.", 404);
    const pedido = snap.data() as Pedido;
    const base = { "mp.pago": String(pago.id), "mp.estadoPago": `${pago.status}/${pago.status_detail}` };

    if (pedido.estado !== "pendiente_pago" && pedido.estado !== "rechazado") return pedido.estado; // ya procesado

    if (pago.status === "approved") {
      if (pago.currency_id !== "MXN" || Math.abs(pago.transaction_amount - pedido.total) > 0.5) {
        console.error("[XICO] Monto del pago no coincide", pedidoId, pago.transaction_amount, pedido.total);
        tx.update(ref, { ...base, estado: "rechazado" });
        return "rechazado";
      }
      // Suma las piezas vendidas a cada producto que todavía exista
      // (en una transacción, primero se lee todo y después se escribe)
      const articulos = pedido.grupos.flatMap((g) => g.articulos);
      const refs = articulos.map((a) => db.collection("productos").doc(a.slug));
      const existentes = await tx.getAll(...refs);
      const refPropuesta = pedido.propuestaId ? db.collection("propuestas").doc(pedido.propuestaId) : null;
      const propuesta = refPropuesta ? await tx.get(refPropuesta) : null;
      tx.update(ref, { ...base, estado: "pagado", pagado: Date.now() });
      // Si venía de una propuesta del chat, la propuesta queda como pagada
      if (refPropuesta && propuesta?.exists && propuesta.data()?.estado === "pendiente") {
        tx.update(refPropuesta, { estado: "pagada", pedidoId: pedidoId });
      }
      existentes.forEach((d, i) => {
        if (d.exists) tx.update(refs[i], { vendidos: FieldValue.increment(articulos[i].cantidad) });
      });
      return "pagado";
    }
    if (["rejected", "cancelled"].includes(pago.status)) {
      tx.update(ref, { ...base, estado: "rechazado" });
      return "rechazado";
    }
    tx.update(ref, base); // pendiente (por ejemplo, pago en OXXO aún no realizado)
    return pedido.estado;
  });
}

// Sin número de pago: busca en Mercado Pago los pagos de este pedido y usa el mejor
// (uno aprobado si existe; si no, el más reciente)
export async function verificarPedido(pedidoId: string) {
  const pagos = await buscarPagosDePedido(pedidoId);
  const elegido = pagos.find((p) => p.status === "approved") ?? pagos[0];
  if (!elegido) return null; // todavía no hay ningún intento de pago
  return confirmarPago(String(elegido.id), pedidoId);
}

// Pedido a partir de una propuesta personalizada del chat.
// El precio sale de la propuesta guardada (la escribió el vendedor y nadie la puede cambiar).
export async function crearPedidoPropuesta(usuario: UsuarioVerificado, propuestaId: string, direccionCruda: Direccion) {
  const problema = problemaDireccion(direccionCruda ?? {});
  if (problema) throw new ErrorXico(problema);
  const direccion: Direccion = {
    nombre: recorta(direccionCruda.nombre, 80),
    telefono: recorta(direccionCruda.telefono, 14),
    calle: recorta(direccionCruda.calle, 100),
    numero: recorta(direccionCruda.numero, 20),
    colonia: recorta(direccionCruda.colonia, 80),
    cp: recorta(direccionCruda.cp, 5),
    ciudad: recorta(direccionCruda.ciudad, 80),
    estado: recorta(direccionCruda.estado, 40),
    ...(direccionCruda.referencias ? { referencias: recorta(direccionCruda.referencias, 200) } : {}),
  };

  const db = adminDb();
  const snap = await db.collection("propuestas").doc(String(propuestaId)).get();
  if (!snap.exists) throw new ErrorXico("Propuesta no encontrada.", 404);
  const p = snap.data() as Propuesta;
  if (p.compradorUid !== usuario.uid) throw new ErrorXico("Esta propuesta no es para ti.", 403);
  if (p.estado !== "pendiente") throw new ErrorXico("Esta propuesta ya no está disponible.");
  if (!(p.precio > 0 && p.precio <= 200000)) throw new ErrorXico("Precio no válido.");

  const tienda = (await db.collection("creadores").doc(p.creador).get()).data() as Creador | undefined;
  if (!tienda?.uid || !tiendaActiva(tienda)) throw new ErrorXico("La tienda ya no está disponible.");

  const envio = p.precio >= ENVIO_GRATIS_DESDE ? 0 : ENVIO_POR_CREADOR;
  const comision = Math.round(p.precio * COMISION_XICO);
  const grupo: GrupoPedido = {
    creador: p.creador,
    taller: p.taller,
    articulos: [
      {
        slug: `propuesta-${p.id}`,
        nombre: p.titulo,
        cantidad: 1,
        precioUnitario: p.precio,
        opciones: [...p.detalles, { etiqueta: "Elaboración", valor: p.diasElaboracion }],
        colores: tienda.colores,
        forma: "cuadrada",
        categoria: "regalos",
        ...(p.foto ? { foto: p.foto.mini } : {}),
      },
    ],
    subtotal: p.precio,
    envio,
    comision,
    paraCreador: p.precio - comision + envio,
  };

  const ref = db.collection("pedidos").doc();
  const pedido: Pedido = {
    id: ref.id,
    uid: usuario.uid,
    email: usuario.email ?? "",
    participantes: [...new Set([usuario.uid, tienda.uid])],
    creadores: [p.creador],
    grupos: [grupo],
    productos: p.precio,
    envio,
    total: p.precio + envio,
    direccion,
    estado: "pendiente_pago",
    creado: Date.now(),
    propuestaId: p.id,
  };
  await ref.set(pedido);
  return cobrar(ref, [grupo], envio);
}
