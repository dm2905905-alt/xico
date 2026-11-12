"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Loader2, Store } from "lucide-react";
import { FormularioEntrar } from "./FormularioEntrar";
import { useSesion } from "./Sesion";

// Liga de invitación: la persona entra con su cuenta y la tienda queda a su nombre
export function ReclamarTienda() {
  const codigo = useSearchParams().get("codigo") ?? "";
  const { usuario, cargando } = useSesion();
  const router = useRouter();
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  async function aceptar() {
    if (!usuario) return;
    setOcupado(true);
    setError("");
    try {
      const r = await fetch("/api/tiendas/reclamar", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await usuario.getIdToken()}` },
        body: JSON.stringify({ codigo }),
      });
      const datos = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(datos.error ?? "No se pudo aceptar la invitación.");
      router.push("/panel/cuenta");
    } catch (e) {
      setError((e as Error).message);
      setOcupado(false);
    }
  }

  if (!codigo) return <p className="text-cafe">Esta liga no tiene código de invitación.</p>;
  if (cargando) return <div className="h-40 animate-pulse rounded-3xl bg-arena" />;

  return (
    <div className="grid max-w-md gap-4 rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60">
      <Store className="size-10 text-terracota" />
      <h1 className="font-display text-2xl font-bold">Te prepararon una tienda en XICO</h1>
      <p className="text-sm text-cafe">
        Acepta la invitación con tu cuenta y la tienda quedará a tu nombre. Después agrega tu cuenta de cobro (CLABE) y tu dirección, y sube tus productos.
        Tienes 3 meses sin mensualidad desde hoy.
      </p>
      {usuario ? (
        <>
          <button onClick={aceptar} disabled={ocupado} className="flex items-center justify-center gap-2 rounded-full bg-terracota px-5 py-2.5 font-semibold text-crema disabled:opacity-60">
            {ocupado && <Loader2 className="size-4 animate-spin" />} Aceptar mi tienda
          </button>
          <p className="text-xs text-cafe">Entraste como {usuario.email ?? usuario.phoneNumber}.</p>
        </>
      ) : (
        <FormularioEntrar volver={`/reclamar?codigo=${encodeURIComponent(codigo)}`} />
      )}
      {error && <p role="alert" className="text-sm text-rosa">{error}</p>}
    </div>
  );
}
