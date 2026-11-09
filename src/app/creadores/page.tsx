import type { Metadata } from "next";
import { TarjetaCreador } from "@/components/TarjetaCreador";
import { obtenerCatalogo } from "@/lib/catalogo";

export const metadata: Metadata = {
  title: "Creadores y artesanos",
  description: "Conoce a los creadores y artesanos mexicanos que venden en XICO.",
};

export default async function Creadores() {
  const { creadores } = await obtenerCatalogo();
  const ordenados = [...creadores].sort((a, b) => Number(b.top) - Number(a.top) || b.calificacion - a.calificacion);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Creadores</h1>
      <p className="mt-2 max-w-2xl text-cafe">Las manos detrás de cada pieza. Todos están verificados y venden lo que hacen.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ordenados.map((c) => (
          <TarjetaCreador key={c.slug} creador={c} />
        ))}
      </div>
    </div>
  );
}
