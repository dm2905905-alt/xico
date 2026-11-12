// Guardar y borrar reseñas. Solo en el servidor: así nadie puede inventar compras ni mover los promedios.
import { FieldValue } from "firebase-admin/firestore";
import type { Creador, Producto } from "../datos";
import type { Pedido } from "../pedidos";
import { ocultarContacto } from "../contacto";
import { MAX_TEXTO_RESENA, idResena, nombreCorto, promedio, type Resena, type TipoResena } from "../resenas";
import { adminDb, esAdmin, ErrorXico, type UsuarioVerificado } from "./admin";
import { avisar } from "./avisos";
import { esModerador } from "./equipo";

const cobrado = (p: Pedido) => ["pagado", "enviado", "entregado"].includes(p.estado);

// Recalcula estrellas y número de reseñas del producto y de su tienda
async function recalcular(producto: string | null, creador: string) {
  const db = adminDb();
  if (producto) {
    const s = await db.collection("resenas").where("tipo", "==", "producto").where("objetivo", "==", producto).get();
    const ref = db.collection("productos").doc(producto);
    if ((await ref.get()).exists) await ref.update(promedio(s.docs.map((d) => (d.data() as Resena).estrellas)));
  }
  // La tienda: todas sus reseñas (de la tienda y de sus productos)
  const s = await db.collection("resenas").where("creador", "==", creador).get();
  const ref = db.collection("creadores").doc(creador);
  if ((await ref.get()).exists) await ref.update(promedio(s.docs.map((d) => (d.data() as Resena).estrellas)));
}

export async function guardarResena(usuario: UsuarioVerificado, cuerpo: Record<string, unknown>) {
  const tipo = cuerpo.tipo === "tienda" ? "tienda" : cuerpo.tipo === "producto" ? "producto" : null;
  const objetivo = String(cuerpo.objetivo ?? "");
  const estrellas = Number(cuerpo.estrellas);
  if (!tipo || !/^[a-z0-9-]{1,120}$/.test(objetivo)) throw new ErrorXico("Reseña no válida.");
  if (!Number.isInteger(estrellas) || estrellas < 1 || estrellas > 5) throw new ErrorXico("Elige de 1 a 5 estrellas.");
  const texto = ocultarContacto(String(cuerpo.texto ?? "").trim().slice(0, MAX_TEXTO_RESENA)).limpio;

  const db = adminDb();
  // ¿A qué tienda pertenece?
  let creador: string;
  let nombreProducto: string | undefined;
  if (tipo === "producto") {
    const p = await db.collection("productos").doc(objetivo).get();
    if (!p.exists) throw new ErrorXico("Ese producto no existe.", 404);
    creador = (p.data() as Producto).creador;
    nombreProducto = (p.data() as Producto).nombre;
  } else {
    const c = await db.collection("creadores").doc(objetivo).get();
    if (!c.exists) throw new ErrorXico("Esa tienda no existe.", 404);
    creador = (c.data() as Creador).slug;
    if ((c.data() as Creador).uid === usuario.uid) throw new ErrorXico("No puedes calificar tu propia tienda.", 403);
  }

  // Solo quien compró (pedido pagado como comprador)
  const pedidos = await db.collection("pedidos").where("uid", "==", usuario.uid).get();
  const compro = pedidos.docs
    .map((d) => d.data() as Pedido)
    .filter(cobrado)
    .some((p) => p.grupos.some((g) => (tipo === "tienda" ? g.creador === objetivo : g.articulos.some((a) => a.slug === objetivo))));
  if (!compro) throw new ErrorXico(tipo === "tienda" ? "Solo puedes calificar tiendas donde ya compraste." : "Solo puedes opinar de productos que compraste.", 403);

  const id = idResena(tipo as TipoResena, objetivo, usuario.uid);
  const ref = db.collection("resenas").doc(id);
  const anterior = await ref.get();
  const resena: Resena = {
    id,
    tipo,
    objetivo,
    creador,
    ...(nombreProducto ? { producto: nombreProducto } : {}),
    uid: usuario.uid,
    nombre: nombreCorto(usuario.nombre),
    estrellas,
    texto,
    fecha: Date.now(),
    ...(anterior.exists ? { editada: true } : {}),
    // Si la tienda ya había respondido, su respuesta se conserva
    ...((anterior.data() as Resena | undefined)?.respuesta ? { respuesta: (anterior.data() as Resena).respuesta } : {}),
  };
  await ref.set(resena);
  await recalcular(tipo === "producto" ? objetivo : null, creador);
  if (!anterior.exists) {
    const dueno = ((await db.collection("creadores").doc(creador).get()).data() as Creador | undefined)?.uid ?? "";
    await avisar([
      {
        uid: dueno,
        tipo: "resena",
        titulo: `Nueva opinión: ${"★".repeat(estrellas)}${"☆".repeat(5 - estrellas)}`,
        texto: `${resena.nombre} opinó sobre ${nombreProducto ?? "tu tienda"}. Puedes responderle.`,
        enlace: tipo === "producto" ? `/producto/${objetivo}#resenas` : `/creador/${creador}#resenas`,
      },
    ]);
  }
  return resena;
}

// La persona borra la suya, o la administración borra cualquiera
export async function borrarResena(usuario: UsuarioVerificado, id: string) {
  const db = adminDb();
  const ref = db.collection("resenas").doc(String(id));
  const snap = await ref.get();
  if (!snap.exists) throw new ErrorXico("Esa reseña ya no existe.", 404);
  const r = snap.data() as Resena;
  if (r.uid !== usuario.uid && !esAdmin(usuario) && !(await esModerador(usuario))) throw new ErrorXico("No puedes borrar esa reseña.", 403);
  await ref.delete();
  await recalcular(r.tipo === "producto" ? r.objetivo : null, r.creador);
  return { ok: true };
}

// La tienda responde una opinión (texto vacío = quitar la respuesta)
export async function responderResena(usuario: UsuarioVerificado, id: string, textoCrudo: unknown) {
  const db = adminDb();
  const ref = db.collection("resenas").doc(String(id));
  const snap = await ref.get();
  if (!snap.exists) throw new ErrorXico("Esa opinión ya no existe.", 404);
  const r = snap.data() as Resena;
  const tienda = (await db.collection("creadores").doc(r.creador).get()).data() as Creador | undefined;
  if (!tienda?.uid || tienda.uid !== usuario.uid) throw new ErrorXico("Solo la tienda puede responder esta opinión.", 403);
  const texto = ocultarContacto(String(textoCrudo ?? "").trim().slice(0, MAX_TEXTO_RESENA)).limpio;
  if (!texto) {
    await ref.update({ respuesta: FieldValue.delete() });
    return { ok: true };
  }
  const nueva = !r.respuesta;
  await ref.update({ respuesta: { texto, fecha: Date.now() } });
  if (nueva) {
    await avisar([
      {
        uid: r.uid,
        tipo: "respuesta",
        titulo: `${tienda.taller} respondió tu opinión`,
        texto: texto.slice(0, 140),
        enlace: r.tipo === "producto" ? `/producto/${r.objetivo}#resenas` : `/creador/${r.creador}#resenas`,
      },
    ]);
  }
  return { ok: true };
}
