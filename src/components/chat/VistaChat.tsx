"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, FileSignature, ImagePlus, Loader2, Send, ShieldCheck } from "lucide-react";
import { enviarImagen, enviarTexto, marcarLeido, useConversacion, type Mensaje } from "@/lib/chat";
import { OCULTO } from "@/lib/contacto";
import { subirFoto } from "@/lib/fotos";
import { FormularioEntrar } from "../FormularioEntrar";
import { useSesion } from "../Sesion";
import { FormularioPropuesta } from "./FormularioPropuesta";
import { TarjetaPropuesta } from "./TarjetaPropuesta";

const hora = (ms: number) => new Date(ms).toLocaleString("es-MX", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export function VistaChat({ id }: { id: string }) {
  const { usuario, cargando: cargandoSesion } = useSesion();
  const { c, mensajes, cargando } = useConversacion(id, usuario?.uid);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [proponer, setProponer] = useState(false);
  const fin = useRef<HTMLDivElement>(null);

  // Baja al último mensaje y marca como leído
  useEffect(() => {
    fin.current?.scrollIntoView({ block: "end" });
    if (usuario && c) marcarLeido(c.id, usuario.uid);
  }, [mensajes.length, usuario, c]);

  if (cargandoSesion) return <div className="h-96 animate-pulse rounded-3xl bg-arena" />;
  if (!usuario) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60">
        <p className="mb-4 text-sm text-cafe">Entra a tu cuenta para ver tus mensajes.</p>
        <FormularioEntrar volver={`/mensajes/${id}`} />
      </div>
    );
  }
  if (cargando) return <div className="h-96 animate-pulse rounded-3xl bg-arena" />;
  if (!c) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-arena-oscura/60">
        <p className="font-display text-xl font-semibold">No encontramos esta conversación.</p>
        <Link href="/mensajes" className="mt-3 inline-block text-terracota hover:underline">Ver mis mensajes</Link>
      </div>
    );
  }

  const soyVendedor = c.creadorUid === usuario.uid;
  const otro = soyVendedor ? c.compradorNombre : c.taller;

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true);
    setAviso("");
    try {
      const { oculto } = await enviarTexto(c!.id, usuario!.uid, texto);
      setTexto("");
      if (oculto) setAviso("Por tu seguridad ocultamos datos de contacto (teléfonos, correos o redes). Todo se acuerda y paga por XICO con Compra protegida.");
    } catch {
      setAviso("No se pudo enviar el mensaje. Revisa que no lleve teléfonos ni correos e inténtalo de nuevo.");
    } finally {
      setEnviando(false);
    }
  }

  async function enviarFoto(archivo?: File) {
    if (!archivo) return;
    setEnviando(true);
    setAviso("");
    try {
      await enviarImagen(c!.id, usuario!.uid, await subirFoto(archivo, `chats/${c!.id}`));
    } catch (e) {
      setAviso((e as Error).message || "No se pudo enviar la foto.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex h-[calc(100dvh-13rem)] min-h-[28rem] flex-col overflow-hidden rounded-[2rem] bg-white/85 shadow-xl shadow-terracota/10 ring-1 ring-white backdrop-blur">
      {/* Encabezado */}
      <header className="flex items-center gap-3 border-b border-arena-oscura/60 px-4 py-3">
        <Link href="/mensajes" className="grid size-9 place-items-center rounded-full hover:bg-arena lg:hidden" aria-label="Volver a mis mensajes">
          <ArrowLeft className="size-5" />
        </Link>
        <span className="degradado-xico grid size-10 place-items-center rounded-full font-display font-extrabold text-white">{otro.trim()[0]?.toUpperCase()}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold">{otro}</p>
          {!soyVendedor && (
            <Link href={`/creador/${c.creador}`} className="text-xs text-terracota hover:underline">
              Ver tienda
            </Link>
          )}
          {soyVendedor && <p className="text-xs text-cafe">Cliente de tu tienda {c.taller}</p>}
        </div>
        {soyVendedor && (
          <button onClick={() => setProponer(true)} className="degradado-xico flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-md hover:brightness-110">
            <FileSignature className="size-4" /> <span className="hidden sm:inline">Crear propuesta</span><span className="sm:hidden">Propuesta</span>
          </button>
        )}
      </header>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <p className="mx-auto mb-4 flex max-w-md items-start gap-2 rounded-2xl bg-jade/10 px-4 py-3 text-xs text-tinta/80">
          <ShieldCheck className="size-4 shrink-0 text-jade" />
          Acuerden todo aquí y paguen por XICO: así tienes Compra protegida. Por seguridad no se permiten teléfonos, correos ni redes sociales.
        </p>
        {mensajes.length === 0 && (
          <p className="text-center text-sm text-cafe">
            {soyVendedor ? "Aún no hay mensajes." : `Cuéntale a ${c.taller} qué te gustaría: diseño, colores, modelo… Puedes mandar fotos de referencia.`}
          </p>
        )}
        <ul className="grid gap-3">
          {mensajes.map((m) => (
            <Burbuja key={m.id} m={m} mio={m.de === usuario.uid} uid={usuario.uid} />
          ))}
        </ul>
        <div ref={fin} />
      </div>

      {/* Escribir */}
      {aviso && <p className="mx-4 mb-2 rounded-xl bg-maiz/25 px-3 py-2 text-xs">{aviso}</p>}
      <form onSubmit={enviar} className="flex items-end gap-2 border-t border-arena-oscura/60 p-3">
        <label className="grid size-11 shrink-0 cursor-pointer place-items-center rounded-full text-terracota hover:bg-arena" aria-label="Enviar foto">
          <ImagePlus className="size-5" />
          <input type="file" accept="image/*" className="sr-only" disabled={enviando} onChange={(e) => (enviarFoto(e.target.files?.[0]), (e.target.value = ""))} />
        </label>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              (e.currentTarget.form as HTMLFormElement).requestSubmit();
            }
          }}
          rows={1}
          maxLength={1000}
          placeholder="Escribe un mensaje…"
          className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-arena-oscura bg-white px-4 py-2.5 text-sm outline-none focus:border-terracota"
        />
        <button type="submit" disabled={enviando || !texto.trim()} className="grid size-11 shrink-0 place-items-center rounded-full bg-terracota text-white hover:bg-terracota-oscura disabled:opacity-40" aria-label="Enviar">
          {enviando ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
        </button>
      </form>

      {proponer && <FormularioPropuesta c={c} uid={usuario.uid} cerrar={() => setProponer(false)} />}
    </div>
  );
}

function Burbuja({ m, mio, uid }: { m: Mensaje; mio: boolean; uid: string }) {
  if (m.tipo === "propuesta" && m.propuestaId) {
    return (
      <li className={`flex flex-col ${mio ? "items-end" : "items-start"}`}>
        <TarjetaPropuesta id={m.propuestaId} uid={uid} />
        <span className="mt-1 text-[10px] text-cafe">{hora(m.fecha)}</span>
      </li>
    );
  }
  return (
    <li className={`flex flex-col ${mio ? "items-end" : "items-start"}`}>
      <div className={`max-w-[80%] rounded-3xl px-4 py-2.5 text-sm shadow-sm ${mio ? "rounded-br-md bg-terracota text-white" : "rounded-bl-md bg-white ring-1 ring-arena-oscura"}`}>
        {m.tipo === "imagen" && m.foto ? (
          <a href={m.foto.url} target="_blank" rel="noopener noreferrer">
            {/* eslint-disable-next-line @next/next/no-img-element -- foto del chat, ya reducida */}
            <img src={m.foto.mini} alt="Foto enviada" className="max-h-64 rounded-2xl" />
          </a>
        ) : (
          <p className="whitespace-pre-wrap break-words">
            {m.texto?.split(OCULTO).map((parte, i, arr) => (
              <span key={i}>
                {parte}
                {i < arr.length - 1 && <span className={`rounded px-1 text-xs font-semibold ${mio ? "bg-white/25" : "bg-maiz/30"}`}>🔒 dato oculto</span>}
              </span>
            ))}
          </p>
        )}
      </div>
      <span className="mt-1 text-[10px] text-cafe">{hora(m.fecha)}</span>
    </li>
  );
}
