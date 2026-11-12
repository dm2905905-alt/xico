import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Kalam } from "next/font/google";
import { BarraInferior } from "@/components/BarraInferior";
import { Encabezado } from "@/components/Encabezado";
import { FondoCreativo } from "@/components/FondoCreativo";
import { PiePagina } from "@/components/PiePagina";
import { ProveedorSesion } from "@/components/Sesion";
import { urlSitio } from "@/lib/sitio";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Títulos con letra de plumón, como escritos a mano en una libreta
const bricolage = Kalam({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const descripcion =
  "Cosas únicas hechas a mano por creadores mexicanos: fundas pintadas, ropa intervenida, arte, joyería, velas y regalos personalizados. 100% hecho por quien lo crea.";

export const metadata: Metadata = {
  metadataBase: new URL(urlSitio()),
  title: {
    default: "XICO · Hecho a mano en México",
    template: "%s · XICO",
  },
  description: descripcion,
  // Vista previa al compartir en redes y WhatsApp
  openGraph: {
    type: "website",
    locale: "es_MX",
    siteName: "XICO",
    title: "XICO · Hecho a mano en México",
    description: descripcion,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es-MX" data-scroll-behavior="smooth" className={`${geistSans.variable} ${bricolage.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <FondoCreativo />
        <ProveedorSesion>
          <Encabezado />
          <main className="flex-1">{children}</main>
          <PiePagina />
          {/* Lee la ruta actual: va en Suspense para no bloquear el prerender */}
          <Suspense fallback={null}>
            <BarraInferior />
          </Suspense>
        </ProveedorSesion>
      </body>
    </html>
  );
}
