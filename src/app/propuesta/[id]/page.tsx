import type { Metadata } from "next";
import { Suspense } from "react";
import { VistaPagoPropuesta } from "@/components/chat/VistaPagoPropuesta";

export const metadata: Metadata = { title: "Pagar propuesta", robots: { index: false } };

export default function PagarPropuesta({ params }: PageProps<"/propuesta/[id]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-extrabold tracking-tight sm:text-4xl">Aceptar y pagar</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-arena" />}>
        {params.then(({ id }) => (
          <VistaPagoPropuesta id={id} />
        ))}
      </Suspense>
    </div>
  );
}
