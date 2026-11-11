"use client";

import Link from "next/link";
import { guardarTienda, useProductosDe } from "@/lib/panel";
import type { Creador } from "@/lib/datos";
import { ConTienda } from "./ConTienda";
import { FormularioTienda } from "./FormularioTienda";

export function VistaPerfil() {
  return <ConTienda volver="/panel/perfil">{(creador) => <Perfil creador={creador} />}</ConTienda>;
}

function Perfil({ creador }: { creador: Creador }) {
  const { productos } = useProductosDe(creador.slug);
  return (
    <div className="grid gap-6">
      <div className="rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60 sm:p-8">
        <Link href="/panel" className="text-sm text-cafe hover:underline">← Volver a mi tienda</Link>
        <h2 className="mt-3 mb-6 font-display text-2xl font-semibold">Perfil de la tienda</h2>
        <FormularioTienda inicial={creador} textoBoton="Guardar cambios" alGuardar={(datos) => guardarTienda(creador, datos, productos)} />
      </div>
      <Link href="/panel/cuenta" className="rounded-3xl bg-white p-5 text-sm ring-1 ring-arena-oscura/60 hover:ring-terracota">
        💳 Tu cuenta de pago y tu dirección de recolección están en <strong className="text-terracota">Mi cuenta de vendedor →</strong>
      </Link>
    </div>
  );
}
