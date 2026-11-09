import type { Metadata } from "next";
import { Suspense } from "react";
import { EditorProducto } from "@/components/panel/EditorProducto";

export const metadata: Metadata = {
  title: "Editar producto",
  robots: { index: false },
};

export default function EditarProducto({ params }: PageProps<"/panel/producto/[slug]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-4 font-display text-3xl font-semibold tracking-tight">Editar producto</h1>
      <Suspense fallback={<div className="h-96 animate-pulse rounded-3xl bg-arena" />}>
        {params.then(({ slug }) => (
          <EditorProducto slug={slug} />
        ))}
      </Suspense>
    </div>
  );
}
