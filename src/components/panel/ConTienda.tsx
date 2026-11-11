"use client";

import type { User } from "firebase/auth";
import type { Creador } from "@/lib/datos";
import { useMiCreador } from "@/lib/panel";
import { FormularioEntrar } from "../FormularioEntrar";
import { useSesion } from "../Sesion";
import { SolicitudVendedor } from "./SolicitudVendedor";

// Envuelve las páginas del panel: pide sesión, y si la persona aún no tiene tienda, la registra.
export function ConTienda({
  volver,
  children,
}: {
  volver: string;
  children: (creador: Creador, usuario: User) => React.ReactNode;
}) {
  const { usuario, cargando: cargandoSesion, configurado } = useSesion();
  const { creador, cargando } = useMiCreador(usuario?.uid);

  if (!configurado) return <p className="text-cafe">Firebase no está configurado.</p>;
  if (cargandoSesion || (usuario && cargando)) return <div className="h-64 animate-pulse rounded-3xl bg-arena" />;

  if (!usuario) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60 sm:p-8">
        <h2 className="font-display text-2xl font-semibold">Entra para abrir tu tienda</h2>
        <p className="mt-1 mb-6 text-sm text-cafe">Usa tu cuenta de Google. No necesitas contraseña nueva.</p>
        <FormularioEntrar volver={volver} />
      </div>
    );
  }

  if (!creador) return <SolicitudVendedor uid={usuario.uid} />;

  return <>{children(creador, usuario)}</>;
}
