"use client";

import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { llamar } from "./datos";

type Estado = { conectado: boolean; prueba?: boolean; cuenta?: string; correo?: string; error?: string };

// Muestra si los cobros van a una cuenta real o a la de prueba
export function EstadoMercadoPago({ usuario }: { usuario: User }) {
  const [estado, setEstado] = useState<Estado | null>(null);
  useEffect(() => {
    let activo = true;
    llamar<Estado>(usuario, "/api/admin/mercadopago", {})
      .then((r) => activo && setEstado(r))
      .catch((e) => activo && setEstado({ conectado: false, error: (e as Error).message }));
    return () => {
      activo = false;
    };
  }, [usuario]);

  if (!estado) return <div className="h-20 animate-pulse rounded-3xl bg-arena" />;
  const real = estado.conectado && !estado.prueba;
  return (
    <section className={`rounded-3xl p-5 ring-1 ${real ? "bg-jade/10 ring-jade/40" : "bg-maiz/20 ring-maiz/60"}`}>
      <h2 className="font-display text-lg font-semibold">💳 Mercado Pago</h2>
      {!estado.conectado ? (
        <p className="mt-1 text-sm text-rosa">No conectado. {estado.error}</p>
      ) : real ? (
        <p className="mt-1 text-sm">
          ✅ <strong>Cobros reales.</strong> El dinero llega a la cuenta <strong>{estado.cuenta}</strong>
          {estado.correo && <> ({estado.correo})</>}.
        </p>
      ) : (
        <p className="mt-1 text-sm">
          🧪 <strong>Modo de prueba</strong> (cuenta {estado.cuenta}). Los pagos no son reales y no llega dinero.
        </p>
      )}
    </section>
  );
}
