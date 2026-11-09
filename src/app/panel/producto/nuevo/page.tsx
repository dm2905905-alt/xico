import type { Metadata } from "next";
import { EditorProducto } from "@/components/panel/EditorProducto";

export const metadata: Metadata = {
  title: "Nuevo producto",
  robots: { index: false },
};

export default function NuevoProducto() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 font-display text-3xl font-semibold tracking-tight">Nuevo producto</h1>
      <EditorProducto />
    </div>
  );
}
