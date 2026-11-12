"use client";

import { useState } from "react";
import { deleteDoc, doc, collection, setDoc, updateDoc, writeBatch } from "firebase/firestore";
import { Gift, Loader2, Plus, Trophy, X } from "lucide-react";
import {
  avances,
  calcularGanadores,
  cumple,
  faseEvento,
  momentoActual,
  textoMeta,
  textoPeriodo,
  textoPremio,
  type Evento,
  type FaseEvento,
  type MetaEvento,
  type PremioEvento,
} from "@/lib/eventos";
import { periodos } from "@/lib/finanzas";
import { mensajeError, obtenerDb } from "@/lib/firebase";
import { precio } from "@/lib/formato";
import { nuevoPagadoHasta } from "@/lib/suscripcion";
import type { DatosAdmin, Rol } from "./datos";

type Periodo = "semana" | "mes" | "proxima-semana" | "proximo-mes" | "fechas";

const DIA = 24 * 60 * 60 * 1000;
const aFechaInput = (t: number) => {
  const d = new Date(t);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};
const deFechaInput = (v: string) => {
  const [a, m, d] = v.split("-").map(Number);
  return new Date(a, m - 1, d).getTime();
};

function rangoDe(periodo: Periodo, desde: string, hasta: string, ahora: number): { inicio: number; fin: number } | null {
  if (periodo === "semana" || periodo === "mes") {
    const p = periodos(periodo, ahora, 1)[0];
    return { inicio: p.desde, fin: p.hasta };
  }
  if (periodo === "proxima-semana") {
    const p = periodos("semana", ahora + 7 * DIA, 1)[0];
    return { inicio: p.desde, fin: p.hasta };
  }
  if (periodo === "proximo-mes") {
    const actual = periodos("mes", ahora, 1)[0];
    const p = periodos("mes", actual.hasta + DIA, 1)[0];
    return { inicio: p.desde, fin: p.hasta };
  }
  if (!desde || !hasta) return null;
  const inicio = deFechaInput(desde);
  const fin = deFechaInput(hasta) + DIA; // incluye todo el último día
  return fin > inicio ? { inicio, fin } : null;
}

// Ejemplos para empezar rápido
const plantillas: { nombre: string; periodo: Periodo; meta: MetaEvento; premio: PremioEvento }[] = [
  { nombre: "Más de $2,000 este mes → 1 mes gratis", periodo: "mes", meta: { tipo: "monto", minimo: 2000 }, premio: { tipo: "meses", meses: 1 } },
  { nombre: "Top 10 de la semana → 100% de su producto más caro", periodo: "semana", meta: { tipo: "top", lugares: 10 }, premio: { tipo: "masCaro", porcentaje: 100 } },
  { nombre: "Top 3 del mes → bono de $500", periodo: "mes", meta: { tipo: "top", lugares: 3 }, premio: { tipo: "bono", monto: 500 } },
  { nombre: "10 piezas esta semana → sin comisión", periodo: "semana", meta: { tipo: "piezas", minimo: 10 }, premio: { tipo: "comision", porcentaje: 100 } },
];

const nombreFase: Record<FaseEvento, { texto: string; color: string }> = {
  proximo: { texto: "Próximamente", color: "bg-arena" },
  "en-curso": { texto: "En curso", color: "bg-jade/10 text-jade" },
  "por-premiar": { texto: "Terminó · falta entregar premios", color: "bg-maiz/30" },
  premiado: { texto: "Premios entregados", color: "bg-terracota/10 text-terracota" },
  cancelado: { texto: "Cancelado", color: "bg-rosa/10 text-rosa" },
};

// Eventos y retos para vendedores, con premios
export function TabEventos({ datos, rol }: { datos: DatosAdmin; rol: Rol }) {
  const [ahora] = useState(() => Date.now());
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState("");
  const [ocupado, setOcupado] = useState<string | null>(null);

  async function premiar(e: Evento) {
    const db = obtenerDb();
    if (!db) return;
    const ganadores = calcularGanadores(e, datos.pedidos, datos.creadores);
    const dinero = ganadores.reduce((s, g) => s + g.monto, 0);
    const pregunta = ganadores.length
      ? `¿Entregar premios de "${e.titulo}"?\n\n${ganadores.length} ganador(es).${dinero ? ` Les deberás ${precio(dinero)} (aparecerá en Pagos a creadores).` : ""}${e.premio.tipo === "meses" ? ` Se les sumarán ${e.premio.meses} mes(es) gratis automáticamente.` : ""}`
      : `"${e.titulo}" no tuvo ganadores. ¿Cerrarlo así?`;
    if (!window.confirm(pregunta)) return;
    setOcupado(e.id);
    setError("");
    try {
      const momento = momentoActual();
      const lote = writeBatch(db);
      lote.update(doc(db, "eventos", e.id), {
        estado: "premiado",
        premiado: momento,
        ganadores: ganadores.map((g) => ({ creador: g.creador, taller: g.taller, lugar: g.lugar, monto: g.monto, meses: g.meses })),
      });
      for (const g of ganadores) {
        if (!g.meses) continue;
        const c = datos.creadores.find((x) => x.slug === g.creador);
        if (!c || c.suscripcion?.exenta) continue; // las tiendas sin mensualidad no necesitan meses
        lote.update(doc(db, "creadores", c.slug), {
          suscripcion: { ...c.suscripcion, inicio: c.suscripcion?.inicio ?? c.solicitada ?? momento, pagadoHasta: nuevoPagadoHasta(c, g.meses, momento) },
        });
      }
      await lote.commit();
    } catch (err) {
      setError(mensajeError(err));
    } finally {
      setOcupado(null);
    }
  }

  async function cancelar(e: Evento) {
    const db = obtenerDb();
    if (!db || !window.confirm(`¿Cancelar "${e.titulo}"? Nadie recibirá premio.`)) return;
    try {
      await updateDoc(doc(db, "eventos", e.id), { estado: "cancelado" });
    } catch (err) {
      setError(mensajeError(err));
    }
  }

  async function borrar(e: Evento) {
    const db = obtenerDb();
    if (!db || !window.confirm(`¿Borrar "${e.titulo}" para siempre?`)) return;
    try {
      await deleteDoc(doc(db, "eventos", e.id));
    } catch (err) {
      setError(mensajeError(err));
    }
  }

  const porFase = (f: FaseEvento[]) => datos.eventos.filter((e) => f.includes(faseEvento(e, ahora)));
  const grupos: [string, Evento[]][] = [
    ["Falta entregar premios", porFase(["por-premiar"])],
    ["Activos", porFase(["en-curso", "proximo"])],
    ["Terminados", porFase(["premiado", "cancelado"])],
  ];

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-maiz/15 p-4 text-sm">
        <p className="min-w-0 flex-1 text-cafe">
          Crea retos para tus vendedores. Los vendedores los ven en su panel con su avance. Al terminar, presiona <strong>Entregar premios</strong>: los meses gratis se
          aplican solos y el dinero aparece en <strong>Pagos a creadores</strong>.
        </p>
        {!abierto && (
          <button onClick={() => setAbierto(true)} className="flex items-center gap-1.5 rounded-full bg-terracota px-4 py-2 font-semibold text-crema">
            <Plus className="size-4" /> Nuevo evento
          </button>
        )}
      </div>

      {abierto && <NuevoEvento ahora={ahora} cerrar={() => setAbierto(false)} />}
      {error && <p role="alert" className="rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa">{error}</p>}

      {grupos.map(([titulo, lista]) =>
        lista.length ? (
          <section key={titulo} className="grid gap-3">
            <h2 className="font-display text-lg font-semibold">{titulo}</h2>
            {lista.map((e) => (
              <TarjetaEvento key={e.id} e={e} datos={datos} ahora={ahora} ocupado={ocupado === e.id} premiar={rol === "admin" ? premiar : undefined} cancelar={cancelar} borrar={borrar} />
            ))}
          </section>
        ) : null,
      )}
      {!datos.eventos.length && !abierto && <p className="text-sm text-cafe">Aún no has creado eventos.</p>}
    </div>
  );
}

function TarjetaEvento({
  e,
  datos,
  ahora,
  ocupado,
  premiar,
  cancelar,
  borrar,
}: {
  e: Evento;
  datos: DatosAdmin;
  ahora: number;
  ocupado: boolean;
  premiar?: (e: Evento) => void;
  cancelar: (e: Evento) => void;
  borrar: (e: Evento) => void;
}) {
  const fase = faseEvento(e, ahora);
  const reales = new Set(datos.creadores.filter((c) => c.uid).map((c) => c.slug));
  const ranking = fase === "premiado" || fase === "cancelado" ? [] : avances(e, datos.pedidos).filter((a) => reales.has(a.creador));
  const ganadores = fase === "por-premiar" || fase === "en-curso" ? calcularGanadores(e, datos.pedidos, datos.creadores) : [];
  const ganan = new Set(ganadores.map((g) => g.creador));

  return (
    <article className="rounded-2xl bg-white p-4 ring-1 ring-arena-oscura/60">
      <div className="flex flex-wrap items-start gap-3">
        <Trophy className="mt-0.5 size-5 shrink-0 text-terracota" />
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{e.titulo}</p>
          <p className="text-sm text-cafe">
            {textoMeta(e.meta)} → {textoPremio(e.premio)}
          </p>
          <p className="text-xs text-cafe">{textoPeriodo(e)}</p>
          {e.descripcion && <p className="mt-1 text-sm">{e.descripcion}</p>}
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${nombreFase[fase].color}`}>{nombreFase[fase].texto}</span>
      </div>

      {/* Avance en vivo */}
      {ranking.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold text-cafe">Ventas en el evento{fase === "en-curso" ? " (en vivo)" : ""}</p>
          <ol className="grid gap-1 text-sm">
            {ranking.slice(0, 15).map((a, i) => (
              <li key={a.creador} className={`flex items-center gap-2 rounded-lg px-2 py-1 ${ganan.has(a.creador) ? "bg-jade/10" : ""}`}>
                <span className="w-6 text-right text-xs text-cafe">{i + 1}.</span>
                <span className="min-w-0 flex-1 truncate">{a.taller}</span>
                <span className="text-xs text-cafe">{a.piezas} pzs</span>
                <span className="font-semibold">{precio(a.ventas)}</span>
                {ganan.has(a.creador) ? <span className="text-xs text-jade">🏆</span> : !cumple(e.meta, a) && <span className="text-xs text-cafe">·</span>}
              </li>
            ))}
          </ol>
        </div>
      )}
      {ranking.length === 0 && (fase === "en-curso" || fase === "por-premiar") && <p className="mt-3 text-sm text-cafe">Aún no hay ventas en este periodo.</p>}

      {/* Ganadores ya premiados */}
      {fase === "premiado" && (
        <div className="mt-3">
          {e.ganadores?.length ? (
            <ul className="grid gap-1 text-sm">
              {e.ganadores.map((g) => (
                <li key={g.creador} className="flex flex-wrap items-center gap-2 rounded-lg bg-arena/50 px-2 py-1">
                  <span>🏆 {g.taller}</span>
                  <span className="ml-auto font-semibold">{g.meses ? `${g.meses} mes(es) gratis` : precio(g.monto)}</span>
                  {g.monto > 0 && <span className={`text-xs ${g.pagado ? "text-jade" : "text-rosa"}`}>{g.pagado ? "Pagado" : "Por pagar"}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-cafe">Nadie ganó este evento.</p>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {fase === "por-premiar" && !premiar && <p className="text-xs text-cafe">La administración entrega los premios.</p>}
        {fase === "por-premiar" && premiar && (
          <button onClick={() => premiar(e)} disabled={ocupado} className="flex items-center gap-1.5 rounded-full bg-jade px-4 py-2 text-sm font-semibold text-white disabled:opacity-60">
            {ocupado ? <Loader2 className="size-4 animate-spin" /> : <Gift className="size-4" />} Entregar premios ({ganadores.length})
          </button>
        )}
        {(fase === "en-curso" || fase === "proximo" || fase === "por-premiar") && (
          <button onClick={() => cancelar(e)} className="rounded-full px-3 py-1.5 text-xs text-rosa ring-1 ring-rosa/40 hover:bg-rosa/10">
            Cancelar evento
          </button>
        )}
        {(fase === "cancelado" || fase === "proximo") && (
          <button onClick={() => borrar(e)} className="rounded-full px-3 py-1.5 text-xs ring-1 ring-arena-oscura hover:bg-arena">
            Borrar
          </button>
        )}
      </div>
    </article>
  );
}

function NuevoEvento({ ahora, cerrar }: { ahora: number; cerrar: () => void }) {
  const [periodo, setPeriodo] = useState<Periodo>("mes");
  const [desde, setDesde] = useState(aFechaInput(ahora));
  const [hasta, setHasta] = useState(aFechaInput(ahora + 6 * DIA));
  const [meta, setMeta] = useState<MetaEvento>({ tipo: "monto", minimo: 2000 });
  const [premio, setPremio] = useState<PremioEvento>({ tipo: "meses", meses: 1 });
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const rango = rangoDe(periodo, desde, hasta, ahora);
  const tituloAuto = `${textoMeta(meta)} y gana ${textoPremio(premio)}`;
  const numMeta = meta.tipo === "top" ? meta.lugares : meta.minimo;
  const numPremio = premio.tipo === "meses" ? premio.meses : premio.tipo === "bono" ? premio.monto : premio.porcentaje;

  function cambiarMeta(tipo: MetaEvento["tipo"], n: number) {
    setMeta(tipo === "top" ? { tipo, lugares: n } : { tipo, minimo: n });
  }
  function cambiarPremio(tipo: PremioEvento["tipo"], n: number) {
    setPremio(tipo === "meses" ? { tipo, meses: n } : tipo === "bono" ? { tipo, monto: n } : { tipo, porcentaje: n });
  }
  function usarPlantilla(p: (typeof plantillas)[number]) {
    setPeriodo(p.periodo);
    setMeta(p.meta);
    setPremio(p.premio);
    setTitulo("");
  }

  async function guardar() {
    const db = obtenerDb();
    if (!db) return;
    if (!rango) return setError("Revisa las fechas: el final debe ser después del inicio.");
    if (!(numMeta > 0) || !(numPremio > 0)) return setError("Escribe números mayores a cero.");
    if ((premio.tipo === "masCaro" || premio.tipo === "comision") && premio.porcentaje > 100) return setError("El porcentaje no puede pasar de 100.");
    setGuardando(true);
    setError("");
    try {
      const ref = doc(collection(db, "eventos"));
      const evento: Evento = {
        id: ref.id,
        titulo: (titulo.trim() || tituloAuto).slice(0, 120),
        descripcion: descripcion.trim().slice(0, 500),
        inicio: rango.inicio,
        fin: rango.fin,
        meta,
        premio,
        estado: "activo",
        creado: momentoActual(),
      };
      await setDoc(ref, evento);
      cerrar();
    } catch (e) {
      setError(mensajeError(e));
      setGuardando(false);
    }
  }

  const campo = "w-full rounded-xl bg-arena/60 px-3 py-2 text-sm ring-1 ring-arena-oscura focus:outline-none focus:ring-terracota";

  return (
    <section className="grid gap-4 rounded-3xl bg-white p-5 ring-1 ring-terracota/40">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Nuevo evento</h2>
        <button onClick={cerrar} aria-label="Cerrar" className="rounded-full p-1 hover:bg-arena">
          <X className="size-5" />
        </button>
      </div>

      <div>
        <p className="mb-1 text-xs font-semibold text-cafe">Ejemplos rápidos</p>
        <div className="flex flex-wrap gap-2">
          {plantillas.map((p) => (
            <button key={p.nombre} onClick={() => usarPlantilla(p)} className="rounded-full bg-arena px-3 py-1.5 text-xs hover:bg-arena-oscura/40">
              {p.nombre}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <label className="grid gap-1 text-sm">
          <span className="font-semibold">¿Cuándo?</span>
          <select value={periodo} onChange={(e) => setPeriodo(e.target.value as Periodo)} className={campo}>
            <option value="semana">Esta semana (lunes a domingo)</option>
            <option value="mes">Este mes</option>
            <option value="proxima-semana">La próxima semana</option>
            <option value="proximo-mes">El próximo mes</option>
            <option value="fechas">Elegir fechas</option>
          </select>
        </label>
        {periodo === "fechas" && (
          <>
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Desde</span>
              <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={campo} />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="font-semibold">Hasta (incluido)</span>
              <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className={campo} />
            </label>
          </>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1 text-sm">
          <span className="font-semibold">Reto</span>
          <div className="flex gap-2">
            <select value={meta.tipo} onChange={(e) => cambiarMeta(e.target.value as MetaEvento["tipo"], numMeta)} className={campo}>
              <option value="monto">Vender más de… ($)</option>
              <option value="piezas">Vender más de… (piezas)</option>
              <option value="top">Los que más vendan (cuántos)</option>
            </select>
            <input type="number" min={1} value={numMeta || ""} onChange={(e) => cambiarMeta(meta.tipo, Number(e.target.value))} className={`${campo} w-28`} />
          </div>
        </div>
        <div className="grid gap-1 text-sm">
          <span className="font-semibold">Premio</span>
          <div className="flex gap-2">
            <select value={premio.tipo} onChange={(e) => cambiarPremio(e.target.value as PremioEvento["tipo"], numPremio)} className={campo}>
              <option value="meses">Meses de mensualidad gratis</option>
              <option value="bono">Bono en dinero ($)</option>
              <option value="masCaro">% de su producto más caro</option>
              <option value="comision">% de comisión devuelta</option>
            </select>
            <input type="number" min={1} value={numPremio || ""} onChange={(e) => cambiarPremio(premio.tipo, Number(e.target.value))} className={`${campo} w-28`} />
          </div>
        </div>
      </div>

      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Título (opcional)</span>
        <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder={tituloAuto} maxLength={120} className={campo} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Mensaje para los vendedores (opcional)</span>
        <textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} rows={2} maxLength={500} placeholder="Ej.: ¡Aprovecha el Buen Fin!" className={campo} />
      </label>

      <div className="rounded-2xl bg-arena/60 p-3 text-sm">
        <p className="font-semibold">Así lo verán los vendedores:</p>
        <p>
          🏆 {titulo.trim() || tituloAuto}
        </p>
        <p className="text-cafe">
          {textoMeta(meta)} y gana {textoPremio(premio)}. {rango ? textoPeriodo(rango) : "Fechas incompletas"}.
        </p>
        <p className="mt-1 text-xs text-cafe">Cuentan las ventas pagadas dentro de esas fechas (productos, sin envío). Pedidos cancelados no cuentan.</p>
      </div>

      {error && <p role="alert" className="text-sm text-rosa">{error}</p>}
      <div className="flex gap-2">
        <button onClick={guardar} disabled={guardando} className="flex items-center gap-1.5 rounded-full bg-terracota px-5 py-2 text-sm font-semibold text-crema disabled:opacity-60">
          {guardando && <Loader2 className="size-4 animate-spin" />} Publicar evento
        </button>
        <button onClick={cerrar} className="rounded-full px-4 py-2 text-sm ring-1 ring-arena-oscura">
          Cancelar
        </button>
      </div>
    </section>
  );
}
