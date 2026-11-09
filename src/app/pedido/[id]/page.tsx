import type { Metadata } from "next";
import { Suspense } from "react";
import { VistaPedido } from "@/components/VistaPedido";

export const metadata: Metadata = {
  title: "Tu pedido",
  robots: { index: false },
};

// Mercado Pago regresa aquí con ?payment_id=... (o collection_id en versiones anteriores)
export default function PaginaPedido({ params, searchParams }: PageProps<"/pedido/[id]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Tu pedido</h1>
      <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-arena" />}>
        {Promise.all([params, searchParams]).then(([{ id }, sp]) => {
          const uno = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
          const pago = uno(sp.payment_id) ?? uno(sp.collection_id);
          return <VistaPedido id={id} pagoId={pago && pago !== "null" ? pago : undefined} />;
        })}
      </Suspense>
    </div>
  );
}
