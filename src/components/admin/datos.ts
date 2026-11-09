"use client";

// Datos y llamadas del panel de administración
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import type { Creador, Producto } from "@/lib/datos";
import { obtenerDb } from "@/lib/firebase";
import type { Pedido } from "@/lib/pedidos";

// Llama a una ruta del servidor con la sesión de la persona
export async function llamar<T = Record<string, unknown>>(usuario: User, ruta: string, cuerpo: unknown): Promise<T> {
  const r = await fetch(ruta, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${await usuario.getIdToken()}` },
    body: JSON.stringify(cuerpo),
  });
  const datos = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(datos.error ?? "Algo salió mal.");
  return datos as T;
}

// ¿Es administradora? Lo decide el servidor (lista ADMIN_EMAILS)
export function useEsAdmin(usuario: User | null) {
  const [estado, setEstado] = useState<{ uid?: string; admin: boolean }>({ admin: false });
  useEffect(() => {
    if (!usuario) return;
    let activo = true;
    llamar<{ admin: boolean }>(usuario, "/api/admin/yo", {})
      .then((r) => activo && setEstado({ uid: usuario.uid, admin: r.admin }))
      .catch(() => activo && setEstado({ uid: usuario.uid, admin: false }));
    return () => {
      activo = false;
    };
  }, [usuario]);
  if (!usuario) return { admin: false, cargando: false };
  return estado.uid === usuario.uid ? { admin: estado.admin, cargando: false } : { admin: false, cargando: true };
}

export type DatosAdmin = { creadores: Creador[]; productos: Producto[]; pedidos: Pedido[]; listo: boolean };

// Todo en vivo (las reglas solo dejan leer pedidos a la cuenta administradora)
export function useDatosAdmin(activo: boolean): DatosAdmin {
  const [creadores, setCreadores] = useState<Creador[] | null>(null);
  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);

  useEffect(() => {
    const db = obtenerDb();
    if (!db || !activo) return;
    const quitar = [
      onSnapshot(collection(db, "creadores"), (s) => setCreadores(s.docs.map((d) => d.data() as Creador))),
      onSnapshot(collection(db, "productos"), (s) => setProductos(s.docs.map((d) => d.data() as Producto))),
      onSnapshot(
        collection(db, "pedidos"),
        (s) => setPedidos(s.docs.map((d) => d.data() as Pedido).sort((a, b) => b.creado - a.creado)),
        () => setPedidos([]),
      ),
    ];
    return () => quitar.forEach((f) => f());
  }, [activo]);

  return {
    creadores: creadores ?? [],
    productos: productos ?? [],
    pedidos: pedidos ?? [],
    listo: creadores !== null && productos !== null && pedidos !== null,
  };
}

export const cobrados = (pedidos: Pedido[]) => pedidos.filter((p) => ["pagado", "enviado", "entregado"].includes(p.estado));
