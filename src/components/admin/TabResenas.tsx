"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { Trash2 } from "lucide-react";
import { obtenerDb } from "@/lib/firebase";
import { fechaResena, type Resena } from "@/lib/resenas";
import { Estrellas } from "../Resenas";
import { useSesion } from "../Sesion";
import { llamar, type DatosAdmin } from "./datos";

// Todas las reseñas, para borrar las que no cumplan las reglas (groserías, spam, datos personales)
export function TabResenas({ datos }: { datos: DatosAdmin }) {
  const { usuario } = useSesion();
  const [lista, setLista] = useState<Resena[] | null>(null);
  const [filtro, setFiltro] = useState<"todas" | "bajas">("todas");
  const [error, setError] = useState("");

  useEffect(() => {
    const db = obtenerDb();
    if (!db) return;
    return onSnapshot(
      collection(db, "resenas"),
      (s) => setLista(s.docs.map((d) => d.data() as Resena).sort((a, b) => b.fecha - a.fecha)),
      () => setLista([]),
    );
  }, []);

  async function borrar(r: Resena) {
    if (!usuario || !window.confirm(`¿Borrar la opinión de ${r.nombre}? Se recalculan las estrellas.`)) return;
    setError("");
    try {
      await llamar(usuario, "/api/resenas", { borrar: r.id });
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const taller = (slug: string) => datos.creadores.find((c) => c.slug === slug)?.taller ?? slug;
  const visibles = (lista ?? []).filter((r) => filtro === "todas" || r.estrellas <= 2);

  return (
    <div className="grid gap-4">
      <p className="rounded-2xl bg-maiz/15 p-4 text-sm text-cafe">
        Solo quien compró puede opinar, y los teléfonos o correos se ocultan solos. Aquí puedes borrar opiniones con groserías o que no tengan que ver con la compra.
      </p>
      <div className="flex gap-2">
        {(
          [
            ["todas", "Todas"],
            ["bajas", "1 y 2 estrellas"],
          ] as const
        ).map(([id, texto]) => (
          <button key={id} onClick={() => setFiltro(id)} className={`rounded-full px-4 py-1.5 text-sm ${filtro === id ? "bg-tinta text-crema" : "bg-white ring-1 ring-arena-oscura"}`}>
            {texto}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa">{error}</p>}
      <ul className="grid gap-2">
        {visibles.map((r) => (
          <li key={r.id} className="rounded-2xl bg-white p-4 text-sm ring-1 ring-arena-oscura/60">
            <div className="flex flex-wrap items-center gap-2">
              <Estrellas valor={r.estrellas} />
              <span className="font-semibold">{r.nombre}</span>
              <span className="text-xs text-cafe">{fechaResena(r.fecha)}</span>
              <button onClick={() => borrar(r)} className="ml-auto flex items-center gap-1 rounded-full px-3 py-1 text-xs text-rosa ring-1 ring-rosa/40 hover:bg-rosa/10">
                <Trash2 className="size-3.5" /> Borrar
              </button>
            </div>
            <p className="mt-1 text-xs text-cafe">
              {r.tipo === "producto" ? (
                <Link href={`/producto/${r.objetivo}`} className="underline">
                  {r.producto ?? r.objetivo}
                </Link>
              ) : (
                "Tienda"
              )}{" "}
              · {taller(r.creador)}
            </p>
            {r.texto && <p className="mt-2 whitespace-pre-line">{r.texto}</p>}
          </li>
        ))}
        {lista && !visibles.length && <li className="text-sm text-cafe">No hay opiniones aquí.</li>}
      </ul>
    </div>
  );
}
