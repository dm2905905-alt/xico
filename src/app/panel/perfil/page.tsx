import type { Metadata } from "next";
import { VistaPerfil } from "@/components/panel/VistaPerfil";

export const metadata: Metadata = {
  title: "Perfil de mi tienda",
  robots: { index: false },
};

export default function PerfilTienda() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <VistaPerfil />
    </div>
  );
}
