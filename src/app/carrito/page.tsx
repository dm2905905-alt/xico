import type { Metadata } from "next";
import { VistaCarrito } from "@/components/VistaCarrito";

export const metadata: Metadata = {
  title: "Tu carrito",
  robots: { index: false },
};

export default function Carrito() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:py-8">
      <h1 className="mb-4 font-display text-2xl font-bold tracking-tight sm:text-4xl">Tu carrito</h1>
      <VistaCarrito enviaActivo={!!process.env.ENVIA_TOKEN} />
    </div>
  );
}
