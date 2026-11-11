import type { Metadata } from "next";
import { VistaPagar } from "@/components/VistaPagar";

export const metadata: Metadata = {
  title: "Pagar",
  robots: { index: false },
};

export default function Pagar() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:py-8">
      <h1 className="mb-4 font-display text-2xl font-bold tracking-tight sm:text-4xl">Finalizar compra</h1>
      <VistaPagar />
    </div>
  );
}
