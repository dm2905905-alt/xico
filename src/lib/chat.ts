"use client";

// Chat entre comprador y vendedor, y propuestas personalizadas (todo dentro de XICO)
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { addDoc, collection, doc, getDoc, onSnapshot, orderBy, query, setDoc, updateDoc, where } from "firebase/firestore";
import { ocultarContacto } from "./contacto";
import type { Creador, Foto } from "./datos";
import { obtenerDb } from "./firebase";

export type Conversacion = {
  id: string;
  compradorUid: string;
  compradorNombre: string;
  creador: string; // slug de la tienda
  creadorUid: string;
  taller: string;
  participantes: [string, string]; // [comprador, vendedor]
  ultimo?: { texto: string; de: string; fecha: number };
  leido: Record<string, number>; // última vez que cada quien abrió el chat
  creado: number;
  actualizado: number;
};

export type Mensaje = {
  id: string;
  de: string;
  tipo: "texto" | "imagen" | "propuesta";
  texto?: string;
  foto?: Foto;
  propuestaId?: string;
  oculto?: boolean; // se ocultaron datos de contacto
  fecha: number;
};

export type EstadoPropuesta = "pendiente" | "rechazada" | "cancelada" | "pagada";

export type Propuesta = {
  id: string;
  conversacion: string;
  creador: string;
  creadorUid: string;
  taller: string;
  compradorUid: string;
  titulo: string;
  detalles: { etiqueta: string; valor: string }[];
  foto?: Foto;
  precio: number;
  diasElaboracion: string;
  estado: EstadoPropuesta;
  pedidoId?: string;
  creado: number;
};

export const idConversacion = (compradorUid: string, creadorSlug: string) => `${compradorUid}__${creadorSlug}`;

const db = () => {
  const d = obtenerDb();
  if (!d) throw new Error("Firebase no configurado");
  return d;
};

// Abre (o crea) la conversación del comprador con una tienda
export async function abrirConversacion(usuario: User, creador: Creador): Promise<string> {
  if (!creador.uid) throw new Error("Esta tienda es de ejemplo y no recibe mensajes.");
  if (creador.uid === usuario.uid) throw new Error("Esta es tu propia tienda.");
  const id = idConversacion(usuario.uid, creador.slug);
  const ref = doc(db(), "conversaciones", id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const ahora = Date.now();
    const nueva: Conversacion = {
      id,
      compradorUid: usuario.uid,
      compradorNombre: usuario.displayName ?? "Cliente",
      creador: creador.slug,
      creadorUid: creador.uid,
      taller: creador.taller,
      participantes: [usuario.uid, creador.uid],
      leido: { [usuario.uid]: ahora },
      creado: ahora,
      actualizado: ahora,
    };
    await setDoc(ref, nueva);
  }
  return id;
}

async function registrarUltimo(conversacion: string, uid: string, texto: string) {
  const ahora = Date.now();
  await updateDoc(doc(db(), "conversaciones", conversacion), {
    ultimo: { texto: texto.slice(0, 120), de: uid, fecha: ahora },
    actualizado: ahora,
    [`leido.${uid}`]: ahora,
  });
}

// Envía un texto; los datos de contacto se ocultan antes de salir del navegador
export async function enviarTexto(conversacion: string, uid: string, texto: string) {
  const { limpio, encontrados } = ocultarContacto(texto.trim().slice(0, 1000));
  if (!limpio.trim()) return { oculto: false };
  const mensaje: Omit<Mensaje, "id"> = { de: uid, tipo: "texto", texto: limpio, fecha: Date.now(), ...(encontrados.length ? { oculto: true } : {}) };
  await addDoc(collection(db(), "conversaciones", conversacion, "mensajes"), mensaje);
  await registrarUltimo(conversacion, uid, limpio);
  return { oculto: encontrados.length > 0 };
}

export async function enviarImagen(conversacion: string, uid: string, foto: Foto) {
  const mensaje: Omit<Mensaje, "id"> = { de: uid, tipo: "imagen", foto, fecha: Date.now() };
  await addDoc(collection(db(), "conversaciones", conversacion, "mensajes"), mensaje);
  await registrarUltimo(conversacion, uid, "📷 Foto");
}

export type DatosPropuesta = Pick<Propuesta, "titulo" | "detalles" | "foto" | "precio" | "diasElaboracion">;

// El vendedor crea una propuesta y aparece como tarjeta en el chat
export async function crearPropuesta(c: Conversacion, uid: string, datos: DatosPropuesta) {
  const limpiar = (t: string) => ocultarContacto(t).limpio;
  const ref = doc(collection(db(), "propuestas"));
  const propuesta: Propuesta = {
    id: ref.id,
    conversacion: c.id,
    creador: c.creador,
    creadorUid: uid,
    taller: c.taller,
    compradorUid: c.compradorUid,
    titulo: limpiar(datos.titulo).slice(0, 120),
    detalles: datos.detalles
      .filter((d) => d.etiqueta.trim() && d.valor.trim())
      .slice(0, 12)
      .map((d) => ({ etiqueta: limpiar(d.etiqueta).slice(0, 40), valor: limpiar(d.valor).slice(0, 200) })),
    ...(datos.foto ? { foto: datos.foto } : {}),
    precio: Math.round(datos.precio),
    diasElaboracion: datos.diasElaboracion,
    estado: "pendiente",
    creado: Date.now(),
  };
  await setDoc(ref, propuesta);
  const mensaje: Omit<Mensaje, "id"> = { de: uid, tipo: "propuesta", propuestaId: ref.id, fecha: Date.now() };
  await addDoc(collection(db(), "conversaciones", c.id, "mensajes"), mensaje);
  await registrarUltimo(c.id, uid, `📝 Propuesta: ${propuesta.titulo}`);
  return ref.id;
}

export async function responderPropuesta(id: string, estado: "rechazada" | "cancelada") {
  await updateDoc(doc(db(), "propuestas", id), { estado });
}

export async function marcarLeido(conversacion: string, uid: string) {
  await updateDoc(doc(db(), "conversaciones", conversacion), { [`leido.${uid}`]: Date.now() }).catch(() => {});
}

export const sinLeer = (c: Conversacion, uid: string) => !!c.ultimo && c.ultimo.de !== uid && c.ultimo.fecha > (c.leido?.[uid] ?? 0);

// ---- Lectura en vivo ----

export function useConversaciones(uid: string | undefined) {
  const [estado, setEstado] = useState<{ uid?: string; lista: Conversacion[] }>({ lista: [] });
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db(), "conversaciones"), where("participantes", "array-contains", uid));
    return onSnapshot(
      q,
      (s) => setEstado({ uid, lista: s.docs.map((d) => d.data() as Conversacion).sort((a, b) => b.actualizado - a.actualizado) }),
      () => setEstado({ uid, lista: [] }),
    );
  }, [uid]);
  return estado.uid === uid ? { conversaciones: estado.lista, cargando: false } : { conversaciones: [], cargando: !!uid };
}

export function useConversacion(id: string, uid: string | undefined) {
  const [estado, setEstado] = useState<{ clave?: string; c: Conversacion | null; mensajes: Mensaje[] }>({ c: null, mensajes: [] });
  const clave = `${id}|${uid}`;
  useEffect(() => {
    if (!uid) return;
    const quitar = [
      onSnapshot(
        doc(db(), "conversaciones", id),
        (s) => setEstado((e) => ({ ...e, clave, c: s.exists() ? (s.data() as Conversacion) : null })),
        () => setEstado((e) => ({ ...e, clave, c: null })),
      ),
      onSnapshot(
        query(collection(db(), "conversaciones", id, "mensajes"), orderBy("fecha", "asc")),
        (s) => setEstado((e) => ({ ...e, clave, mensajes: s.docs.map((d) => ({ ...(d.data() as Omit<Mensaje, "id">), id: d.id })) })),
        () => {},
      ),
    ];
    return () => quitar.forEach((f) => f());
  }, [id, uid, clave]);
  return estado.clave === clave ? { ...estado, cargando: false } : { c: null, mensajes: [], cargando: !!uid };
}

export function usePropuesta(id: string | undefined) {
  const [estado, setEstado] = useState<{ id?: string; p: Propuesta | null }>({ p: null });
  useEffect(() => {
    if (!id) return;
    return onSnapshot(
      doc(db(), "propuestas", id),
      (s) => setEstado({ id, p: s.exists() ? (s.data() as Propuesta) : null }),
      () => setEstado({ id, p: null }),
    );
  }, [id]);
  return estado.id === id ? { propuesta: estado.p, cargando: false } : { propuesta: null, cargando: !!id };
}
