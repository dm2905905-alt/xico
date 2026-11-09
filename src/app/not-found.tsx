import Link from "next/link";

export default function NoEncontrado() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="font-display text-6xl font-semibold text-terracota">404</p>
      <h1 className="mt-4 font-display text-2xl font-semibold">Esta página todavía está en el taller</h1>
      <p className="mt-2 text-cafe">La estamos construyendo o ya no existe.</p>
      <Link href="/" className="mt-8 inline-block rounded-full bg-terracota px-6 py-3 font-semibold text-crema hover:bg-terracota-oscura">
        Volver al inicio
      </Link>
    </div>
  );
}
