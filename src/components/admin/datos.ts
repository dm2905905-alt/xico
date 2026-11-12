"use client";

// Datos y llamadas del panel de administración
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import type { Creador, Producto } from "@/lib/datos";
import { obtenerDb } from "@/lib/firebase";
import type { Pedido } from "@/lib/pedidos";
import type { DatosPrivados } from "@/lib/panel";
import type { PagoSuscripcion } from "@/lib/suscripcion";
import type { Evento } from "@/lib/eventos";

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

export type Rol = "admin" | "moderador" | null;

// ¿Es administradora o moderadora? Lo decide el servidor (ADMIN_EMAILS y la lista del equipo)
export function useEsAdmin(usuario: User | null) {
  const [estado, setEstado] = useState<{ uid?: string; rol: Rol }>({ rol: null });
  useEffect(() => {
    if (!usuario) return;
    let activo = true;
    llamar<{ rol: Rol }>(usuario, "/api/admin/yo", {})
      .then((r) => activo && setEstado({ uid: usuario.uid, rol: r.rol ?? null }))
      .catch(() => activo && setEstado({ uid: usuario.uid, rol: null }));
    return () => {
      activo = false;
    };
  }, [usuario]);
  if (!usuario) return { admin: false, rol: null as Rol, cargando: false };
  const rol = estado.uid === usuario.uid ? estado.rol : null;
  return { admin: rol === "admin", rol, cargando: estado.uid !== usuario.uid };
}

// privados: cuenta de pago y dirección de cada tienda (por slug)
export type DatosAdmin = { creadores: Creador[]; productos: Producto[]; pedidos: Pedido[]; privados: Record<string, DatosPrivados>; pagosSuscripcion: PagoSuscripcion[]; eventos: Evento[]; listo: boolean };

// Todo en vivo (las reglas solo dejan leer pedidos a la cuenta administradora)
export function useDatosAdmin(activo: boolean): DatosAdmin {
  const [creadores, setCreadores] = useState<Creador[] | null>(null);
  const [productos, setProductos] = useState<Producto[] | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [privados, setPrivados] = useState<Record<string, DatosPrivados>>({});
  const [pagosSuscripcion, setPagosSuscripcion] = useState<PagoSuscripcion[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);

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
      onSnapshot(
        collection(db, "tiendasPrivado"),
        (s) => setPrivados(Object.fromEntries(s.docs.map((d) => [d.id, d.data() as DatosPrivados]))),
        () => setPrivados({}),
      ),
      onSnapshot(
        collection(db, "pagosSuscripcion"),
        (s) => setPagosSuscripcion(s.docs.map((d) => d.data() as PagoSuscripcion)),
        () => setPagosSuscripcion([]),
      ),
      onSnapshot(
        collection(db, "eventos"),
        (s) => setEventos(s.docs.map((d) => d.data() as Evento).sort((a, b) => b.creado - a.creado)),
        () => setEventos([]),
      ),
    ];
    return () => quitar.forEach((f) => f());
  }, [activo]);

  return {
    creadores: creadores ?? [],
    productos: productos ?? [],
    pedidos: pedidos ?? [],
    privados,
    pagosSuscripcion,
    eventos,
    listo: creadores !== null && productos !== null && pedidos !== null,
  };
}

export const cobrados = (pedidos: Pedido[]) => pedidos.filter((p) => ["pagado", "enviado", "entregado"].includes(p.estado));
