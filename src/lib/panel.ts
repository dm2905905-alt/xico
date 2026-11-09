"use client";

// Operaciones del panel del creador (desde el navegador, protegidas por las reglas de Firestore)
import { useEffect, useState } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  query,
  setDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import type { Creador, Producto } from "./datos";
import { obtenerDb } from "./firebase";

// "Taller Xóchitl" → "taller-xochitl"
export const aSlug = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "tienda";

const sufijo = () => Math.random().toString(36).slice(2, 6);

// Tienda de la persona con sesión (se actualiza en vivo)
export function useMiCreador(uid: string | undefined) {
  const [estado, setEstado] = useState<{ creador: Creador | null; cargando: boolean; uid?: string }>({
    creador: null,
    cargando: true,
  });

  useEffect(() => {
    const db = obtenerDb();
    if (!db || !uid) return;
    const q = query(collection(db, "creadores"), where("uid", "==", uid), limit(1));
    return onSnapshot(
      q,
      (snap) => setEstado({ creador: (snap.docs[0]?.data() as Creador) ?? null, cargando: false, uid }),
      () => setEstado({ creador: null, cargando: false, uid }),
    );
  }, [uid]);

  // Mientras no hay respuesta para este uid, se considera cargando
  if (!uid) return { creador: null, cargando: false };
  return estado.uid === uid ? estado : { creador: null, cargando: true };
}

// Productos de una tienda (en vivo)
export function useProductosDe(slugCreador: string | undefined) {
  const [estado, setEstado] = useState<{ slug?: string; productos: Producto[] }>({ productos: [] });

  useEffect(() => {
    const db = obtenerDb();
    if (!db || !slugCreador) return;
    const q = query(collection(db, "productos"), where("creador", "==", slugCreador));
    return onSnapshot(q, (snap) =>
      setEstado({ slug: slugCreador, productos: snap.docs.map((d) => d.data() as Producto) }),
    );
  }, [slugCreador]);

  return estado.slug === slugCreador ? { productos: estado.productos, cargando: false } : { productos: [], cargando: true };
}

export type DatosTienda = Pick<Creador, "nombre" | "taller" | "estado" | "ciudad" | "especialidad" | "historia" | "colores">;

// Abre una tienda nueva. Las insignias y calificaciones empiezan en cero (lo exigen las reglas).
export async function crearTienda(uid: string, datos: DatosTienda): Promise<string> {
  const db = obtenerDb();
  if (!db) throw new Error("Firebase no configurado");
  let slug = aSlug(datos.taller);
  if ((await getDoc(doc(db, "creadores", slug))).exists()) slug = `${slug}-${sufijo()}`;
  const creador: Creador = { ...datos, slug, uid, verificado: false, top: false, calificacion: 0, resenas: 0 };
  await setDoc(doc(db, "creadores", slug), creador);
  return slug;
}

// Actualiza la tienda y copia el nuevo nombre/estado a sus productos (se muestran en las tarjetas)
export async function guardarTienda(creador: Creador, datos: DatosTienda, productos: Producto[]) {
  const db = obtenerDb();
  if (!db) throw new Error("Firebase no configurado");
  const lote = writeBatch(db);
  lote.update(doc(db, "creadores", creador.slug), datos);
  if (datos.taller !== creador.taller || datos.estado !== creador.estado) {
    productos.forEach((p) => lote.update(doc(db, "productos", p.slug), { taller: datos.taller, estado: datos.estado }));
  }
  await lote.commit();
}

export type DatosProducto = Pick<
  Producto,
  | "nombre"
  | "categoria"
  | "precio"
  | "precioAntes"
  | "descripcion"
  | "materiales"
  | "diasElaboracion"
  | "colores"
  | "forma"
  | "personalizacion"
>;

// Crea o actualiza un producto de la tienda
export async function guardarProducto(creador: Creador, datos: DatosProducto, existente?: Producto): Promise<string> {
  const db = obtenerDb();
  if (!db) throw new Error("Firebase no configurado");

  const comunes = {
    ...datos,
    personalizable: (datos.personalizacion?.length ?? 0) > 0,
    taller: creador.taller,
    estado: creador.estado,
  };

  if (existente) {
    // Se conservan ventas, reseñas y calificación (las reglas no dejan cambiarlas)
    const { precioAntes, ...resto } = comunes;
    const actualizado: Producto = {
      ...existente,
      ...resto,
      ...(precioAntes ? { precioAntes } : {}),
    };
    if (!precioAntes) delete actualizado.precioAntes;
    await setDoc(doc(db, "productos", existente.slug), actualizado);
    return existente.slug;
  }

  const slug = `${aSlug(datos.nombre)}-${sufijo()}`;
  const nuevo: Producto = {
    ...comunes,
    slug,
    creador: creador.slug,
    calificacion: 0,
    resenas: 0,
    vendidos: 0,
    nuevo: true,
  };
  if (!nuevo.precioAntes) delete nuevo.precioAntes;
  await setDoc(doc(db, "productos", slug), nuevo);
  return slug;
}

export async function borrarProducto(slug: string) {
  const db = obtenerDb();
  if (!db) throw new Error("Firebase no configurado");
  await deleteDoc(doc(db, "productos", slug));
}

export async function leerProducto(slug: string): Promise<Producto | null> {
  const db = obtenerDb();
  if (!db) return null;
  const snap = await getDoc(doc(db, "productos", slug));
  return snap.exists() ? (snap.data() as Producto) : null;
}
