import type { Metadata } from "next";
import { PanelAdmin } from "@/components/admin/PanelAdmin";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

// La página es pública, pero solo la cuenta administradora (ADMIN_EMAILS y reglas de Firestore)
// puede ver los datos y hacer cambios.
export default function Admin() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight">Administración de XICO</h1>
      <PanelAdmin />
    </div>
  );
}
