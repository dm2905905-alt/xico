// Conexión con Envia.com (cotizar envíos y, más adelante, generar guías). Solo en el servidor.
// La clave vive en Vercel: ENVIA_TOKEN, y ENVIA_MODO = "prueba" (guías de mentira) o "real".
import type { Paquete } from "../datos";
import type { Direccion } from "../pedidos";
import { ErrorXico } from "./admin";

export const enviaConfigurado = () => !!process.env.ENVIA_TOKEN;
export const enviaModo = () => (process.env.ENVIA_MODO === "real" ? "real" : "prueba");
const base = () => (enviaModo() === "real" ? "https://api.envia.com" : "https://api-test.envia.com");

// Paqueterías que se cotizan (cada una es una consulta; se hacen al mismo tiempo)
const PAQUETERIAS = ["estafeta", "fedex", "dhl", "paquetexpress", "redpack", "jtexpress"];

// Paquete por defecto cuando la tienda no dio medidas: caja chica de 1 kg
const PAQUETE_BASE: Paquete = { pesoKg: 1, largoCm: 20, anchoCm: 15, altoCm: 10 };

export type OpcionEnvio = { paqueteria: string; servicio: string; descripcion: string; dias: string; precio: number };

// Estado y ciudad a partir del código postal (servicio público de Envia)
const estados = new Map<string, { estado: string; ciudad: string } | null>();
export async function lugarDeCP(cp: string) {
  if (!/^\d{5}$/.test(cp)) return null;
  if (estados.has(cp)) return estados.get(cp)!;
  try {
    const r = await fetch(`https://geocodes.envia.com/zipcode/MX/${cp}`, { signal: AbortSignal.timeout(6000) });
    const [d] = (await r.json()) as { state?: { code?: { "2digit"?: string } }; regions?: { region_2?: string }; locality?: string }[];
    const lugar = d?.state?.code?.["2digit"] ? { estado: d.state.code["2digit"], ciudad: d.regions?.region_2 || d.locality || "" } : null;
    estados.set(cp, lugar);
    return lugar;
  } catch {
    return null;
  }
}

// Varias piezas de una tienda en un solo paquete: se suman pesos y alturas
export function juntarPaquetes(piezas: { paquete?: Paquete; cantidad: number }[]): Paquete {
  const p = { pesoKg: 0, largoCm: 0, anchoCm: 0, altoCm: 0 };
  for (const x of piezas) {
    const q = x.paquete && x.paquete.pesoKg > 0 ? x.paquete : PAQUETE_BASE;
    p.pesoKg += q.pesoKg * x.cantidad;
    p.largoCm = Math.max(p.largoCm, q.largoCm);
    p.anchoCm = Math.max(p.anchoCm, q.anchoCm);
    p.altoCm += q.altoCm * x.cantidad;
  }
  return { pesoKg: Math.max(0.1, Math.round(p.pesoKg * 100) / 100), largoCm: p.largoCm || 20, anchoCm: p.anchoCm || 15, altoCm: Math.min(Math.max(p.altoCm, 1), 150) };
}

async function direccionEnvia(d: Pick<Direccion, "nombre" | "telefono" | "calle" | "numero" | "colonia" | "cp" | "ciudad">) {
  const lugar = await lugarDeCP(d.cp);
  if (!lugar) throw new ErrorXico(`No encontramos el código postal ${d.cp}.`);
  return {
    name: d.nombre.slice(0, 60) || "XICO",
    phone: d.telefono.replace(/\D/g, "").slice(-10) || "0000000000",
    street: d.calle.slice(0, 60) || "Conocida",
    number: d.numero.slice(0, 20) || "S/N",
    district: d.colonia.slice(0, 60),
    city: d.ciudad || lugar.ciudad,
    state: lugar.estado,
    country: "MX",
    postalCode: d.cp,
  };
}

// Cotiza con varias paqueterías y regresa las opciones de la más barata a la más cara
export async function cotizar(origen: Direccion, destino: Pick<Direccion, "nombre" | "telefono" | "calle" | "numero" | "colonia" | "cp" | "ciudad">, paquete: Paquete, valor: number, contenido = "Artesanía hecha a mano") {
  const token = process.env.ENVIA_TOKEN;
  if (!token) throw new ErrorXico("Los envíos con Envia todavía no están configurados.", 503);
  const [o, d] = await Promise.all([direccionEnvia(origen), direccionEnvia(destino)]);
  const paquetes = [
    {
      type: "box",
      content: contenido.slice(0, 60),
      amount: 1,
      declaredValue: Math.round(valor),
      weight: paquete.pesoKg,
      weightUnit: "KG",
      lengthUnit: "CM",
      dimensions: { length: paquete.largoCm, width: paquete.anchoCm, height: paquete.altoCm },
    },
  ];
  const respuestas = await Promise.allSettled(
    PAQUETERIAS.map(async (carrier) => {
      const r = await fetch(`${base()}/ship/rate/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ origin: o, destination: d, packages: paquetes, shipment: { type: 1, carrier }, settings: { currency: "MXN" } }),
        signal: AbortSignal.timeout(15000),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(`${carrier}: ${r.status} ${JSON.stringify(j).slice(0, 200)}`);
      return (Array.isArray(j.data) ? j.data : []) as {
        carrier: string;
        carrierDescription?: string;
        service: string;
        serviceDescription?: string;
        deliveryEstimate?: string;
        totalPrice: number | string;
        currency?: string;
      }[];
    }),
  );
  const errores = respuestas.filter((x): x is PromiseRejectedResult => x.status === "rejected").map((x) => String(x.reason?.message ?? x.reason));
  const opciones: OpcionEnvio[] = respuestas
    .flatMap((x) => (x.status === "fulfilled" ? x.value : []))
    .filter((t) => Number(t.totalPrice) > 0 && (!t.currency || t.currency === "MXN"))
    .map((t) => ({
      paqueteria: t.carrier,
      servicio: t.service,
      descripcion: `${t.carrierDescription ?? t.carrier} · ${t.serviceDescription ?? t.service}`,
      dias: t.deliveryEstimate ?? "",
      precio: Math.round(Number(t.totalPrice) * 100) / 100,
    }))
    .sort((a, b) => a.precio - b.precio);
  if (!opciones.length) {
    console.error("[XICO] Envia no dio opciones:", errores.join(" | "));
    throw new ErrorXico("No pudimos cotizar el envío en este momento. Inténtalo de nuevo.", 502);
  }
  return { opciones, errores };
}
