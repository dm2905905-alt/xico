import type { Metadata } from "next";
import { VistaAvisos } from "@/components/VistaAvisos";

export const metadata: Metadata = { title: "Avisos", robots: { index: false } };

export default function Avisos() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-4 md:py-8">
      <h1 className="mb-4 font-display text-2xl font-bold tracking-tight sm:text-4xl">Avisos</h1>
      <VistaAvisos />
    </div>
  );
}
