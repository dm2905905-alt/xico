import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { consultas, obtenerCatalogo } from "@/lib/catalogo";
import { estados } from "@/lib/datos";

export const metadata: Metadata = {
  title: "Explora México: compra por estado",
  description: "Descubre productos hechos a mano por creadores de cada estado de México.",
};

export default async function Estados() {
  const { creadoresDeEstado, productosDeEstado } = consultas(await obtenerCatalogo());
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Explora México</h1>
      <p className="mt-2 max-w-2xl text-cafe">
        Cada estado tiene sus técnicas y tradiciones. Elige uno y conoce a sus creadores.
      </p>

      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {estados.map((e) => {
          const nCreadores = creadoresDeEstado(e.slug).length;
          const nProductos = productosDeEstado(e.slug).length;
          return (
            <li key={e.slug}>
              <Link
                href={`/estado/${e.slug}`}
                className="patron-picado flex h-48 flex-col justify-end rounded-3xl p-5 text-white transition hover:brightness-110"
                style={{ background: `linear-gradient(160deg, ${e.colores[1]}, ${e.colores[0]})` }}
              >
                <span className="flex items-center gap-1.5 font-display text-2xl font-semibold">
                  <MapPin className="size-5" /> {e.nombre}
                </span>
                <span className="text-sm text-white/90">{e.especialidad}</span>
                <span className="mt-2 text-xs text-white/75">
                  {nCreadores} {nCreadores === 1 ? "creador" : "creadores"} · {nProductos}{" "}
                  {nProductos === 1 ? "producto" : "productos"}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
