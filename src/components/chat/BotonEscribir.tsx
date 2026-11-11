"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { abrirConversacion } from "@/lib/chat";
import type { Creador } from "@/lib/datos";
import { useSesion } from "../Sesion";

// Abre el chat con la tienda (pide entrar si no hay sesión)
export function BotonEscribir({ creador, texto, className = "" }: { creador: Creador; texto?: string; className?: string }) {
  const { usuario } = useSesion();
  const router = useRouter();
  const ruta = usePathname();
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  if (usuario && usuario.uid === creador.uid) return null; // es su propia tienda

  async function abrir() {
    if (!usuario) {
      router.push(`/entrar?volver=${encodeURIComponent(ruta)}`);
      return;
    }
    setOcupado(true);
    setError("");
    try {
      router.push(`/mensajes/${await abrirConversacion(usuario, creador)}`);
    } catch (e) {
      setError((e as Error).message);
      setOcupado(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={abrir}
        disabled={ocupado}
        className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-terracota bg-white px-5 py-2.5 font-semibold text-terracota transition hover:bg-terracota hover:text-white disabled:opacity-60"
      >
        {ocupado ? <Loader2 className="size-5 animate-spin" /> : <MessageCircle className="size-5" />}
        {texto ?? `Escribir a ${creador.taller}`}
      </button>
      {error && <p className="mt-2 text-center text-xs text-rosa">{error}</p>}
    </div>
  );
}
