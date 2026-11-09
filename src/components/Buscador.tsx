"use client";

import Form from "next/form";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

const ideas = [
  "funda pintada",
  "globo personalizado",
  "cuadro de Frida",
  "vela de copal",
  "aretes de plata",
  "regalo para mamá",
];

export function Buscador({ grande = false }: { grande?: boolean }) {
  const [i, setI] = useState(0);

  // Cambia la idea de búsqueda cada 3 segundos
  useEffect(() => {
    const t = setInterval(() => setI((n) => (n + 1) % ideas.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <Form action="/buscar" role="search" className="relative w-full">
      <label htmlFor={grande ? "q-grande" : "q"} className="sr-only">
        ¿Qué estás buscando?
      </label>
      <input
        id={grande ? "q-grande" : "q"}
        name="q"
        type="search"
        placeholder={`¿Qué estás buscando? Prueba “${ideas[i]}”`}
        className={`w-full rounded-full border border-arena-oscura bg-white pr-14 text-tinta placeholder:text-cafe/70 shadow-sm outline-none transition focus:border-terracota focus:ring-4 focus:ring-terracota/15 ${
          grande ? "h-14 pl-6 text-base" : "h-11 pl-5 text-sm"
        }`}
      />
      <button
        type="submit"
        aria-label="Buscar"
        className={`absolute top-1/2 right-1.5 grid -translate-y-1/2 place-items-center rounded-full bg-terracota text-crema transition hover:bg-terracota-oscura ${
          grande ? "size-11" : "size-8"
        }`}
      >
        <Search className={grande ? "size-5" : "size-4"} />
      </button>
    </Form>
  );
}
