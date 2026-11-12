"use client";

import { useState } from "react";
import { doc, updateDoc } from "firebase/firestore";
import { Check, Copy, Loader2, X } from "lucide-react";
import { estados, type Creador } from "@/lib/datos";
import { mensajeError, obtenerDb } from "@/lib/firebase";
import { useSesion } from "../Sesion";
import { llamar } from "./datos";

type Perfil = Pick<Creador, "taller" | "nombre" | "especialidad" | "historia" | "estado" | "ciudad">;
const campo = "w-full rounded-xl bg-arena/60 px-3 py-2 text-sm ring-1 ring-arena-oscura focus:outline-none focus:ring-terracota";

function Campos({ p, poner }: { p: Perfil; poner: (k: keyof Perfil, v: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Nombre de la tienda *</span>
        <input className={campo} maxLength={60} value={p.taller} onChange={(e) => poner("taller", e.target.value)} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Nombre de la persona</span>
        <input className={campo} maxLength={80} value={p.nombre} onChange={(e) => poner("nombre", e.target.value)} />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-semibold">¿Qué hace?</span>
        <input className={campo} maxLength={80} value={p.especialidad} onChange={(e) => poner("especialidad", e.target.value)} placeholder="Ej. Velas aromáticas" />
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Estado</span>
        <select className={campo} value={p.estado} onChange={(e) => poner("estado", e.target.value)}>
          {estados.map((e) => (
            <option key={e.slug} value={e.slug}>
              {e.nombre}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm">
        <span className="font-semibold">Ciudad</span>
        <input className={campo} maxLength={60} value={p.ciudad} onChange={(e) => poner("ciudad", e.target.value)} />
      </label>
      <label className="grid gap-1 text-sm sm:col-span-2">
        <span className="font-semibold">Historia</span>
        <textarea className={campo} rows={3} maxLength={600} value={p.historia} onChange={(e) => poner("historia", e.target.value)} />
      </label>
    </div>
  );
}

function Marco({ titulo, cerrar, children }: { titulo: string; cerrar: () => void; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 rounded-3xl bg-white p-5 ring-1 ring-terracota/40">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">{titulo}</h2>
        <button onClick={cerrar} aria-label="Cerrar" className="rounded-full p-1 hover:bg-arena">
          <X className="size-5" />
        </button>
      </div>
      {children}
    </section>
  );
}

// La administración corrige el perfil de cualquier tienda
export function EditarTienda({ c, cerrar }: { c: Creador; cerrar: () => void }) {
  const [p, setP] = useState<Perfil>({ taller: c.taller, nombre: c.nombre, especialidad: c.especialidad, historia: c.historia, estado: c.estado, ciudad: c.ciudad });
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");

  async function guardar() {
    const db = obtenerDb();
    if (!db) return;
    if (p.taller.trim().length < 2) return setError("Escribe el nombre de la tienda.");
    setOcupado(true);
    setError("");
    try {
      await updateDoc(doc(db, "creadores", c.slug), { ...p, taller: p.taller.trim() });
      cerrar();
    } catch (e) {
      setError(mensajeError(e));
      setOcupado(false);
    }
  }

  return (
    <Marco titulo={`Editar perfil de ${c.taller}`} cerrar={cerrar}>
      <Campos p={p} poner={(k, v) => setP({ ...p, [k]: v })} />
      <p className="text-xs text-cafe">Los productos, fotos y la cuenta de cobro los cambia la tienda desde su panel.</p>
      {error && <p className="text-sm text-rosa">{error}</p>}
      <button onClick={guardar} disabled={ocupado} className="flex items-center gap-1.5 justify-self-start rounded-full bg-terracota px-5 py-2 text-sm font-semibold text-crema disabled:opacity-60">
        {ocupado && <Loader2 className="size-4 animate-spin" />} Guardar cambios
      </button>
    </Marco>
  );
}

// Crear una tienda para alguien (por ejemplo, un artesano sin experiencia) y mandarle su liga
export function NuevaTienda({ cerrar }: { cerrar: () => void }) {
  const { usuario } = useSesion();
  const [p, setP] = useState<Perfil>({ taller: "", nombre: "", especialidad: "", historia: "", estado: "michoacan", ciudad: "" });
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState("");
  const [enlace, setEnlace] = useState("");
  const [copiado, setCopiado] = useState(false);

  async function crear() {
    if (!usuario) return;
    if (p.taller.trim().length < 2) return setError("Escribe el nombre de la tienda.");
    setOcupado(true);
    setError("");
    try {
      const r = await llamar<{ enlace: string }>(usuario, "/api/admin/tiendas", p);
      setEnlace(r.enlace);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setOcupado(false);
    }
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(enlace);
      setCopiado(true);
    } catch {
      window.prompt("Copia la liga:", enlace);
    }
  }

  if (enlace) {
    const mensaje = encodeURIComponent(`¡Hola! Te preparé tu tienda en XICO. Ábrela aquí y acéptala con tu cuenta de Google: ${enlace}`);
    return (
      <Marco titulo="Tienda creada" cerrar={cerrar}>
        <p className="text-sm">
          Mándale esta liga a la persona. Cuando la abra y la acepte con su cuenta, la tienda quedará a su nombre y podrá subir productos. Mientras tanto, no se
          muestra en XICO. <strong>La liga sirve una sola vez; no la compartas con nadie más.</strong>
        </p>
        <p className="rounded-xl bg-arena/60 px-3 py-2 font-mono text-xs break-all">{enlace}</p>
        <div className="flex flex-wrap gap-2">
          <button onClick={copiar} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-sm ring-1 ring-arena-oscura">
            {copiado ? <Check className="size-4" /> : <Copy className="size-4" />} {copiado ? "Copiada" : "Copiar liga"}
          </button>
          <a href={`https://wa.me/?text=${mensaje}`} target="_blank" rel="noopener noreferrer" className="rounded-full bg-jade px-4 py-2 text-sm font-semibold text-white">
            Enviar por WhatsApp
          </a>
        </div>
      </Marco>
    );
  }

  return (
    <Marco titulo="Crear tienda para alguien" cerrar={cerrar}>
      <p className="text-sm text-cafe">
        Llena lo que sepas. Se crea la tienda (ya aprobada) y te damos una liga para que su dueño la acepte con su cuenta. Sus 3 meses gratis empiezan ese día.
      </p>
      <Campos p={p} poner={(k, v) => setP({ ...p, [k]: v })} />
      {error && <p className="text-sm text-rosa">{error}</p>}
      <button onClick={crear} disabled={ocupado} className="flex items-center gap-1.5 justify-self-start rounded-full bg-terracota px-5 py-2 text-sm font-semibold text-crema disabled:opacity-60">
        {ocupado && <Loader2 className="size-4 animate-spin" />} Crear tienda y obtener liga
      </button>
    </Marco>
  );
}
