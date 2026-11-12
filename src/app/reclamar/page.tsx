import type { Metadata } from "next";
import { Suspense } from "react";
import { ReclamarTienda } from "@/components/ReclamarTienda";

export const metadata: Metadata = { title: "Acepta tu tienda", robots: { index: false } };

export default function Reclamar() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Suspense fallback={<div className="h-40 animate-pulse rounded-3xl bg-arena" />}>
        <ReclamarTienda />
      </Suspense>
    </div>
  );
}
