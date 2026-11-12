"use client";

// Avisos de la persona con sesión (en vivo) y marcarlos como leídos
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, where, writeBatch } from "firebase/firestore";
import type { Aviso } from "./avisos";
import { obtenerDb } from "./firebase";

export function useAvisos(uid: string | undefined) {
  const [estado, setEstado] = useState<{ uid?: string; avisos: Aviso[] }>({ avisos: [] });
  useEffect(() => {
    const db = obtenerDb();
    if (!db || !uid) return;
    return onSnapshot(
      query(collection(db, "avisos"), where("uid", "==", uid)),
      (s) => setEstado({ uid, avisos: s.docs.map((d) => d.data() as Aviso).sort((a, b) => b.fecha - a.fecha).slice(0, 60) }),
      () => setEstado({ uid, avisos: [] }),
    );
  }, [uid]);
  return estado.uid === uid ? { avisos: estado.avisos, cargando: false } : { avisos: [], cargando: !!uid };
}

export async function marcarLeidos(avisos: Aviso[]) {
  const db = obtenerDb();
  const pendientes = avisos.filter((a) => !a.leido);
  if (!db || !pendientes.length) return;
  const lote = writeBatch(db);
  for (const a of pendientes) lote.update(doc(db, "avisos", a.id), { leido: true });
  await lote.commit();
}

// La administración avisa a una tienda (aprobada, rechazada, suspendida, premio…)
export async function avisarDesdeAdmin(aviso: Omit<Aviso, "id" | "fecha" | "leido">) {
  const db = obtenerDb();
  if (!db || !aviso.uid) return;
  const ref = doc(collection(db, "avisos"));
  const lote = writeBatch(db);
  lote.set(ref, { ...aviso, id: ref.id, fecha: Date.now(), leido: false } satisfies Aviso);
  await lote.commit();
}
