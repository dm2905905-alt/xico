"use client";

import { useSyncExternalStore } from "react";

// true solo en el navegador; evita mostrar "vacío" antes de leer lo guardado
const nada = () => () => {};
export const useEnNavegador = () =>
  useSyncExternalStore(
    nada,
    () => true,
    () => false,
  );

// Almacén pequeño guardado en el navegador (localStorage).
// Así el carrito y los favoritos funcionan sin registrarse y se sincronizan entre pestañas.
export function crearAlmacen<T>(clave: string, inicial: T) {
  const oyentes = new Set<() => void>();
  let crudo: string | null | undefined; // último texto leído
  let valor: T = inicial;

  function leer(): T {
    let texto: string | null = null;
    try {
      texto = localStorage.getItem(clave);
    } catch {
      return valor; // navegador sin acceso al almacenamiento
    }
    if (texto !== crudo) {
      crudo = texto;
      try {
        valor = texto ? (JSON.parse(texto) as T) : inicial;
      } catch {
        valor = inicial;
      }
    }
    return valor;
  }

  function escribir(sig: T | ((prev: T) => T)) {
    const nuevo = typeof sig === "function" ? (sig as (p: T) => T)(leer()) : sig;
    try {
      localStorage.setItem(clave, JSON.stringify(nuevo));
    } catch {
      // Sin espacio o bloqueado: se mantiene en memoria
      valor = nuevo;
      crudo = undefined;
    }
    oyentes.forEach((o) => o());
  }

  function suscribir(oyente: () => void) {
    oyentes.add(oyente);
    const alCambiarOtraPestana = (e: StorageEvent) => e.key === clave && oyente();
    window.addEventListener("storage", alCambiarOtraPestana);
    return () => {
      oyentes.delete(oyente);
      window.removeEventListener("storage", alCambiarOtraPestana);
    };
  }

  function useValor(): T {
    return useSyncExternalStore(suscribir, leer, () => inicial);
  }

  return { useValor, escribir, leer, suscribir };
}
