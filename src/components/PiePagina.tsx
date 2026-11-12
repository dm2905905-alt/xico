import Link from "next/link";
import { categorias, estados } from "@/lib/datos";
import { MessageCircle } from "lucide-react";
import { Logo } from "./Logo";

// Datos del desarrollador de la página (autopromoción)
const desarrollador = {
  nombre: "Damian M.",
  instagram: "dam14n01",
  telefono: "452 132 6295",
  whatsapp: "524521326295",
};
const mensajeWhatsApp = encodeURIComponent("Hola Damian, vi tu trabajo en XICO y quiero desarrollar una idea.");

function IconoInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

export function PiePagina() {
  return (
    <footer className="mt-20 bg-tinta text-crema/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo claro />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            El marketplace de la gente creativa de México: diseñadores, ilustradores, artesanos y emprendedores. Cada pieza está hecha a mano por quien la
            vende, sin reventa ni importados.
          </p>
        </div>

        <div>
          <h2 className="mb-3 font-display text-base font-semibold text-crema">Compra</h2>
          <ul className="grid gap-2 text-sm">
            {categorias.slice(0, 5).map((c) => (
              <li key={c.slug}>
                <Link href={`/categoria/${c.slug}`} className="hover:text-maiz">{c.nombre}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 font-display text-base font-semibold text-crema">Por estado</h2>
          <ul className="grid gap-2 text-sm">
            {estados.slice(0, 5).map((e) => (
              <li key={e.slug}>
                <Link href={`/estado/${e.slug}`} className="hover:text-maiz">{e.nombre}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-3 font-display text-base font-semibold text-crema">XICO</h2>
          <ul className="grid gap-2 text-sm">
            <li><Link href="/vende" className="hover:text-maiz">Vende en XICO</Link></li>
            <li><Link href="/ayuda" className="hover:text-maiz">Centro de ayuda</Link></li>
            <li><Link href="/envios" className="hover:text-maiz">Reglas de envío</Link></li>
            <li><Link href="/terminos" className="hover:text-maiz">Términos y condiciones</Link></li>
            <li><Link href="/privacidad" className="hover:text-maiz">Aviso de privacidad</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-crema/10 px-4 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="font-display text-base font-semibold text-crema">Desarrollado por {desarrollador.nombre}</p>
            <p className="mt-1 max-w-md text-sm">
              Contáctate al {desarrollador.telefono} para desarrollar tus ideas web, aplicaciones o juegos.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <a
              href={`https://www.instagram.com/${desarrollador.instagram}/`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-crema ring-1 ring-crema/25 hover:bg-crema/10"
            >
              <IconoInstagram className="h-4 w-4" />@{desarrollador.instagram}
            </a>
            <a
              href={`https://wa.me/${desarrollador.whatsapp}?text=${mensajeWhatsApp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-crema ring-1 ring-crema/25 hover:bg-crema/10"
            >
              <MessageCircle className="h-4 w-4" />
              {desarrollador.telefono}
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-crema/10 px-4 py-5 text-center text-xs text-crema/50">
        © XICO · Hecho en México · Desarrollado por {desarrollador.nombre}
      </div>
    </footer>
  );
}
