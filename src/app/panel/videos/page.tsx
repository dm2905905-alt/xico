import type { Metadata } from "next";
import { VistaVideos } from "@/components/panel/VistaVideos";

export const metadata: Metadata = {
  title: "Mis videos",
  robots: { index: false },
};

export default function MisVideos() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-4 md:py-8">
      <VistaVideos />
    </div>
  );
}
