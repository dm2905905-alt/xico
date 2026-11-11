import Link from "next/link";

export function Logo({ claro = false }: { claro?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="XICO, ir al inicio">
      <span className="degradado-xico grid size-9 -rotate-6 place-items-center rounded-xl font-display text-lg font-extrabold text-white shadow-md shadow-rosa/30">
        X
      </span>
      <span className={`font-display text-2xl font-extrabold tracking-tight ${claro ? "text-white" : "texto-degradado"}`}>XICO</span>
    </Link>
  );
}
