import type { Metadata } from "next";
import { VistaAdmin } from "@/components/VistaAdmin";

export const metadata: Metadata = {
  title: "Administración",
  robots: { index: false, follow: false },
};

// La página es pública, pero Firestore solo acepta cambios de la cuenta administradora
// (lo deciden las reglas de seguridad, no esta pantalla).
export default function Admin() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-2 font-display text-3xl font-semibold tracking-tight">Administración</h1>
      <p className="mb-6 text-cafe">Configura la base de datos de XICO.</p>
      <VistaAdmin />
    </div>
  );
}
