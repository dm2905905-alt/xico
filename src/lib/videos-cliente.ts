"use client";

// Subir, guardar y borrar videos de "Descubre" desde el panel del creador (protegido por las reglas)
import { useEffect, useState } from "react";
import { getApp, getApps, initializeApp } from "firebase/app";
import { collection, deleteDoc, doc, onSnapshot, query, setDoc, where } from "firebase/firestore";
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { obtenerDb } from "./firebase";
import { firebaseConfig } from "./firebase-config";
import { MAX_MB_VIDEO, MAX_SEGUNDOS, type Video } from "./videos";

const storage = () => getStorage(getApps().length ? getApp() : initializeApp(firebaseConfig));

// Lee duración y saca una imagen del segundo 1 para usarla de portada
function revisarVideo(archivo: File): Promise<{ segundos: number; portada: Blob | null }> {
  return new Promise((resolver, rechazar) => {
    const url = URL.createObjectURL(archivo);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.playsInline = true;
    v.src = url;
    const terminar = (r: { segundos: number; portada: Blob | null }) => {
      URL.revokeObjectURL(url);
      resolver(r);
    };
    v.onerror = () => {
      URL.revokeObjectURL(url);
      rechazar(new Error("No pudimos leer ese video. Prueba con otro (MP4 o MOV)."));
    };
    v.onloadedmetadata = () => {
      const segundos = v.duration;
      v.currentTime = Math.min(1, segundos / 2);
      v.onseeked = () => {
        try {
          const ancho = 540;
          const alto = Math.round((v.videoHeight / v.videoWidth) * ancho) || 960;
          const c = document.createElement("canvas");
          c.width = ancho;
          c.height = alto;
          c.getContext("2d")!.drawImage(v, 0, 0, ancho, alto);
          c.toBlob((b) => terminar({ segundos, portada: b }), "image/jpeg", 0.8);
        } catch {
          terminar({ segundos, portada: null });
        }
      };
    };
  });
}

// Sube el video (con avance de 0 a 100) y su portada
export async function subirVideo(archivo: File, creador: string, avance: (pct: number) => void) {
  if (!archivo.type.startsWith("video/")) throw new Error("Ese archivo no es un video.");
  if (archivo.size > MAX_MB_VIDEO * 1024 * 1024) throw new Error(`El video pesa más de ${MAX_MB_VIDEO} MB. Grábalo más corto o en menor calidad.`);
  const { segundos, portada } = await revisarVideo(archivo);
  if (segundos > MAX_SEGUNDOS + 1) throw new Error(`El video dura más de ${MAX_SEGUNDOS} segundos. Recórtalo e inténtalo de nuevo.`);

  const s = storage();
  const ruta = `videos/${creador}/${crypto.randomUUID()}`;
  const meta = { cacheControl: "public, max-age=31536000, immutable" };
  const tarea = uploadBytesResumable(ref(s, ruta), archivo, { ...meta, contentType: archivo.type });
  await new Promise<void>((ok, mal) =>
    tarea.on("state_changed", (t) => avance(Math.round((t.bytesTransferred / t.totalBytes) * 100)), mal, () => ok()),
  );
  const url = await getDownloadURL(ref(s, ruta));
  let urlPortada: string | undefined;
  if (portada) {
    const rp = ref(s, `${ruta}-portada.jpg`);
    await uploadBytes(rp, portada, { ...meta, contentType: "image/jpeg" }).catch(() => null);
    urlPortada = await getDownloadURL(rp).catch(() => undefined);
  }
  return { url, ruta, portada: urlPortada };
}

export async function guardarVideo(v: Video) {
  const db = obtenerDb();
  if (!db) throw new Error("Firebase no configurado");
  await setDoc(doc(db, "videos", v.id), v);
}

export async function borrarVideo(v: Video) {
  const db = obtenerDb();
  if (!db) throw new Error("Firebase no configurado");
  await deleteDoc(doc(db, "videos", v.id));
  if (v.tipo === "archivo") {
    const s = storage();
    await Promise.allSettled([deleteObject(ref(s, v.ruta)), deleteObject(ref(s, `${v.ruta}-portada.jpg`))]);
  }
}

// Videos de una tienda (en vivo), los más nuevos primero
export function useVideosDe(creador: string | undefined) {
  const [estado, setEstado] = useState<{ slug?: string; videos: Video[] }>({ videos: [] });
  useEffect(() => {
    const db = obtenerDb();
    if (!db || !creador) return;
    return onSnapshot(query(collection(db, "videos"), where("creador", "==", creador)), (s) =>
      setEstado({ slug: creador, videos: s.docs.map((d) => d.data() as Video).sort((a, b) => b.creado - a.creado) }),
    );
  }, [creador]);
  return estado.slug === creador ? { videos: estado.videos, cargando: false } : { videos: [] as Video[], cargando: true };
}

// Todos los videos (para la administración)
export function useTodosLosVideos(activo: boolean) {
  const [videos, setVideos] = useState<Video[] | null>(null);
  useEffect(() => {
    const db = obtenerDb();
    if (!db || !activo) return;
    return onSnapshot(collection(db, "videos"), (s) => setVideos(s.docs.map((d) => d.data() as Video).sort((a, b) => b.creado - a.creado)));
  }, [activo]);
  return videos;
}
