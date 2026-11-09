import Link from "next/link";
import { categorias, estados } from "@/lib/datos";
import { Logo } from "./Logo";

export function PiePagina() {
  return (
    <footer className="mt-20 bg-tinta text-crema/80">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Logo claro />
          <p className="mt-4 max-w-sm text-sm leading-relaxed">
            El marketplace de creadores, artesanos y emprendedores mexicanos. Cada pieza está hecha a mano por quien la
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
            <li><Link href="/terminos" className="hover:text-maiz">Términos y condiciones</Link></li>
            <li><Link href="/privacidad" className="hover:text-maiz">Aviso de privacidad</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-crema/10 px-4 py-5 text-center text-xs text-crema/50">
        © XICO · Hecho en México
      </div>
    </footer>
  );
}
