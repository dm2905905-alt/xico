"use client";

import type { User } from "firebase/auth";
import type { Creador } from "@/lib/datos";
import { crearTienda, useMiCreador } from "@/lib/panel";
import { FormularioEntrar } from "../FormularioEntrar";
import { useSesion } from "../Sesion";
import { FormularioTienda } from "./FormularioTienda";

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

  if (!creador) {
    return (
      <div className="rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60 sm:p-8">
        <h2 className="font-display text-2xl font-semibold">Abre tu tienda en XICO</h2>
        <p className="mt-1 mb-6 text-sm text-cafe">
          Cuéntanos de tu taller. Podrás cambiar todo después. La insignia de <strong>Artista verificado</strong> la otorga el
          equipo de XICO al revisar tu trabajo.
        </p>
        <FormularioTienda
          textoBoton="Abrir mi tienda"
          alGuardar={async (datos) => {
            await crearTienda(usuario.uid, datos);
          }}
        />
      </div>
    );
  }

  return <>{children(creador, usuario)}</>;
}
