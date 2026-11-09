import Link from "next/link";

export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="XICO, ir al inicio">
      <span className="grid size-9 place-items-center rounded-xl bg-terracota font-display text-lg font-bold text-crema">
        X
      </span>
      <span className={`font-display text-2xl font-bold tracking-tight ${claro ? "text-crema" : "text-tinta"}`}>
        XICO
      </span>
    </Link>
  );
}
