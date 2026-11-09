"use client";

import Link from "next/link";
import { Menu, X, MapPin, Play, Gift } from "lucide-react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { categorias } from "@/lib/datos";
import { IconoCategoria } from "./IconoCategoria";
import { Logo } from "./Logo";

export function MenuMovil() {
  const [abierto, setAbierto] = useState(false);

  // Evita que la página de fondo se desplace con el menú abierto
  useEffect(() => {
    document.body.style.overflow = abierto ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [abierto]);

  const cerrar = () => setAbierto(false);

  return (
    <>
      <button
        onClick={() => setAbierto(true)}
        aria-label="Abrir menú"
        className="grid size-10 place-items-center rounded-full text-tinta hover:bg-arena lg:hidden"
      >
        <Menu className="size-6" />
      </button>

      {/* Se dibuja en <body> para que el desenfoque del encabezado no lo recorte */}
      {abierto && createPortal(
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menú">
          <div className="absolute inset-0 bg-tinta/40" onClick={cerrar} />
          <nav className="absolute inset-y-0 left-0 flex w-[85%] max-w-sm flex-col overflow-y-auto bg-crema p-5 shadow-xl">
            <div className="mb-6 flex items-center justify-between">
              <Logo />
              <button onClick={cerrar} aria-label="Cerrar menú" className="grid size-10 place-items-center rounded-full hover:bg-arena">
                <X className="size-6" />
              </button>
            </div>

            <div className="mb-6 grid gap-2">
              <Link href="/descubre" onClick={cerrar} className="flex items-center gap-3 rounded-xl bg-tinta px-4 py-3 font-medium text-crema">
                <Play className="size-5" /> Descubre: así se hace
              </Link>
              <Link href="/regalos" onClick={cerrar} className="flex items-center gap-3 rounded-xl bg-rosa px-4 py-3 font-medium text-white">
                <Gift className="size-5" /> Encuentra un regalo
              </Link>
              <Link href="/estados" onClick={cerrar} className="flex items-center gap-3 rounded-xl bg-jade px-4 py-3 font-medium text-white">
                <MapPin className="size-5" /> Explora México
              </Link>
            </div>

            <p className="mb-2 text-xs font-semibold tracking-wider text-cafe uppercase">Categorías</p>
            <ul className="grid gap-1">
              {categorias.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/categoria/${c.slug}`}
                    onClick={cerrar}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-arena"
                  >
                    <IconoCategoria slug={c.slug} className="size-5 text-terracota" />
                    {c.nombre}
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/vende"
              onClick={cerrar}
              className="mt-auto rounded-xl border-2 border-terracota px-4 py-3 text-center font-semibold text-terracota"
            >
              ¿Eres creador? Vende en XICO
            </Link>
          </nav>
        </div>,
        document.body,
      )}
    </>
  );
}
