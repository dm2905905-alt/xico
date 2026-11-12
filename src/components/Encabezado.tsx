import Link from "next/link";
import { Gift, MapPin } from "lucide-react";
import { Buscador } from "./Buscador";
import { IconosCuenta } from "./IconosCuenta";
import { Logo } from "./Logo";
import { MenuMovil } from "./MenuMovil";

// Encabezado estilo app: logo + buscador + cuenta en una sola fila.
// En celular el buscador va abajo del logo y la navegación vive en la barra inferior.
export function Encabezado() {
  return (
    <header className="encabezado-libreta sticky top-0 z-40 bg-crema/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 pt-3 pb-2 md:gap-5 md:py-3">
        <MenuMovil />
        <Logo />

        <div className="hidden flex-1 md:block">
          <Buscador />
        </div>

        <nav className="hidden items-center gap-1 text-sm font-medium lg:flex" aria-label="Accesos">
          <Link href="/estados" className="flex items-center gap-1.5 rounded-full px-3 py-2 hover:bg-arena">
            <MapPin className="size-4 text-jade" /> Mapa
          </Link>
          <Link href="/regalos" className="flex items-center gap-1.5 rounded-full px-3 py-2 hover:bg-arena">
            <Gift className="size-4 text-rosa" /> Regalos
          </Link>
          <Link href="/vende" className="rounded-full px-3 py-2 font-semibold text-terracota hover:bg-terracota/10">
            Vende
          </Link>
        </nav>

        <IconosCuenta />
      </div>

      {/* Buscador en celular */}
      <div className="px-4 pb-3 md:hidden">
        <Buscador />
      </div>
    </header>
  );
}
