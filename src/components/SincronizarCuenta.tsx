"use client";

import { useEffect } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { guardarCarrito, leerCarrito, suscribirCarrito, type ArticuloCarrito } from "@/lib/carrito";
import type { ProductoTarjeta } from "@/lib/datos";
import { guardarFavoritos, leerFavoritos, suscribirFavoritos } from "@/lib/favoritos";
import { obtenerDb } from "@/lib/firebase";

// Une dos listas sin repetir (gana la versión local si hay choque)
function unir<T>(local: T[], remota: T[], clave: (x: T) => string) {
  const vistos = new Set(local.map(clave));
  return [...local, ...remota.filter((x) => !vistos.has(clave(x)))];
}

// Las fotos de referencia pesan demasiado para la base de datos; se quedan en este
// dispositivo hasta que se activa Firebase Storage.
const sinFotos = (lista: ArticuloCarrito[]) => lista.map(({ foto, ...resto }) => (foto ? { ...resto, conFoto: true } : resto));

// Mientras hay sesión, el carrito y los favoritos se guardan en usuarios/{uid}
// para verlos desde cualquier dispositivo.
export function SincronizarCuenta({ uid }: { uid: string }) {
  useEffect(() => {
    const db = obtenerDb();
    if (!db) return;
    const ref = doc(db, "usuarios", uid);
    let activo = true;
    let espera: ReturnType<typeof setTimeout> | undefined;
    const quitar: (() => void)[] = [];

    const subir = () => {
      clearTimeout(espera);
      espera = setTimeout(() => {
        setDoc(ref, { carrito: sinFotos(leerCarrito()), favoritos: leerFavoritos(), actualizado: serverTimestamp() }, { merge: true }).catch(
          (e) => console.warn("No se pudo guardar en tu cuenta:", e),
        );
      }, 800);
    };

    (async () => {
      try {
        const snap = await getDoc(ref);
        if (!activo) return;
        const remoto = snap.data() as { carrito?: ArticuloCarrito[]; favoritos?: ProductoTarjeta[] } | undefined;
        guardarCarrito(unir(leerCarrito(), remoto?.carrito ?? [], (a) => a.id));
        guardarFavoritos(unir(leerFavoritos(), remoto?.favoritos ?? [], (f) => f.slug));
        subir();
        quitar.push(suscribirCarrito(subir), suscribirFavoritos(subir));
      } catch (e) {
        console.warn("No se pudo leer tu cuenta:", e);
      }
    })();

    return () => {
      activo = false;
      clearTimeout(espera);
      quitar.forEach((f) => f());
    };
  }, [uid]);

  return null;
}
