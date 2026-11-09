import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { FormularioEntrar } from "@/components/FormularioEntrar";

export const metadata: Metadata = {
  title: "Entrar",
  robots: { index: false },
};

// Solo permite regresar a páginas de XICO (evita redirecciones a otros sitios)
const destinoSeguro = (v: unknown) => (typeof v === "string" && v.startsWith("/") && !v.startsWith("//") ? v : "/cuenta");

export default function Entrar({ searchParams }: PageProps<"/entrar">) {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60 sm:p-8">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Entra a XICO</h1>
        <p className="mt-2 text-sm text-cafe">Sin contraseñas: entra con tu cuenta de Google o con un código por SMS.</p>
        <div className="mt-6">
          <Suspense fallback={<div className="h-28 animate-pulse rounded-2xl bg-arena" />}>
            {searchParams.then((sp) => (
              <FormularioEntrar volver={destinoSeguro(sp.volver)} />
            ))}
          </Suspense>
        </div>
        <p className="mt-6 text-center text-xs text-cafe">
          Al continuar aceptas los <Link href="/terminos" className="underline">Términos</Link> y el{" "}
          <Link href="/privacidad" className="underline">Aviso de privacidad</Link>.
        </p>
      </div>
    </div>
  );
}
