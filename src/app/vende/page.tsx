import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Camera, HandCoins, Sparkles, Store, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Vende en XICO",
  description: "Abre tu tienda con 3 meses gratis y vende tus productos hechos a mano a todo México.",
};

const pasos = [
  { icono: Store, titulo: "Abre tu tienda", texto: "Entra con Google o tu celular y llena tu solicitud: tu taller, tu cuenta para cobrar y tu dirección." },
  { icono: Camera, titulo: "Sube tus productos", texto: "Ponles precio, descripción y las opciones que el cliente puede personalizar." },
  { icono: HandCoins, titulo: "Vende y cobra", texto: "XICO cobra por ti y cada semana te deposita tu parte en tu cuenta. Tú solo creas y envías." },
];

const beneficios = [
  { icono: Sparkles, texto: "Personalización: nombres, colores, fotos de referencia y extras con costo." },
  { icono: BadgeCheck, texto: "Insignias de Artista verificado y Top vendedor que dan confianza." },
  { icono: HandCoins, texto: "3 meses gratis. Después, $400 al mes más 15% de comisión solo cuando vendes. Sin contratos: si no pagas, tu tienda solo se pausa." },
  { icono: Truck, texto: "Envíos a todo México con guía y seguimiento." },
];

export default function Vende() {
  return (
    <>
      <section className="degradado-xico relative overflow-hidden text-white">
        <div className="patron-picado absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 py-10 text-center sm:py-20">
          <h1 className="font-display text-3xl leading-tight font-bold tracking-tight text-balance sm:text-6xl">
            Tus manos crean. <span className="italic">Nosotros te llevamos a todo México.</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-crema/90 sm:text-lg">
            Abre tu tienda en XICO, el marketplace de lo hecho a mano, con 3 meses gratis. Revisamos cada solicitud: solo creadores reales, sin reventa ni importados.
          </p>
          <Link href="/panel" className="mt-8 inline-block rounded-full bg-crema px-8 py-4 text-lg font-semibold text-terracota-oscura transition hover:bg-white">
            Empezar mis 3 meses gratis
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-5xl px-4 sm:mt-16">
        <h2 className="font-display text-xl font-bold sm:text-center sm:text-3xl">Así de fácil</h2>
        <ol className="mt-4 grid gap-3 sm:mt-8 sm:grid-cols-3 sm:gap-4">
          {pasos.map((p, i) => (
            <li key={p.titulo} className="flex items-start gap-3 rounded-3xl bg-white p-4 ring-1 ring-arena-oscura/60 sm:block sm:p-6">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-terracota font-bold text-crema">{i + 1}</span>
              <span className="block">
                <h3 className="flex items-center gap-2 font-display text-lg font-semibold sm:mt-4 sm:text-xl">
                  <p.icono className="size-5 text-terracota" /> {p.titulo}
                </h3>
                <p className="mt-1 text-sm text-cafe">{p.texto}</p>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-8 max-w-3xl px-4 sm:mt-14">
        <ul className="grid gap-3 rounded-3xl bg-white p-5 ring-1 ring-arena-oscura">
          {beneficios.map((b) => (
            <li key={b.texto} className="flex items-start gap-3 rounded-2xl bg-arena/60 p-4">
              <b.icono className="size-6 shrink-0 text-jade" />
              <span>{b.texto}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 rounded-2xl border-2 border-dashed border-terracota/40 bg-papel p-5 text-center text-sm text-cafe">
          <strong className="text-tinta">Regla de oro:</strong> en XICO solo se vende lo que tú haces. Los productos importados o
          de reventa se retiran de la tienda.
        </p>
        <div className="mt-8 hidden text-center md:block">
          <Link href="/panel" className="inline-block rounded-full bg-terracota px-8 py-4 font-semibold text-crema hover:bg-terracota-oscura">
            Empezar ahora
          </Link>
        </div>
      </section>

      {/* Celular: botón fijo arriba de la barra inferior */}
      <div className="sticky bottom-20 z-30 mt-6 px-4 md:hidden">
        <Link href="/panel" className="degradado-xico flex h-12 items-center justify-center rounded-full font-semibold text-white shadow-lg shadow-terracota/30">
          Empezar mis 3 meses gratis
        </Link>
      </div>
    </>
  );
}
