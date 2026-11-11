import type { Metadata } from "next";
import { VistaCuenta } from "@/components/panel/VistaCuenta";

export const metadata: Metadata = {
  title: "Mi cuenta de vendedor",
  robots: { index: false },
};

export default function CuentaVendedor() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <VistaCuenta />
    </div>
  );
}
