import type { Metadata } from "next";
import { Suspense } from "react";
import { ListaConversaciones } from "@/components/chat/ListaConversaciones";
import { VistaChat } from "@/components/chat/VistaChat";

export const metadata: Metadata = { title: "Mensajes", robots: { index: false } };

export default function Chat({ params }: PageProps<"/mensajes/[id]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-arena" />}>
        {params.then(({ id }) => (
          <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
            <div className="hidden max-h-[calc(100dvh-13rem)] overflow-y-auto lg:block">
              <ListaConversaciones activa={id} />
            </div>
            <VistaChat id={id} />
          </div>
        ))}
      </Suspense>
    </div>
  );
}
