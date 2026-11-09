"use client";

// Lectura de pedidos en vivo desde el navegador (las reglas solo dejan ver los propios)
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, where } from "firebase/firestore";
import { obtenerDb } from "./firebase";
import type { Pedido } from "./pedidos";

export function usePedido(id: string, uid: string | undefined) {
  const [estado, setEstado] = useState<{ clave?: string; pedido: Pedido | null; error?: boolean }>({ pedido: null });
  const clave = `${id}|${uid}`;

  useEffect(() => {
    const db = obtenerDb();
    if (!db || !uid) return;
    return onSnapshot(
      doc(db, "pedidos", id),
      (s) => setEstado({ clave, pedido: s.exists() ? (s.data() as Pedido) : null }),
      () => setEstado({ clave, pedido: null, error: true }),
    );
  }, [id, uid, clave]);

  return estado.clave === clave ? { ...estado, cargando: false } : { pedido: null, cargando: !!uid };
}

// Todos los pedidos donde participa la persona (como compradora o como creadora)
export function usePedidosDe(uid: string | undefined) {
  const [estado, setEstado] = useState<{ uid?: string; pedidos: Pedido[] }>({ pedidos: [] });

  useEffect(() => {
    const db = obtenerDb();
    if (!db || !uid) return;
    const q = query(collection(db, "pedidos"), where("participantes", "array-contains", uid));
    return onSnapshot(
      q,
      (s) => setEstado({ uid, pedidos: s.docs.map((d) => d.data() as Pedido).sort((a, b) => b.creado - a.creado) }),
      () => setEstado({ uid, pedidos: [] }),
    );
  }, [uid]);

  return estado.uid === uid ? { pedidos: estado.pedidos, cargando: false } : { pedidos: [], cargando: !!uid };
}
