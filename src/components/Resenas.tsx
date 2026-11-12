"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Loader2, MessageSquareText, Star, Trash2 } from "lucide-react";
import { obtenerDb } from "@/lib/firebase";
import { fechaResena, MAX_TEXTO_RESENA, promedio, type Resena, type TipoResena } from "@/lib/resenas";
import { usePedidosDe } from "@/lib/usar-pedidos";
import { useSesion } from "./Sesion";

// Estrellas de solo lectura
export function Estrellas({ valor, tamano = "size-4" }: { valor: number; tamano?: string }) {
  return (
    <span className="inline-flex" aria-label={`${valor} de 5 estrellas`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} className={`${tamano} ${n <= Math.round(valor) ? "fill-maiz text-maiz" : "text-arena-oscura"}`} />
      ))}
    </span>
  );
}

function ElegirEstrellas({ valor, cambiar }: { valor: number; cambiar: (n: number) => void }) {
  const [encima, setEncima] = useState(0);
  const textos = ["", "Malo", "Regular", "Bueno", "Muy bueno", "¡Excelente!"];
  const mostrar = encima || valor;
  return (
    <div className="flex items-center gap-2">
      <div className="flex" onMouseLeave={() => setEncima(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => cambiar(n)}
            onMouseEnter={() => setEncima(n)}
            aria-label={`${n} ${n === 1 ? "estrella" : "estrellas"}`}
            className="p-0.5"
          >
            <Star className={`size-8 transition ${n <= mostrar ? "fill-maiz text-maiz" : "text-arena-oscura"}`} />
          </button>
        ))}
      </div>
      <span className="text-sm font-semibold text-cafe">{textos[mostrar]}</span>
    </div>
  );
}

function useResenas(tipo: TipoResena, objetivo: string) {
  const [estado, setEstado] = useState<{ clave: string; lista: Resena[] }>({ clave: "", lista: [] });
  const clave = `${tipo}:${objetivo}`;
  useEffect(() => {
    const db = obtenerDb();
    if (!db) return;
    // Producto: sus reseñas. Tienda: todas (de la tienda y de sus productos)
    const q =
      tipo === "producto"
        ? query(collection(db, "resenas"), where("tipo", "==", "producto"), where("objetivo", "==", objetivo))
        : query(collection(db, "resenas"), where("creador", "==", objetivo));
    return onSnapshot(
      q,
      (s) => setEstado({ clave, lista: s.docs.map((d) => d.data() as Resena).sort((a, b) => b.fecha - a.fecha) }),
      () => setEstado({ clave, lista: [] }),
    );
  }, [tipo, objetivo, clave]);
  return estado.clave === clave ? { lista: estado.lista, cargando: false } : { lista: [], cargando: true };
}

// Reseñas de un producto o de una tienda, con el formulario para quien compró
export function Resenas({ tipo, objetivo, creadorUid, className = "mt-8" }: { tipo: TipoResena; objetivo: string; creadorUid?: string; className?: string }) {
  const { usuario } = useSesion();
  const { lista, cargando } = useResenas(tipo, objetivo);
  const { pedidos } = usePedidosDe(usuario?.uid);
  const [verTodas, setVerTodas] = useState(false);

  const compro = !!usuario && pedidos.some(
    (p) =>
      p.uid === usuario.uid &&
      ["pagado", "enviado", "entregado"].includes(p.estado) &&
      p.grupos.some((g) => (tipo === "tienda" ? g.creador === objetivo : g.articulos.some((a) => a.slug === objetivo))),
  );
  const esDueno = !!usuario && usuario.uid === creadorUid;
  const mia = usuario ? lista.find((r) => r.uid === usuario.uid && r.tipo === tipo && r.objetivo === objetivo) : undefined;
  const { calificacion, resenas } = promedio(lista.map((r) => r.estrellas));
  const conteo = [5, 4, 3, 2, 1].map((n) => ({ n, cuantas: lista.filter((r) => r.estrellas === n).length }));
  const visibles = verTodas ? lista : lista.slice(0, 5);

  return (
    <section className={`scroll-mt-24 ${className}`} id="resenas">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold sm:text-2xl">
        <MessageSquareText className="size-5 text-terracota" /> {tipo === "producto" ? "Opiniones del producto" : "Opiniones de la tienda"}
      </h2>

      <div className="grid gap-4 md:grid-cols-[280px_minmax(0,1fr)]">
        {/* Resumen */}
        <div className="h-fit rounded-3xl bg-white p-5 ring-1 ring-arena-oscura/60">
          {resenas ? (
            <>
              <p className="flex items-end gap-2">
                <span className="font-display text-5xl font-extrabold">{calificacion.toFixed(1)}</span>
                <span className="pb-1.5 text-sm text-cafe">de 5</span>
              </p>
              <Estrellas valor={calificacion} tamano="size-5" />
              <p className="mt-1 text-sm text-cafe">
                {resenas} {resenas === 1 ? "opinión" : "opiniones"}
              </p>
              <ul className="mt-3 grid gap-1 text-xs">
                {conteo.map((c) => (
                  <li key={c.n} className="flex items-center gap-2">
                    <span className="w-3 text-right">{c.n}</span>
                    <Star className="size-3 fill-maiz text-maiz" />
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-arena">
                      <span className="block h-full rounded-full bg-maiz" style={{ width: `${(c.cuantas / resenas) * 100}%` }} />
                    </span>
                    <span className="w-5 text-cafe">{c.cuantas}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-cafe">{cargando ? "Cargando opiniones…" : "Todavía no hay opiniones. ¡La primera puede ser la tuya!"}</p>
          )}
        </div>

        <div className="grid gap-3">
          {/* Formulario */}
          {!esDueno &&
            (compro ? (
              <Formulario tipo={tipo} objetivo={objetivo} mia={mia} />
            ) : (
              <p className="rounded-2xl bg-arena/60 px-4 py-3 text-sm text-cafe">
                {usuario ? (
                  tipo === "producto" ? "Solo quien compró este producto puede opinar. Así todas las opiniones son reales." : "Solo quien compró en esta tienda puede calificarla."
                ) : (
                  <>
                    ¿Ya compraste?{" "}
                    <Link href="/entrar" className="font-semibold text-terracota underline">
                      Entra
                    </Link>{" "}
                    para dejar tu opinión.
                  </>
                )}
              </p>
            ))}

          {/* Lista */}
          {visibles.map((r) => (
            <article key={r.id} className="rounded-2xl bg-white p-4 ring-1 ring-arena-oscura/60">
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid size-8 place-items-center rounded-full bg-terracota/15 text-sm font-bold text-terracota">{r.nombre.slice(0, 1)}</span>
                <span className="text-sm font-semibold">{r.nombre}</span>
                <Estrellas valor={r.estrellas} />
                <span className="ml-auto text-xs text-cafe">
                  {fechaResena(r.fecha)}
                  {r.editada ? " · editada" : ""}
                </span>
              </div>
              {tipo === "tienda" && r.tipo === "producto" && r.producto && <p className="mt-1 text-xs text-cafe">Sobre: {r.producto}</p>}
              {r.texto && <p className="mt-2 text-sm whitespace-pre-line">{r.texto}</p>}
              <p className="mt-2 text-[11px] font-semibold text-jade">✓ Compra verificada</p>
            </article>
          ))}
          {lista.length > 5 && (
            <button onClick={() => setVerTodas(!verTodas)} className="justify-self-start rounded-full px-4 py-2 text-sm font-semibold text-terracota ring-1 ring-terracota/40">
              {verTodas ? "Ver menos" : `Ver las ${lista.length} opiniones`}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function Formulario({ tipo, objetivo, mia }: { tipo: TipoResena; objetivo: string; mia?: Resena }) {
  const { usuario } = useSesion();
  const [editando, setEditando] = useState(false);
  const [estrellas, setEstrellas] = useState(mia?.estrellas ?? 0);
  const [texto, setTexto] = useState(mia?.texto ?? "");
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [gracias, setGracias] = useState(false);

  async function enviar(cuerpo: Record<string, unknown>) {
    if (!usuario) return false;
    setOcupado(true);
    setError("");
    try {
      const r = await fetch("/api/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${await usuario.getIdToken()}` },
        body: JSON.stringify(cuerpo),
      });
      const datos = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(datos.error ?? "No se pudo guardar.");
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    } finally {
      setOcupado(false);
    }
  }

  async function guardar() {
    if (!estrellas) return setError("Elige cuántas estrellas.");
    if (await enviar({ tipo, objetivo, estrellas, texto })) {
      setEditando(false);
      setGracias(true);
    }
  }

  async function borrar() {
    if (!mia || !window.confirm("¿Borrar tu opinión?")) return;
    if (await enviar({ borrar: mia.id })) {
      setEstrellas(0);
      setTexto("");
      setGracias(false);
    }
  }

  if (mia && !editando) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-jade/10 px-4 py-3 text-sm">
        <span className="min-w-0 flex-1">{gracias ? "¡Gracias por tu opinión! 🎉" : "Ya dejaste tu opinión."}</span>
        <button
          onClick={() => {
            setEstrellas(mia.estrellas);
            setTexto(mia.texto);
            setEditando(true);
          }}
          className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold ring-1 ring-arena-oscura"
        >
          Editar
        </button>
        <button onClick={borrar} disabled={ocupado} className="flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs text-rosa ring-1 ring-rosa/40">
          <Trash2 className="size-3.5" /> Borrar
        </button>
        {error && <p className="w-full text-rosa">{error}</p>}
      </div>
    );
  }

  return (
    <div className="grid gap-3 rounded-2xl bg-white p-4 ring-1 ring-terracota/40">
      <p className="text-sm font-semibold">{tipo === "producto" ? "¿Qué te pareció este producto?" : "¿Cómo fue tu experiencia con esta tienda?"}</p>
      <ElegirEstrellas valor={estrellas} cambiar={setEstrellas} />
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={3}
        maxLength={MAX_TEXTO_RESENA}
        placeholder={tipo === "producto" ? "Cuenta cómo llegó, la calidad, si se parece a las fotos… (opcional)" : "Atención, tiempos de entrega, empaque… (opcional)"}
        className="w-full rounded-xl bg-arena/60 px-3 py-2 text-sm ring-1 ring-arena-oscura focus:outline-none focus:ring-terracota"
      />
      {error && <p role="alert" className="text-sm text-rosa">{error}</p>}
      <div className="flex gap-2">
        <button onClick={guardar} disabled={ocupado} className="flex items-center gap-1.5 rounded-full bg-terracota px-5 py-2 text-sm font-semibold text-crema disabled:opacity-60">
          {ocupado && <Loader2 className="size-4 animate-spin" />} Publicar opinión
        </button>
        {editando && (
          <button onClick={() => setEditando(false)} className="rounded-full px-4 py-2 text-sm ring-1 ring-arena-oscura">
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
