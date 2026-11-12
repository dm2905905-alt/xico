// Tiendas creadas por la administración para alguien más: la tienda queda oculta hasta que su dueño
// abre la liga de invitación y la acepta con su cuenta. El código es secreto (no vive en la tienda,
// que es pública) y sirve una sola vez.
import { randomBytes } from "node:crypto";
import type { Creador } from "../datos";
import { estados } from "../datos";
import { urlSitio } from "../sitio";
import { adminDb, ErrorXico, type UsuarioVerificado } from "./admin";

const aSlug = (t: string) =>
  t.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "tienda";
const recorta = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);

export async function crearInvitacion(datos: Record<string, unknown>) {
  const taller = recorta(datos.taller, 60);
  if (taller.length < 2) throw new ErrorXico("Escribe el nombre de la tienda.");
  const estado = estados.some((e) => e.slug === datos.estado) ? String(datos.estado) : "michoacan";
  const db = adminDb();
  let slug = aSlug(taller);
  if ((await db.collection("creadores").doc(slug).get()).exists) slug = `${slug}-${randomBytes(2).toString("hex")}`;
  const codigo = randomBytes(18).toString("base64url");
  const tienda: Creador = {
    slug,
    taller,
    nombre: recorta(datos.nombre, 80),
    estado,
    ciudad: recorta(datos.ciudad, 60),
    especialidad: recorta(datos.especialidad, 80),
    historia: recorta(datos.historia, 600),
    colores: ["#ff2d87", "#7c2df0"],
    verificado: false,
    top: false,
    calificacion: 0,
    resenas: 0,
    estadoTienda: "aprobada",
    invitada: true,
  };
  const lote = db.batch();
  lote.set(db.collection("creadores").doc(slug), tienda);
  lote.set(db.collection("invitaciones").doc(codigo), { tienda: slug, creada: Date.now() });
  await lote.commit();
  return { slug, enlace: `${urlSitio()}/reclamar?codigo=${codigo}` };
}

export async function aceptarInvitacion(usuario: UsuarioVerificado, codigoCrudo: unknown) {
  const codigo = String(codigoCrudo ?? "");
  if (!/^[A-Za-z0-9_-]{20,40}$/.test(codigo)) throw new ErrorXico("La liga de invitación no es válida.", 404);
  const db = adminDb();
  const yaTiene = await db.collection("creadores").where("uid", "==", usuario.uid).limit(1).get();
  if (!yaTiene.empty) throw new ErrorXico("Tu cuenta ya tiene una tienda. Entra con otra cuenta de Google para aceptar esta.");
  const refInv = db.collection("invitaciones").doc(codigo);
  return db.runTransaction(async (tx) => {
    const inv = await tx.get(refInv);
    if (!inv.exists) throw new ErrorXico("Esta invitación ya se usó o no existe. Pide una nueva.", 404);
    const slug = String(inv.data()?.tienda);
    const refTienda = db.collection("creadores").doc(slug);
    const tienda = (await tx.get(refTienda)).data() as Creador | undefined;
    if (!tienda || !tienda.invitada || tienda.uid) throw new ErrorXico("Esta tienda ya tiene dueño.");
    // Los 3 meses gratis empiezan hoy
    tx.update(refTienda, { uid: usuario.uid, invitada: false, solicitada: Date.now() });
    tx.delete(refInv);
    return { slug, taller: tienda.taller };
  });
}
