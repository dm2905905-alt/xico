// Firebase con permisos de administrador. SOLO se usa en el servidor:
// la "cuenta de servicio" es secreta y nunca llega al navegador.
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

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

export const adminAuth = () => getAuth(app());
export const adminDb = () => getFirestore(app());

// Lee el token de sesión que manda el navegador y devuelve al usuario verificado
export async function usuarioDePeticion(peticion: Request) {
  const token = peticion.headers.get("authorization")?.replace(/^Bearer /, "");
  if (!token) throw new ErrorXico("Necesitas iniciar sesión.", 401);
  try {
    return await adminAuth().verifyIdToken(token);
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
