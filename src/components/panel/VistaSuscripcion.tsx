"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { CalendarClock, Loader2 } from "lucide-react";
import type { Creador } from "@/lib/datos";
import { obtenerDb } from "@/lib/firebase";
import { precio } from "@/lib/formato";
import { DIAS_TOLERANCIA, MENSUALIDAD, MESES_GRATIS, diasHasta, estadoSuscripcion, type PagoSuscripcion } from "@/lib/suscripcion";
import { llamar } from "../admin/datos";
import { ConTienda } from "./ConTienda";

export function VistaSuscripcion() {
  return <ConTienda volver="/panel/suscripcion">{(creador, usuario) => <Suscripcion creador={creador} usuario={usuario} />}</ConTienda>;
}

export const fechaLarga = (ms: number) => new Date(ms).toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });

// Aviso corto para el panel principal
export function AvisoSuscripcion({ creador }: { creador: Creador }) {
  const [ahora] = useState(() => Date.now());
  const e = estadoSuscripcion(creador, ahora);
  if (e.fase === "sin-fecha") return null;
  const dias = diasHasta(e.fase === "prueba" ? e.finGratis : e.vence, ahora);
  const urgente = e.fase === "vencida" || e.fase === "pausada" || dias <= 7;
  const texto =
    e.fase === "prueba"
      ? `Periodo gratis: te quedan ${dias} días (hasta el ${fechaLarga(e.finGratis)}).`
      : e.fase === "activa"
        ? `Mensualidad al corriente hasta el ${fechaLarga(e.vence)}.`
        : e.fase === "vencida"
          ? `Tu mensualidad venció. Paga antes del ${fechaLarga(e.pausaEn)} para que tu tienda no se pause.`
          : "Tu tienda está pausada por falta de pago. Paga tu mensualidad para volver a vender.";
  return (
    <Link
      href="/panel/suscripcion"
      className={`flex items-center gap-3 rounded-3xl p-4 text-sm ring-1 ${urgente ? "bg-rosa/10 text-rosa ring-rosa/40" : "bg-white ring-arena-oscura/60"}`}
    >
      <CalendarClock className="size-5 shrink-0" />
      <span className="flex-1">{texto}</span>
      <span className="font-semibold">{urgente ? "Pagar →" : "Ver →"}</span>
    </Link>
  );
}

function Suscripcion({ creador, usuario }: { creador: Creador; usuario: User }) {
  const params = useSearchParams();
  const [ahora] = useState(() => Date.now());
  const [pagos, setPagos] = useState<PagoSuscripcion[]>([]);
  const [ocupado, setOcupado] = useState<number | null>(null);
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null);
  const e = estadoSuscripcion(creador, ahora);

  useEffect(() => {
    const db = obtenerDb();
    if (!db) return;
    return onSnapshot(query(collection(db, "pagosSuscripcion"), where("uid", "==", usuario.uid)), (s) =>
      setPagos(s.docs.map((d) => d.data() as PagoSuscripcion).sort((a, b) => b.creado - a.creado)),
    );
  }, [usuario.uid]);

  // Al regresar de Mercado Pago se revisa el pago
  const pagoId = params.get("pago");
  const mpId = params.get("payment_id") ?? params.get("collection_id");
  useEffect(() => {
    if (!pagoId) return;
    let activo = true;
    llamar<{ estado: string }>(usuario, "/api/suscripcion/confirmar", { id: pagoId, pagoId: mpId && mpId !== "null" ? mpId : undefined })
      .then((r) => {
        if (!activo) return;
        setAviso(
          r.estado === "pagado"
            ? { ok: true, texto: "✓ ¡Gracias! Tu pago se confirmó y tu mensualidad quedó al corriente." }
            : r.estado === "rechazado"
              ? { ok: false, texto: "El pago no se completó. No se hizo ningún cargo; puedes intentarlo de nuevo." }
              : { ok: true, texto: "Tu pago está en proceso. Se confirmará en cuanto Mercado Pago lo reciba." },
        );
      })
      .catch((err) => activo && setAviso({ ok: false, texto: (err as Error).message }));
    return () => {
      activo = false;
    };
  }, [pagoId, mpId, usuario]);

  async function pagar(meses: number) {
    setOcupado(meses);
    setAviso(null);
    try {
      const r = await llamar<{ url: string }>(usuario, "/api/suscripcion/pagar", { meses });
      window.location.assign(r.url);
    } catch (err) {
      setAviso({ ok: false, texto: (err as Error).message });
      setOcupado(null);
    }
  }

  const estado =
    e.fase === "prueba"
      ? { titulo: "Periodo gratis", texto: `Tus ${MESES_GRATIS} meses gratis terminan el ${fechaLarga(e.finGratis)}.`, color: "bg-jade/10 ring-jade/40" }
      : e.fase === "activa"
        ? { titulo: "Al corriente", texto: `Tu mensualidad está pagada hasta el ${fechaLarga(e.vence)}.`, color: "bg-jade/10 ring-jade/40" }
        : e.fase === "vencida"
          ? { titulo: "Mensualidad vencida", texto: `Venció el ${fechaLarga(e.vence)}. Si no pagas antes del ${fechaLarga(e.pausaEn)}, tu tienda se pausará.`, color: "bg-maiz/20 ring-maiz/60" }
          : e.fase === "pausada"
            ? { titulo: "Tienda pausada", texto: "Tus productos no se muestran porque la mensualidad no se pagó. Paga para volver a vender.", color: "bg-rosa/10 ring-rosa/40" }
            : { titulo: "Periodo gratis", texto: "Tu tienda está en su periodo gratis.", color: "bg-jade/10 ring-jade/40" };

  return (
    <div className="grid gap-4 sm:gap-6">
      <div>
        <Link href="/panel" className="text-sm text-cafe hover:underline">← Volver a mi tienda</Link>
        <h2 className="mt-2 font-display text-2xl font-bold">Mensualidad</h2>
        <p className="text-sm text-cafe">
          {MESES_GRATIS} meses gratis al abrir tu tienda; después {precio(MENSUALIDAD)} al mes, más la comisión del 15% por venta.
        </p>
      </div>

      {aviso && (
        <p role={aviso.ok ? "status" : "alert"} className={`rounded-xl px-4 py-3 text-sm ${aviso.ok ? "bg-jade/10 text-jade" : "bg-rosa/10 text-rosa"}`}>
          {aviso.texto}
        </p>
      )}

      <section className={`rounded-3xl p-5 ring-1 ${estado.color}`}>
        <p className="font-display text-xl font-bold">{estado.titulo}</p>
        <p className="mt-1 text-sm">{estado.texto}</p>
      </section>

      <section className="rounded-3xl bg-white p-5 ring-1 ring-arena-oscura/60">
        <h3 className="font-display text-lg font-semibold">Pagar con Mercado Pago</h3>
        <p className="mt-1 text-sm text-cafe">
          Puedes pagar por adelantado. Se suma a partir de tu fecha de vencimiento
          {e.fase === "pausada" ? " (como tu tienda está pausada, se cuenta desde hoy)" : ""}. Tienes {DIAS_TOLERANCIA} días de tolerancia si se te pasa.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {[1, 3, 6].map((m) => (
            <button
              key={m}
              onClick={() => pagar(m)}
              disabled={ocupado !== null}
              className={`flex h-14 flex-col items-center justify-center rounded-2xl font-semibold disabled:opacity-60 ${m === 1 ? "degradado-xico text-white" : "ring-1 ring-arena-oscura hover:bg-arena"}`}
            >
              {ocupado === m ? (
                <Loader2 className="size-5 animate-spin" />
              ) : (
                <>
                  <span>{m === 1 ? "1 mes" : `${m} meses`}</span>
                  <span className="text-xs font-normal opacity-80">{precio(MENSUALIDAD * m)}</span>
                </>
              )}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-white p-5 ring-1 ring-arena-oscura/60">
        <h3 className="mb-2 font-display text-lg font-semibold">Mis pagos</h3>
        {pagos.filter((p) => p.estado === "pagado").length === 0 ? (
          <p className="text-sm text-cafe">Aún no has pagado mensualidades.</p>
        ) : (
          <ul className="divide-y divide-arena-oscura/50 text-sm">
            {pagos
              .filter((p) => p.estado === "pagado")
              .map((p) => (
                <li key={p.id} className="flex justify-between py-2">
                  <span>
                    {fechaLarga(p.pagado ?? p.creado)} · {p.meses} {p.meses === 1 ? "mes" : "meses"}
                    {p.metodo === "manual" && " (registrado por XICO)"}
                  </span>
                  <strong>{precio(p.monto)}</strong>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}
