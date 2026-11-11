"use client";

// Subir y borrar fotos en Firebase Storage (las reglas de Storage solo dejan al dueño de la tienda)
import { getApp, getApps, initializeApp } from "firebase/app";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import type { Foto } from "./datos";
import { firebaseConfig } from "./firebase-config";
import { comprimirABlob } from "./imagen";

const storage = () => getStorage(getApps().length ? getApp() : initializeApp(firebaseConfig));

export const MAX_MB = 15; // del archivo original (después se reduce mucho)

// Sube una foto en dos tamaños. carpeta: "productos/{tienda}" o "creadores/{tienda}"
export async function subirFoto(archivo: File, carpeta: string, opciones: { grande?: number; mini?: number } = {}): Promise<Foto> {
  if (!archivo.type.startsWith("image/")) throw new Error("Ese archivo no es una imagen.");
  if (archivo.size > MAX_MB * 1024 * 1024) throw new Error(`La foto pesa más de ${MAX_MB} MB.`);

  const [grande, mini] = await Promise.all([
    comprimirABlob(archivo, opciones.grande ?? 1400, 0.85),
    comprimirABlob(archivo, opciones.mini ?? 520, 0.8),
  ]);
  const id = crypto.randomUUID();
  const ruta = `${carpeta}/${id}`;
  const s = storage();
  const metadatos = { contentType: "image/jpeg", cacheControl: "public, max-age=31536000, immutable" };
  const [rg, rm] = [ref(s, `${ruta}.jpg`), ref(s, `${ruta}-mini.jpg`)];
  await Promise.all([uploadBytes(rg, grande, metadatos), uploadBytes(rm, mini, metadatos)]);
  const [url, urlMini] = await Promise.all([getDownloadURL(rg), getDownloadURL(rm)]);
  return { url, mini: urlMini, ruta };
}

// Borra los dos tamaños (si falla, no pasa nada: solo queda un archivo huérfano)
export async function borrarFoto(foto: Foto) {
  const s = storage();
  await Promise.allSettled([deleteObject(ref(s, `${foto.ruta}.jpg`)), deleteObject(ref(s, `${foto.ruta}-mini.jpg`))]);
}
