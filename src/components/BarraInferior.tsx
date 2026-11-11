"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Home, LayoutGrid, MapPin, User } from "lucide-react";
import { useCarrito } from "@/lib/carrito";
import { useFavoritos } from "@/lib/favoritos";

const botones = [
  { href: "/", texto: "Inicio", icono: Home, activo: (r: string) => r === "/" },
  { href: "/buscar", texto: "Explorar", icono: LayoutGrid, activo: (r: string) => r.startsWith("/buscar") || r.startsWith("/categoria") },
  { href: "/estados", texto: "Mapa", icono: MapPin, activo: (r: string) => r.startsWith("/estado") },
  { href: "/favoritos", texto: "Favoritos", icono: Heart, activo: (r: string) => r.startsWith("/favoritos") },
  { href: "/cuenta", texto: "Cuenta", icono: User, activo: (r: string) => r.startsWith("/cuenta") || r.startsWith("/panel") },
];

// Pantallas con su propia barra abajo (chat, pagar, comprar un producto) o de trabajo: sin barra
const sinBarra = (r: string) => /^\/mensajes\/.+/.test(r) || r.startsWith("/pagar") || r.startsWith("/producto/") || r.startsWith("/admin") || r.startsWith("/panel/producto");

// Barra de botones fija abajo, solo en celular (como una app)
export function BarraInferior() {
  const ruta = usePathname();
  const favoritos = useFavoritos().length;
  const enCarrito = useCarrito().length;
  // El carrito con productos tiene su propio botón de pago fijo abajo
  if (sinBarra(ruta) || (ruta.startsWith("/carrito") && enCarrito > 0)) return null;

  return (
    <>
      {/* Espacio para que el contenido no quede debajo de la barra */}
      <div className="h-16 md:hidden" aria-hidden />
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-arena-oscura/70 bg-crema/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        aria-label="Navegación principal"
      >
        <ul className="grid grid-cols-5">
          {botones.map((b) => {
            const activo = b.activo(ruta);
            return (
              <li key={b.href}>
                <Link
                  href={b.href}
                  aria-current={activo ? "page" : undefined}
                  className={`relative flex h-16 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${activo ? "text-terracota" : "text-cafe"}`}
                >
                  <span className={`grid h-7 w-12 place-items-center rounded-full transition ${activo ? "bg-terracota/12" : ""}`}>
                    <b.icono className="size-5" strokeWidth={activo ? 2.4 : 2} />
                  </span>
                  {b.texto}
                  {b.href === "/favoritos" && favoritos > 0 && (
                    <span className="absolute top-1.5 left-1/2 ml-2 grid h-4 min-w-4 place-items-center rounded-full bg-rosa px-1 text-[10px] font-bold text-white">
                      {favoritos > 99 ? "99+" : favoritos}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
