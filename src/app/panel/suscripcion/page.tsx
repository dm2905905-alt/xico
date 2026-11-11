import type { Metadata } from "next";
import { Suspense } from "react";
import { VistaSuscripcion } from "@/components/panel/VistaSuscripcion";

export const metadata: Metadata = {
  title: "Mensualidad",
  robots: { index: false },
};

export default function Mensualidad() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-4 md:py-8">
      <Suspense fallback={<div className="h-64 animate-pulse rounded-3xl bg-arena" />}>
        <VistaSuscripcion />
      </Suspense>
    </div>
  );
}
