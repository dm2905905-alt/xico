import type { Metadata } from "next";
import { AsistenteRegalo } from "@/components/AsistenteRegalo";
import { obtenerCatalogo } from "@/lib/catalogo";
import { aTarjeta } from "@/lib/datos";

export const metadata: Metadata = {
  title: "Encuentra un regalo hecho a mano",
  description: "Dinos para quién es, la ocasión y tu presupuesto, y te sugerimos regalos hechos a mano por creadores mexicanos.",
};

export default async function Regalos() {
  const { productos } = await obtenerCatalogo();
  // Al navegador solo se mandan los datos que usa el asistente
  const ligeros = productos.map((p) => ({ ...aTarjeta(p), vendidos: p.vendidos }));

  return (
    <>
      <section className="relative overflow-hidden bg-rosa text-white">
        <div className="patron-picado absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-4 py-12 text-center">
          <p className="text-5xl" aria-hidden>🎁</p>
          <h1 className="mt-3 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Encuentra un regalo</h1>
          <p className="mx-auto mt-2 max-w-xl text-white/90">Tres preguntas y te mostramos piezas hechas a mano que le van a encantar.</p>
        </div>
      </section>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <AsistenteRegalo productos={ligeros} />
      </div>
    </>
  );
}
