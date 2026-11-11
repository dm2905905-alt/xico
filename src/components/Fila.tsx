"use client";

import Link from "next/link";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Ancho de cada elemento (escrito completo para que Tailwind lo detecte)
const anchos = {
  producto: "*:w-40 sm:*:w-48 lg:*:w-52",
  banner: "*:w-[85%] sm:*:w-[420px]",
  creador: "*:w-20 sm:*:w-24",
  chip: "*:w-auto",
};

// Fila que se desliza de lado (estilo app). En computadora tiene flechas.
export function Fila({
  titulo,
  verTodo,
  tamano = "producto",
  children,
}: {
  titulo: React.ReactNode;
  verTodo?: string;
  tamano?: keyof typeof anchos;
  children: React.ReactNode;
}) {
  const caja = useRef<HTMLDivElement>(null);
  const mover = (dir: 1 | -1) => caja.current?.scrollBy({ left: dir * caja.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <section className="mx-auto mt-7 max-w-7xl md:mt-10">
      <div className="mb-3 flex items-center justify-between gap-3 px-4">
        <h2 className="font-display text-lg font-bold tracking-tight sm:text-2xl">{titulo}</h2>
        <div className="flex items-center gap-1">
          {verTodo && (
            <Link href={verTodo} className="flex items-center rounded-full px-2 py-1 text-sm font-semibold text-terracota hover:bg-terracota/10">
              Ver todo <ChevronRight className="size-4" />
            </Link>
          )}
          <button onClick={() => mover(-1)} aria-label="Anterior" className="hidden size-9 place-items-center rounded-full bg-white ring-1 ring-arena-oscura hover:bg-arena md:grid">
            <ChevronLeft className="size-4" />
          </button>
          <button onClick={() => mover(1)} aria-label="Siguiente" className="hidden size-9 place-items-center rounded-full bg-white ring-1 ring-arena-oscura hover:bg-arena md:grid">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div ref={caja} className={`sin-barra flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 *:shrink-0 *:snap-start sm:gap-4 ${anchos[tamano]}`}>
        {children}
      </div>
    </section>
  );
}
