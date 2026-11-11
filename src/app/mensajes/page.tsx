import type { Metadata } from "next";
import { ListaConversaciones } from "@/components/chat/ListaConversaciones";

export const metadata: Metadata = { title: "Mensajes", robots: { index: false } };

export default function Mensajes() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-4 md:py-8">
      <h1 className="mb-4 font-display text-2xl font-bold tracking-tight sm:text-4xl">Mensajes</h1>
      <ListaConversaciones />
    </div>
  );
}
