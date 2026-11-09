"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  type ConfirmationResult,
} from "firebase/auth";
import { Loader2, Smartphone } from "lucide-react";
import { mensajeError, obtenerAuth } from "@/lib/firebase";
import { useSesion } from "./Sesion";

function LogoGoogle() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}

export function FormularioEntrar({ volver }: { volver: string }) {
  const router = useRouter();
  const { usuario, configurado } = useSesion();
  const [paso, setPaso] = useState<"inicio" | "telefono" | "codigo">("inicio");
  const [telefono, setTelefono] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState(false);
  const confirmacion = useRef<ConfirmationResult | null>(null);
  const verificador = useRef<RecaptchaVerifier | null>(null);

  // Si ya hay sesión, regresa a donde iba
  useEffect(() => {
    if (usuario) router.replace(volver);
  }, [usuario, volver, router]);

  useEffect(() => () => verificador.current?.clear(), []);

  if (!configurado) {
    return (
      <div className="rounded-2xl bg-maiz/15 p-5 text-sm leading-relaxed">
        <p className="font-semibold">El inicio de sesión todavía no está conectado.</p>
        <p className="mt-1 text-cafe">
          Falta crear el proyecto en Firebase y pegar sus datos en el archivo <code>.env.local</code>. Mientras tanto, el
          carrito y los favoritos funcionan sin cuenta.
        </p>
      </div>
    );
  }

  async function conGoogle() {
    const auth = obtenerAuth();
    if (!auth) return;
    setError("");
    setOcupado(true);
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  }

  async function enviarCodigo(e: React.FormEvent) {
    e.preventDefault();
    const auth = obtenerAuth();
    if (!auth) return;
    const digitos = telefono.replace(/\D/g, "");
    if (digitos.length !== 10) {
      setError("Escribe tu número a 10 dígitos.");
      return;
    }
    setError("");
    setOcupado(true);
    try {
      // Verificación anti-robots de Google, invisible para el usuario
      verificador.current ??= new RecaptchaVerifier(auth, "recaptcha", { size: "invisible" });
      confirmacion.current = await signInWithPhoneNumber(auth, `+52${digitos}`, verificador.current);
      setPaso("codigo");
    } catch (err) {
      verificador.current?.clear();
      verificador.current = null;
      setError(mensajeError(err));
    } finally {
      setOcupado(false);
    }
  }

  async function confirmarCodigo(e: React.FormEvent) {
    e.preventDefault();
    if (!confirmacion.current) return;
    setError("");
    setOcupado(true);
    try {
      await confirmacion.current.confirm(codigo.trim());
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setOcupado(false);
    }
  }

  const inputCls =
    "h-12 w-full rounded-xl border border-arena-oscura bg-white px-4 text-base outline-none focus:border-terracota focus:ring-2 focus:ring-terracota/15";
  const btnPrincipal =
    "flex h-12 w-full items-center justify-center gap-2 rounded-full bg-terracota font-semibold text-crema transition hover:bg-terracota-oscura disabled:opacity-60";

  return (
    <div className="grid gap-4">
      {paso === "inicio" && (
        <>
          <button
            onClick={conGoogle}
            disabled={ocupado}
            className="flex h-12 items-center justify-center gap-3 rounded-full border border-arena-oscura bg-white font-semibold transition hover:bg-arena/50 disabled:opacity-60"
          >
            {ocupado ? <Loader2 className="size-5 animate-spin" /> : <LogoGoogle />} Continuar con Google
          </button>
          <button
            onClick={() => { setPaso("telefono"); setError(""); }}
            className="flex h-12 items-center justify-center gap-3 rounded-full border border-arena-oscura bg-white font-semibold transition hover:bg-arena/50"
          >
            <Smartphone className="size-5 text-terracota" /> Continuar con mi celular
          </button>
        </>
      )}

      {paso === "telefono" && (
        <form onSubmit={enviarCodigo} className="grid gap-3">
          <label className="grid gap-1.5 text-sm font-medium">
            Tu número de celular
            <div className="flex gap-2">
              <span className="grid h-12 place-items-center rounded-xl bg-arena px-3 text-sm font-semibold">🇲🇽 +52</span>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={14}
                placeholder="55 1234 5678"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className={inputCls}
                autoFocus
              />
            </div>
          </label>
          <p className="text-xs text-cafe">Te enviaremos un código por SMS.</p>
          <button type="submit" disabled={ocupado} className={btnPrincipal}>
            {ocupado && <Loader2 className="size-5 animate-spin" />} Enviar código
          </button>
          <button type="button" onClick={() => { setPaso("inicio"); setError(""); }} className="text-sm text-cafe hover:underline">
            ← Otras formas de entrar
          </button>
        </form>
      )}

      {paso === "codigo" && (
        <form onSubmit={confirmarCodigo} className="grid gap-3">
          <label className="grid gap-1.5 text-sm font-medium">
            Código que te llegó por SMS
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
              className={`${inputCls} text-center text-xl tracking-[0.5em]`}
              autoFocus
            />
          </label>
          <button type="submit" disabled={ocupado || codigo.length < 6} className={btnPrincipal}>
            {ocupado && <Loader2 className="size-5 animate-spin" />} Confirmar
          </button>
          <button type="button" onClick={() => { setPaso("telefono"); setCodigo(""); setError(""); }} className="text-sm text-cafe hover:underline">
            ← Cambiar número
          </button>
        </form>
      )}

      {error && (
        <p className="rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa" role="alert">
          {error}
        </p>
      )}
      <div id="recaptcha" />
    </div>
  );
}
