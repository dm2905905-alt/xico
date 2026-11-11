"use client";

import Link from "next/link";
import { useState } from "react";
import { collection, doc, updateDoc, writeBatch } from "firebase/firestore";
import { BadgeCheck, Check, ExternalLink, Star } from "lucide-react";
import { clabeLegible } from "@/lib/clabe";
import { estadoPorSlug, tiendaActiva, type Creador } from "@/lib/datos";
import { mensajeError, obtenerDb } from "@/lib/firebase";
import { precio } from "@/lib/formato";
import type { DatosPrivados } from "@/lib/panel";
import { MENSUALIDAD, estadoSuscripcion, nuevoPagadoHasta, type PagoSuscripcion } from "@/lib/suscripcion";
import { cobrados, type DatosAdmin } from "./datos";

type Filtro = "solicitudes" | "todas" | "pendientes" | "suspendidas" | "ejemplo";

const fecha = (ms?: number) => (ms ? new Date(ms).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }) : "—");

// Tiendas: aprobar solicitudes, suspender y otorgar insignias
export function TabCreadores({ datos }: { datos: DatosAdmin }) {
  const solicitudes = datos.creadores.filter((c) => c.estadoTienda === "revision").length;
  const [error, setError] = useState("");
  const [filtro, setFiltro] = useState<Filtro>(solicitudes ? "solicitudes" : "todas");

  const ventasDe = (slug: string) =>
    cobrados(datos.pedidos)
      .flatMap((p) => p.grupos)
      .filter((g) => g.creador === slug)
      .reduce((s, g) => s + g.subtotal, 0);

  async function cambiar(c: Creador, cambios: Partial<Creador>, pregunta?: string) {
    const db = obtenerDb();
    if (!db) return;
    if (pregunta && !window.confirm(pregunta)) return;
    setError("");
    try {
      await updateDoc(doc(db, "creadores", c.slug), cambios);
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  // Mensualidad pagada por otro medio (transferencia o efectivo)
  async function pagoManual(c: Creador) {
    const db = obtenerDb();
    if (!db || !c.uid) return;
    if (!window.confirm(`¿Registrar que ${c.taller} te pagó 1 mes (${precio(MENSUALIDAD)}) por transferencia o efectivo?`)) return;
    setError("");
    try {
      const ahora = Date.now();
      const ref = doc(collection(db, "pagosSuscripcion"));
      const pago: PagoSuscripcion = {
        id: ref.id, creador: c.slug, uid: c.uid, taller: c.taller, meses: 1, monto: MENSUALIDAD,
        estado: "pagado", metodo: "manual", creado: ahora, pagado: ahora,
      };
      const lote = writeBatch(db);
      lote.set(ref, pago);
      lote.update(doc(db, "creadores", c.slug), {
        suscripcion: { ...c.suscripcion, inicio: c.suscripcion?.inicio ?? c.solicitada ?? ahora, pagadoHasta: nuevoPagadoHasta(c, 1, ahora) },
      });
      await lote.commit();
    } catch (e) {
      setError(mensajeError(e));
    }
  }

  // Tienda sin mensualidad (la tuya o las que tú decidas): nunca se cobra ni se pausa
  function exentar(c: Creador, exenta: boolean) {
    cambiar(
      c,
      { suscripcion: { ...c.suscripcion, exenta } },
      exenta ? `¿Quitarle la mensualidad a ${c.taller}? No pagará nunca, hasta que tú lo cambies.` : `¿Volver a cobrarle mensualidad a ${c.taller}?`,
    );
  }

  // Un mes de cortesía (sin registrar un pago)
  function regalarMes(c: Creador) {
    const ahora = Date.now();
    cambiar(
      c,
      { suscripcion: { ...c.suscripcion, inicio: c.suscripcion?.inicio ?? c.solicitada ?? ahora, pagadoHasta: nuevoPagadoHasta(c, 1, ahora) } },
      `¿Regalarle 1 mes sin costo a ${c.taller}?`,
    );
  }

  const lista = datos.creadores
    .filter((c) =>
      filtro === "solicitudes"
        ? c.estadoTienda === "revision"
        : filtro === "pendientes"
          ? c.uid && tiendaActiva(c) && !c.verificado
          : filtro === "suspendidas"
            ? c.estadoTienda === "suspendida"
            : filtro === "ejemplo"
              ? !c.uid
              : true,
    )
    .sort((a, b) => (b.solicitada ?? 0) - (a.solicitada ?? 0) || Number(!!b.uid) - Number(!!a.uid) || a.taller.localeCompare(b.taller));

  const filtros: [Filtro, string][] = [
    ["solicitudes", `Solicitudes${solicitudes ? ` (${solicitudes})` : ""}`],
    ["todas", "Todas"],
    ["pendientes", "Por verificar"],
    ["suspendidas", "Suspendidas"],
    ["ejemplo", "De ejemplo"],
  ];

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-2">
        {filtros.map(([id, texto]) => (
          <button
            key={id}
            onClick={() => setFiltro(id)}
            className={`rounded-full px-4 py-1.5 text-sm ${filtro === id ? "bg-tinta text-crema" : id === "solicitudes" && solicitudes ? "bg-maiz/30 font-semibold ring-1 ring-maiz" : "bg-white ring-1 ring-arena-oscura"}`}
          >
            {texto}
          </button>
        ))}
      </div>
      {error && <p role="alert" className="rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa">{error}</p>}
      <p className="text-xs text-cafe">
        Aprueba solo a quien hace sus propias piezas: revisa su historia, sus productos y que su cuenta de pago esté a su nombre. &quot;Verificado&quot; es una
        insignia extra de confianza; &quot;Top vendedor&quot; es para quien vende bien y cumple a tiempo.
      </p>

      <ul className="grid gap-3">
        {lista.map((c) => (
          <Tienda
            key={c.slug}
            c={c}
            privado={datos.privados[c.slug]}
            productos={datos.productos.filter((p) => p.creador === c.slug).length}
            vendido={ventasDe(c.slug)}
            cambiar={cambiar}
            pagoManual={pagoManual}
            exentar={exentar}
            regalarMes={regalarMes}
          />
        ))}
        {!lista.length && <li className="text-sm text-cafe">{filtro === "solicitudes" ? "No hay solicitudes nuevas. 🎉" : "No hay tiendas en esta lista."}</li>}
      </ul>
    </div>
  );
}

function Tienda({
  c,
  privado,
  productos,
  vendido,
  cambiar,
  pagoManual,
  exentar,
  regalarMes,
}: {
  c: Creador;
  privado?: DatosPrivados;
  productos: number;
  vendido: number;
  cambiar: (c: Creador, cambios: Partial<Creador>, pregunta?: string) => void;
  pagoManual: (c: Creador) => void;
  exentar: (c: Creador, exenta: boolean) => void;
  regalarMes: (c: Creador) => void;
}) {
  const [ahora] = useState(() => Date.now());
  const sus = estadoSuscripcion(c, ahora);
  const fechaCorta = (ms: number) => new Date(ms).toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" });
  const enRevision = c.estadoTienda === "revision";
  const suspendida = c.estadoTienda === "suspendida";
  const [abierto, setAbierto] = useState(enRevision);
  const pago = privado?.pago;
  const dir = privado?.direccion;

  return (
    <li className={`rounded-2xl bg-white p-4 ring-1 ${enRevision ? "ring-2 ring-maiz" : suspendida ? "ring-rosa/40" : "ring-arena-oscura/60"}`}>
      <div className="flex flex-wrap items-center gap-4">
        <span className="size-10 shrink-0 rounded-full" style={{ background: `linear-gradient(135deg, ${c.colores[0]}, ${c.colores[1]})` }} />
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-1.5 font-semibold">
            {c.taller}
            {c.verificado && <BadgeCheck className="size-4 text-jade" />}
            {!c.uid && <span className="rounded-full bg-arena px-2 py-0.5 text-[11px] font-normal text-cafe">ejemplo</span>}
            {enRevision && <span className="rounded-full bg-maiz/30 px-2 py-0.5 text-[11px]">⏳ en revisión</span>}
            {suspendida && <span className="rounded-full bg-rosa/10 px-2 py-0.5 text-[11px] text-rosa">🚫 suspendida</span>}
          </p>
          <p className="truncate text-xs text-cafe">
            {c.nombre || "Sin nombre"} · {estadoPorSlug(c.estado)?.nombre ?? "—"} · {productos} productos · vendió {precio(vendido)}
          </p>
        </div>
        <Link href={`/creador/${c.slug}`} target="_blank" className="flex items-center gap-1 text-xs text-terracota hover:underline">
          Ver tienda <ExternalLink className="size-3.5" />
        </Link>
        {c.uid && (
          <button onClick={() => setAbierto(!abierto)} className="text-xs text-cafe underline">
            {abierto ? "Ocultar datos" : "Ver datos"}
          </button>
        )}
      </div>

      {abierto && c.uid && (
        <div className="mt-4 grid gap-3 rounded-2xl bg-arena/50 p-4 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold text-cafe uppercase">Solicitud</p>
            <p>Enviada: {fecha(c.solicitada)}</p>
            <p>Hace: {c.especialidad || "—"}</p>
            {c.historia && <p className="mt-1 line-clamp-4 text-cafe">“{c.historia}”</p>}
          </div>
          <div>
            <p className="text-xs font-semibold text-cafe uppercase">Cuenta de pago</p>
            {pago ? (
              <>
                <p className="font-semibold">{pago.titular}</p>
                <p>{pago.banco}</p>
                <p className="font-mono">{clabeLegible(pago.clabe)}</p>
                {pago.rfc && <p>RFC {pago.rfc}</p>}
                <p className="text-xs text-cafe">Actualizada: {fecha(pago.actualizado)}</p>
              </>
            ) : (
              <p className="text-rosa">⚠️ Sin cuenta de pago registrada</p>
            )}
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold text-cafe uppercase">Dirección</p>
            {dir?.calle ? (
              <p>
                {dir.nombre} · {dir.telefono} — {dir.calle}, {dir.colonia}, CP {dir.cp}, {dir.ciudad}, {dir.estado}
              </p>
            ) : (
              <p className="text-rosa">⚠️ Sin dirección registrada</p>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {enRevision && (
          <>
            <button
              onClick={() => cambiar(c, { estadoTienda: "aprobada" }, `¿Aprobar "${c.taller}"? Sus productos aparecerán en XICO.`)}
              className="flex items-center gap-1.5 rounded-full bg-jade px-4 py-1.5 text-sm font-semibold text-white"
            >
              <Check className="size-4" /> Aprobar
            </button>
            <button
              onClick={() => cambiar(c, { estadoTienda: "suspendida" }, `¿Rechazar la solicitud de "${c.taller}"? Su tienda no se mostrará.`)}
              className="rounded-full px-4 py-1.5 text-sm text-rosa ring-1 ring-rosa/40"
            >
              Rechazar
            </button>
          </>
        )}
        {!enRevision && c.uid && (
          <button
            onClick={() =>
              suspendida
                ? cambiar(c, { estadoTienda: "aprobada" }, `¿Reactivar "${c.taller}"?`)
                : cambiar(c, { estadoTienda: "suspendida" }, `¿Suspender "${c.taller}"? Sus productos dejarán de mostrarse.`)
            }
            className={`rounded-full px-4 py-1.5 text-sm ring-1 ${suspendida ? "text-jade ring-jade" : "text-rosa ring-rosa/40"}`}
          >
            {suspendida ? "Reactivar tienda" : "Suspender"}
          </button>
        )}
        {c.uid && !enRevision && sus.fase !== "sin-fecha" && (
          <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${sus.fase === "pausada" ? "bg-rosa/10 text-rosa" : sus.fase === "vencida" ? "bg-maiz/30" : sus.fase === "exenta" ? "bg-terracota/10 text-terracota" : "bg-jade/10 text-jade"}`}>
            {sus.fase === "exenta" ? "Sin mensualidad" : sus.fase === "prueba" ? `Gratis hasta ${fechaCorta(sus.finGratis)}` : sus.fase === "activa" ? `Pagada hasta ${fechaCorta(sus.vence)}` : sus.fase === "vencida" ? "Mensualidad vencida" : "Pausada por falta de pago"}
          </span>
        )}
        {c.uid && !enRevision && sus.fase !== "exenta" && (
          <>
            <button onClick={() => pagoManual(c)} className="rounded-full px-3 py-1.5 text-xs ring-1 ring-arena-oscura hover:bg-arena">
              + Registrar pago de 1 mes
            </button>
            <button onClick={() => regalarMes(c)} className="rounded-full px-3 py-1.5 text-xs ring-1 ring-arena-oscura hover:bg-arena">
              🎁 Regalar 1 mes
            </button>
          </>
        )}
        {c.uid && (
          <button
            onClick={() => exentar(c, sus.fase !== "exenta")}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${sus.fase === "exenta" ? "text-cafe ring-arena-oscura hover:bg-arena" : "text-terracota ring-terracota/40 hover:bg-terracota/10"}`}
          >
            {sus.fase === "exenta" ? "Volver a cobrar mensualidad" : "Sin mensualidad"}
          </button>
        )}
        <label className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 ring-arena-oscura has-checked:bg-jade/10 has-checked:ring-jade">
          <input type="checkbox" className="accent-jade" checked={c.verificado} onChange={(e) => cambiar(c, { verificado: e.target.checked })} />
          <BadgeCheck className="size-4 text-jade" /> Verificado
        </label>
        <label className="flex cursor-pointer items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 ring-arena-oscura has-checked:bg-maiz/20 has-checked:ring-maiz">
          <input type="checkbox" className="accent-maiz" checked={c.top} onChange={(e) => cambiar(c, { top: e.target.checked })} />
          <Star className="size-4 text-maiz" /> Top vendedor
        </label>
      </div>
    </li>
  );
}
