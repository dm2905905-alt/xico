import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Camera, HandCoins, Sparkles, Store, Truck } from "lucide-react";

export const metadata: Metadata = {
  title: "Vende en XICO",
  description: "Abre tu tienda gratis y vende tus productos hechos a mano a todo México.",
};

const pasos = [
  { icono: Store, titulo: "Abre tu tienda", texto: "Entra con tu cuenta de Google y cuéntanos de tu taller. Toma 2 minutos." },
  { icono: Camera, titulo: "Sube tus productos", texto: "Ponles precio, descripción y las opciones que el cliente puede personalizar." },
  { icono: HandCoins, titulo: "Vende y cobra", texto: "XICO cobra por ti y te deposita tu parte. Tú solo creas y envías." },
];

const beneficios = [
  { icono: Sparkles, texto: "Personalización: nombres, colores, fotos de referencia y extras con costo." },
  { icono: BadgeCheck, texto: "Insignias de Artista verificado y Top vendedor que dan confianza." },
  { icono: Truck, texto: "Envíos a todo México con guía y seguimiento (próximamente)." },
];

export default function Vende() {
  return (
    <>
      <section className="relative overflow-hidden bg-terracota text-crema">
        <div className="patron-picado absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
          <h1 className="font-display text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl">
            Tus manos crean. <span className="italic">Nosotros te llevamos a todo México.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-crema/90">
            Abre tu tienda gratis en XICO, el marketplace de lo hecho a mano. Sin reventa ni importados: solo creadores reales.
          </p>
          <Link href="/panel" className="mt-8 inline-block rounded-full bg-crema px-8 py-4 text-lg font-semibold text-terracota-oscura transition hover:bg-white">
            Abrir mi tienda gratis
          </Link>
        </div>
      </section>

      <section className="mx-auto mt-16 max-w-5xl px-4">
        <h2 className="text-center font-display text-3xl font-semibold">Así de fácil</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-3">
          {pasos.map((p, i) => (
            <li key={p.titulo} className="rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60">
              <span className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-terracota font-bold text-crema">{i + 1}</span>
                <p.icono className="size-6 text-terracota" />
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold">{p.titulo}</h3>
              <p className="mt-1 text-sm text-cafe">{p.texto}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mx-auto mt-14 max-w-3xl px-4">
        <ul className="grid gap-3">
          {beneficios.map((b) => (
            <li key={b.texto} className="flex items-start gap-3 rounded-2xl bg-arena/60 p-4">
              <b.icono className="size-6 shrink-0 text-jade" />
              <span>{b.texto}</span>
            </li>
          ))}
        </ul>
        <p className="mt-8 rounded-2xl border-2 border-dashed border-terracota/40 p-5 text-center text-sm text-cafe">
          <strong className="text-tinta">Regla de oro:</strong> en XICO solo se vende lo que tú haces. Los productos importados o
          de reventa se retiran de la tienda.
        </p>
        <div className="mt-8 text-center">
          <Link href="/panel" className="inline-block rounded-full bg-terracota px-8 py-4 font-semibold text-crema hover:bg-terracota-oscura">
            Empezar ahora
          </Link>
        </div>
      </section>
    </>
  );
}
