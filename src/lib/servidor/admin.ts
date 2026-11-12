// Firebase con permisos de administrador. SOLO se usa en el servidor:
// la "cuenta de servicio" es secreta y nunca llega al navegador.
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { createRemoteJWKSet, jwtVerify } from "jose";

const NOMBRE = "xico-admin";

export class ErrorXico extends Error {
  constructor(
    mensaje: string,
    public estado = 400,
  ) {
    super(mensaje);
  }
}

function app(): App {
  const existente = getApps().find((a) => a.name === NOMBRE);
  if (existente) return existente;

  // Se guarda en .env.local codificada en base64 para que quepa en una sola línea
  const crudo = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!crudo) throw new ErrorXico("El servidor no tiene configurada la cuenta de servicio de Firebase.", 500);
  const cuenta = JSON.parse(Buffer.from(crudo, "base64").toString("utf8"));
  return initializeApp({ credential: cert(cuenta) }, NOMBRE);
}

export const adminDb = () => getFirestore(app());
export const adminAuth = () => getAuth(app());

// Persona con sesión, ya verificada por el servidor
export type UsuarioVerificado = { uid: string; email?: string; email_verified?: boolean };

// Claves públicas con las que Google firma los tokens de sesión de Firebase
// (se descargan una vez y se guardan en memoria)
const clavesGoogle = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

// Lee el token de sesión que manda el navegador y comprueba que sea auténtico y vigente.
// Es la verificación que documenta Firebase: firma de Google, emisor y audiencia = nuestro proyecto.
export async function usuarioDePeticion(peticion: Request): Promise<UsuarioVerificado> {
  const token = peticion.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) throw new ErrorXico("Necesitas iniciar sesión.", 401);
  const proyecto = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  if (!proyecto) throw new ErrorXico("El servidor no tiene configurado Firebase.", 500);
  try {
    const { payload } = await jwtVerify(token, clavesGoogle, {
      issuer: `https://securetoken.google.com/${proyecto}`,
      audience: proyecto,
      algorithms: ["RS256"],
    });
    if (!payload.sub) throw new Error("token sin usuario");
    return {
      uid: payload.sub,
      email: typeof payload.email === "string" ? payload.email : undefined,
      email_verified: payload.email_verified === true,
    };
  } catch {
    throw new ErrorXico("Tu sesión expiró. Vuelve a entrar.", 401);
  }
}

// Convierte cualquier error en una respuesta JSON con un mensaje claro para el usuario
export function respuestaError(e: unknown) {
  if (e instanceof ErrorXico) return Response.json({ error: e.message }, { status: e.estado });
  console.error("[XICO] Error inesperado:", e);
  return Response.json({ error: "Algo salió mal en el servidor. Inténtalo de nuevo." }, { status: 500 });
}

// ¿La persona es administradora de XICO? (lista en ADMIN_EMAILS, correo verificado por Google)
export function esAdmin(usuario: { email?: string; email_verified?: boolean }) {
  const lista = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);
  return !!usuario.email && usuario.email_verified === true && lista.includes(usuario.email.toLowerCase());
}

export async function exigirAdmin(peticion: Request) {
  const usuario = await usuarioDePeticion(peticion);
  if (!esAdmin(usuario)) throw new ErrorXico("Solo la administración de XICO puede hacer esto.", 403);
  return usuario;
}
