import type { Metadata } from "next";
import { VistaCuenta } from "@/components/VistaCuenta";

export const metadata: Metadata = {
  title: "Mi cuenta",
  robots: { index: false },
};

export default function Cuenta() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-4 md:py-8">
      <h1 className="sr-only">Mi cuenta</h1>
      <VistaCuenta />
    </div>
  );
}
