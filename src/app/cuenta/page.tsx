import type { Metadata } from "next";
import { VistaCuenta } from "@/components/VistaCuenta";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false },
};

export default function Cuenta() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Mi cuenta</h1>
      <VistaCuenta />
    </div>
  );
}
