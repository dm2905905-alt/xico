import type { Metadata } from "next";
import { VistaFavoritos } from "@/components/VistaFavoritos";

export const metadata: Metadata = {
  title: "Tus favoritos",
  robots: { index: false },
};

export default function Favoritos() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-4 md:py-8">
      <h1 className="mb-4 font-display text-2xl font-bold tracking-tight sm:text-4xl">Tus favoritos</h1>
      <VistaFavoritos />
    </div>
  );
}
