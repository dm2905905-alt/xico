import type { Metadata } from "next";
import { ListaConversaciones } from "@/components/chat/ListaConversaciones";

export const metadata: Metadata = { title: "Mensajes", robots: { index: false } };

export default function Mensajes() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">💬 Mensajes</h1>
      <ListaConversaciones />
    </div>
  );
}
