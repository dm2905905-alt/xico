// Conexión con la API de Mercado Pago (Checkout Pro). Solo en el servidor.
import { ErrorXico } from "./admin";

const API = "https://api.mercadopago.com";

function token() {
  const t = process.env.MP_ACCESS_TOKEN;
  if (!t) throw new ErrorXico("El servidor no tiene configurado Mercado Pago.", 500);
  return t;
}

async function llamar<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const r = await fetch(`${API}${ruta}`, {
    ...opciones,
    headers: { Authorization: `Bearer ${token()}`, "Content-Type": "application/json", ...opciones.headers },
    cache: "no-store",
  });
  const cuerpo = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error("[XICO] Mercado Pago respondió", r.status, cuerpo);
    throw new ErrorXico("Mercado Pago no respondió bien. Inténtalo de nuevo en un momento.", 502);
  }
  return cuerpo as T;
}

export type Preferencia = { id: string; init_point: string; sandbox_init_point?: string };

export type PagoMP = {
  id: number;
  status: "approved" | "pending" | "in_process" | "rejected" | "cancelled" | "refunded" | "charged_back" | string;
  status_detail: string;
  transaction_amount: number;
  currency_id: string;
  external_reference?: string;
};

export function crearPreferencia(cuerpo: Record<string, unknown>, claveIdempotencia: string) {
  return llamar<Preferencia>("/checkout/preferences", {
    method: "POST",
    body: JSON.stringify(cuerpo),
    headers: { "X-Idempotency-Key": claveIdempotencia },
  });
}

export function obtenerPago(id: string) {
  if (!/^\d+$/.test(id)) throw new ErrorXico("Pago no válido.");
  return llamar<PagoMP>(`/v1/payments/${id}`);
}

// Si el token es de prueba, se usa el checkout de pruebas
export const esPrueba = () => token().startsWith("TEST-");
