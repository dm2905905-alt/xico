"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { initializeAppCheck, ReCaptchaEnterpriseProvider } from "firebase/app-check";
import { getAuth, type Auth } from "firebase/auth";
import { initializeFirestore, type Firestore } from "firebase/firestore";
import { firebaseConfig, firebaseConfigurado } from "./firebase-config";

export { firebaseConfigurado };

// App Check: comprueba que quien habla con Firebase es la página real de XICO y no un script de afuera.
// Se activa solo cuando existe la clave de reCAPTCHA en Vercel (NEXT_PUBLIC_RECAPTCHA_KEY).
const claveRecaptcha = process.env.NEXT_PUBLIC_RECAPTCHA_KEY;

// La app de Firebase del navegador (todas las partes deben usar esta para que App Check aplique)
export function appFirebase(): FirebaseApp {
  if (getApps().some((a) => a.name === "[DEFAULT]")) return getApp();
  const nueva = initializeApp(firebaseConfig);
  if (typeof window !== "undefined" && claveRecaptcha) {
    try {
      initializeAppCheck(nueva, { provider: new ReCaptchaEnterpriseProvider(claveRecaptcha), isTokenAutoRefreshEnabled: true });
    } catch (e) {
      console.warn("[XICO] App Check no se pudo activar:", e);
    }
  }
  return nueva;
}
const app = appFirebase;

let auth: Auth | null = null;
let db: Firestore | null = null;

export function obtenerAuth(): Auth | null {
  if (!firebaseConfigurado) return null;
  if (!auth) {
    auth = getAuth(app());
    auth.languageCode = "es-419"; // mensajes de Google y SMS en español
  }
  return auth;
}

// Base de datos desde el navegador (cuenta del usuario y panel de administración)
export function obtenerDb(): Firestore | null {
  if (!firebaseConfigurado) return null;
  db ??= initializeFirestore(app(), { ignoreUndefinedProperties: true });
  return db;
}

// Traduce los errores más comunes de Firebase a mensajes claros
export function mensajeError(e: unknown): string {
  const codigo = (e as { code?: string })?.code ?? "";
  const mensajes: Record<string, string> = {
    "auth/popup-closed-by-user": "Cerraste la ventana de Google antes de terminar.",
    "auth/cancelled-popup-request": "Cerraste la ventana de Google antes de terminar.",
    "auth/popup-blocked": "Tu navegador bloqueó la ventana de Google. Permite ventanas emergentes e inténtalo de nuevo.",
    "auth/invalid-phone-number": "Ese número no es válido. Escribe los 10 dígitos.",
    "auth/too-many-requests": "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
    "auth/invalid-verification-code": "El código no es correcto. Revisa el SMS.",
    "auth/code-expired": "El código ya expiró. Pide uno nuevo.",
    "auth/network-request-failed": "No hay conexión a internet.",
    "auth/unauthorized-domain": "Este dominio no está autorizado en Firebase (Authentication → Configuración → Dominios autorizados).",
    "auth/operation-not-allowed": "Este método de acceso no está activado en Firebase.",
    "permission-denied": "Firebase no dio permiso. Revisa que las reglas de seguridad estén publicadas con tu correo.",
    "unavailable": "No se pudo conectar con Firebase. Revisa tu internet.",
  };
  return mensajes[codigo] ?? "Algo salió mal. Inténtalo de nuevo.";
}
