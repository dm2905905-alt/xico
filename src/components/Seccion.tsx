import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Seccion({
  titulo,
  subtitulo,
  verTodo,
  children,
}: {
  titulo: React.ReactNode;
  subtitulo?: string;
  verTodo?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto mt-14 max-w-7xl px-4">
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{titulo}</h2>
          {subtitulo && <p className="mt-1 text-sm text-cafe">{subtitulo}</p>}
        </div>
        {verTodo && (
          <Link href={verTodo} className="flex shrink-0 items-center text-sm font-semibold text-terracota hover:underline">
            Ver todo <ChevronRight className="size-4" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

// Fila deslizable en celular, cuadrícula en pantallas grandes
export function Carrusel({ children }: { children: React.ReactNode }) {
  return (
    <div className="sin-barra -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 *:w-44 *:shrink-0 *:snap-start sm:*:w-52 lg:mx-0 lg:grid lg:grid-cols-5 lg:overflow-visible lg:px-0 lg:*:w-auto">
      {children}
    </div>
  );
}
