"use client";

import { useEffect, useState } from "react";
import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { Check, Copy, Database, ExternalLink, Loader2, ShieldCheck } from "lucide-react";
import { catalogoEjemplo } from "@/lib/ejemplo";
import { mensajeError, obtenerDb } from "@/lib/firebase";
import { firebaseConfig } from "@/lib/firebase-config";
import { reglasFirestore } from "@/lib/reglas";
import { FormularioEntrar } from "./FormularioEntrar";
import { useSesion } from "./Sesion";

type Conteo = { productos: number; creadores: number } | "error" | null;

export function VistaAdmin() {
  const { usuario, cargando, configurado } = useSesion();
  const [copiado, setCopiado] = useState(false);
  const [conteo, setConteo] = useState<Conteo>(null);
  const [importando, setImportando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [version, setVersion] = useState(0); // para volver a contar

  // Cuántos productos y creadores hay en Firestore
  useEffect(() => {
    const db = obtenerDb();
    if (!db || !usuario) return;
    let activo = true;
    Promise.all([getDocs(collection(db, "productos")), getDocs(collection(db, "creadores"))])
      .then(([p, c]) => activo && setConteo({ productos: p.size, creadores: c.size }))
      .catch(() => activo && setConteo("error"));
    return () => {
      activo = false;
    };
  }, [usuario, version]);

  if (!configurado) return <p className="text-cafe">Firebase no está configurado (.env.local).</p>;
  if (cargando) return <div className="h-48 animate-pulse rounded-3xl bg-arena" />;
  if (!usuario) {
    return (
      <div className="max-w-md rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60">
        <p className="mb-4 text-sm text-cafe">Entra con la cuenta de Google que administrará XICO.</p>
        <FormularioEntrar volver="/admin" />
      </div>
    );
  }

  const correo = usuario.email ?? "";
  const reglas = reglasFirestore(correo);
  const urlReglas = `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/rules`;

  async function copiar() {
    await navigator.clipboard.writeText(reglas);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  async function importar() {
    const db = obtenerDb();
    if (!db) return;
    setImportando(true);
    setMensaje(null);
    try {
      const { productos, creadores } = catalogoEjemplo();
      const lote = writeBatch(db);
      creadores.forEach((c) => lote.set(doc(db, "creadores", c.slug), c));
      productos.forEach((p) => lote.set(doc(db, "productos", p.slug), p));
      await lote.commit();
      setMensaje({
        tipo: "ok",
        texto: `Listo: se guardaron ${productos.length} productos y ${creadores.length} creadores. La tienda los muestra en 1 a 2 minutos.`,
      });
      setVersion((v) => v + 1);
    } catch (e) {
      setMensaje({ tipo: "error", texto: mensajeError(e) });
    } finally {
      setImportando(false);
    }
  }

  return (
    <div className="grid gap-6">
      <p className="text-sm text-cafe">
        Cuenta administradora: <strong className="text-tinta">{correo || "(sin correo: entra con Google)"}</strong>
      </p>

      {/* Paso 1 */}
      <section className="rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
          <ShieldCheck className="size-5 text-jade" /> 1. Publica las reglas de seguridad
        </h2>
        <ol className="mt-3 grid list-decimal gap-1 pl-5 text-sm text-cafe">
          <li>Copia las reglas (ya llevan tu correo como administrador).</li>
          <li>
            Abre{" "}
            <a href={urlReglas} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 font-semibold text-terracota hover:underline">
              Firestore → Reglas <ExternalLink className="size-3.5" />
            </a>
            , borra lo que haya, pega y presiona <strong>Publicar</strong>.
          </li>
        </ol>
        <pre className="mt-4 max-h-64 overflow-auto rounded-2xl bg-tinta p-4 text-xs leading-relaxed text-crema">{reglas}</pre>
        <button onClick={copiar} className="mt-3 flex items-center gap-2 rounded-full bg-tinta px-4 py-2 text-sm font-semibold text-crema hover:bg-tinta/85">
          {copiado ? <Check className="size-4" /> : <Copy className="size-4" />} {copiado ? "Copiado" : "Copiar reglas"}
        </button>
      </section>

      {/* Paso 2 */}
      <section className="rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60">
        <h2 className="flex items-center gap-2 font-display text-xl font-semibold">
          <Database className="size-5 text-terracota" /> 2. Importa los datos de ejemplo
        </h2>
        <p className="mt-2 text-sm text-cafe">
          En la base de datos hay ahora:{" "}
          {conteo === null ? (
            "contando…"
          ) : conteo === "error" ? (
            <span className="text-rosa">no se pudo leer (¿ya creaste la base de datos y publicaste las reglas?)</span>
          ) : (
            <strong className="text-tinta">
              {conteo.productos} productos y {conteo.creadores} creadores
            </strong>
          )}
          .
        </p>
        <p className="mt-1 text-sm text-cafe">
          Esto copia los 16 productos y 6 creadores de prueba. Si ya existen, los vuelve a escribir igual (no duplica).
        </p>
        <button
          onClick={importar}
          disabled={importando}
          className="mt-4 flex items-center gap-2 rounded-full bg-terracota px-5 py-2.5 font-semibold text-crema hover:bg-terracota-oscura disabled:opacity-60"
        >
          {importando && <Loader2 className="size-4 animate-spin" />} Importar datos de ejemplo
        </button>
        {mensaje && (
          <p
            role={mensaje.tipo === "error" ? "alert" : "status"}
            className={`mt-4 rounded-xl px-4 py-3 text-sm ${mensaje.tipo === "ok" ? "bg-jade/10 text-jade" : "bg-rosa/10 text-rosa"}`}
          >
            {mensaje.texto}
          </p>
        )}
      </section>
    </div>
  );
}
