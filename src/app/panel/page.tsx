import type { Metadata } from "next";
import { VistaPanel } from "@/components/panel/VistaPanel";

export const metadata: Metadata = {
  title: "Mi tienda",
  robots: { index: false },
};

export default function Panel() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-4 md:py-8">
      <h1 className="sr-only">Mi tienda</h1>
      <VistaPanel />
    </div>
  );
}
