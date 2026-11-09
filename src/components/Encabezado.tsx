import Link from "next/link";
import { MapPin, Play, Gift } from "lucide-react";
import { categorias } from "@/lib/datos";
import { Buscador } from "./Buscador";
import { IconosCuenta } from "./IconosCuenta";
import { Logo } from "./Logo";
import { MenuMovil } from "./MenuMovil";

export function Encabezado() {
  return (
    <header className="sticky top-0 z-40 border-b border-arena-oscura/70 bg-crema/95 backdrop-blur">
      {/* Franja superior */}
      <div className="bg-tinta px-4 py-1.5 text-center text-xs text-crema/90">
        Envíos a todo México · <span className="font-semibold text-maiz">100% hecho por el artista</span>
      </div>

      {/* Fila principal */}
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 lg:gap-6">
        <MenuMovil />
        <Logo />

        <div className="hidden flex-1 md:block">
          <Buscador />
        </div>

        <IconosCuenta />
      </div>

      {/* Buscador en celular */}
      <div className="px-4 pb-3 md:hidden">
        <Buscador />
      </div>

      {/* Menú de categorías (escritorio) */}
      <nav className="hidden border-t border-arena-oscura/60 lg:block" aria-label="Categorías">
        <ul className="sin-barra mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 text-sm whitespace-nowrap">
          <li>
            <Link href="/descubre" className="flex items-center gap-1.5 rounded-full bg-tinta px-3 py-1.5 font-medium text-crema hover:bg-tinta/85">
              <Play className="size-3.5" /> Descubre
            </Link>
          </li>
          <li>
            <Link href="/regalos" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-rosa hover:bg-rosa/10">
              <Gift className="size-4" /> Encuentra un regalo
            </Link>
          </li>
          <li>
            <Link href="/estados" className="flex items-center gap-1.5 rounded-full px-3 py-1.5 font-medium text-jade hover:bg-jade/10">
              <MapPin className="size-4" /> Explora México
            </Link>
          </li>
          <li aria-hidden className="mx-2 h-5 w-px bg-arena-oscura" />
          {categorias.slice(0, 6).map((c, i) => (
            <li key={c.slug} className={i >= 4 ? "hidden xl:block" : undefined}>
              <Link href={`/categoria/${c.slug}`} className="rounded-full px-3 py-1.5 text-cafe hover:bg-arena hover:text-tinta">
                {c.nombre}
              </Link>
            </li>
          ))}
          <li className="ml-auto">
            <Link href="/vende" className="rounded-full px-3 py-1.5 font-semibold text-terracota hover:bg-terracota/10">
              Vende en XICO
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
