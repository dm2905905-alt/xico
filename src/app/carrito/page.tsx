import type { Metadata } from "next";
import { VistaCarrito } from "@/components/VistaCarrito";

export const metadata: Metadata = {
  title: "Tu carrito",
  robots: { index: false },
};

export default function Carrito() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Tu carrito</h1>
      <VistaCarrito />
    </div>
  );
}
