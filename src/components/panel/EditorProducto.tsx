"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Loader2, Trash2 } from "lucide-react";
import {
  categorias,
  paletaMexicana,
  type CategoriaSlug,
  type Creador,
  type OpcionPersonalizacion,
  type Producto,
} from "@/lib/datos";
import { mensajeError } from "@/lib/firebase";
import { guardarProducto, leerProducto, type DatosProducto } from "@/lib/panel";
import { TarjetaProducto } from "../TarjetaProducto";
import { borrarFoto } from "@/lib/fotos";
import { AsistenteIA } from "./AsistenteIA";
import { EditorFotos } from "./EditorFotos";
import { ConTienda } from "./ConTienda";

const tiempos = ["Listo para enviar", "1 a 3 días", "3 a 5 días", "5 a 7 días", "7 a 10 días", "10 a 15 días", "15 a 30 días"];
const formas: { valor: Producto["forma"]; texto: string }[] = [
  { valor: "cuadrada", texto: "Cuadrada" },
  { valor: "media", texto: "Vertical" },
  { valor: "alta", texto: "Alta" },
];

export function EditorProducto({ slug }: { slug?: string }) {
  return (
    <ConTienda volver={slug ? `/panel/producto/${slug}` : "/panel/producto/nuevo"}>
      {(creador) => <Cargador creador={creador} slug={slug} />}
    </ConTienda>
  );
}

// Si es edición, primero trae el producto y confirma que sea de esta tienda
function Cargador({ creador, slug }: { creador: Creador; slug?: string }) {
  const [estado, setEstado] = useState<{ producto?: Producto | null; listo: boolean }>({ listo: !slug });

  useEffect(() => {
    if (!slug) return;
    let activo = true;
    leerProducto(slug).then((p) => activo && setEstado({ producto: p, listo: true }));
    return () => {
      activo = false;
    };
  }, [slug]);

  if (!estado.listo) return <div className="h-96 animate-pulse rounded-3xl bg-arena" />;
  if (slug && (!estado.producto || estado.producto.creador !== creador.slug)) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-arena-oscura/60">
        <p className="font-display text-xl font-semibold">Este producto no existe o no es de tu tienda.</p>
        <Link href="/panel" className="mt-4 inline-block text-terracota hover:underline">← Volver a mi tienda</Link>
      </div>
    );
  }
  return <Formulario creador={creador} existente={estado.producto ?? undefined} />;
}

function Formulario({ creador, existente }: { creador: Creador; existente?: Producto }) {
  const router = useRouter();
  const [d, setD] = useState<DatosProducto>({
    nombre: existente?.nombre ?? "",
    categoria: existente?.categoria ?? "regalos",
    precio: existente?.precio ?? 0,
    precioAntes: existente?.precioAntes,
    descripcion: existente?.descripcion ?? "",
    materiales: existente?.materiales ?? "",
    diasElaboracion: existente?.diasElaboracion ?? "Listo para enviar",
    colores: existente?.colores ?? ["#c4511f", "#e9a824"],
    forma: existente?.forma ?? "cuadrada",
    personalizacion: existente?.personalizacion ?? [],
    paquete: existente?.paquete,
    fotos: existente?.fotos ?? [],
  });
  const [errores, setErrores] = useState<string[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState("");

  const poner = <K extends keyof DatosProducto>(k: K, v: DatosProducto[K]) => setD((x) => ({ ...x, [k]: v }));
  const opciones = d.personalizacion ?? [];
  const ponerOpciones = (o: OpcionPersonalizacion[]) => poner("personalizacion", o);

  function validar() {
    const e: string[] = [];
    if (d.nombre.trim().length < 3) e.push("El nombre debe tener al menos 3 letras.");
    if (!(d.precio > 0)) e.push("Pon un precio mayor a $0.");
    if (d.precioAntes && d.precioAntes <= d.precio) e.push("El precio anterior debe ser mayor al precio actual (si no hay oferta, déjalo vacío).");
    if (d.descripcion.trim().length < 10) e.push("Escribe una descripción de al menos 10 letras.");
    const pq = d.paquete;
    if (pq && (pq.pesoKg || pq.largoCm || pq.anchoCm || pq.altoCm)) {
      if (!(pq.pesoKg > 0 && pq.pesoKg <= 70)) e.push("El peso del paquete debe estar entre 0.1 y 70 kg.");
      if (![pq.largoCm, pq.anchoCm, pq.altoCm].every((m) => m >= 1 && m <= 200)) e.push("Las medidas del paquete deben estar entre 1 y 200 cm.");
    }
    opciones.forEach((o, i) => {
      if (!o.etiqueta.trim()) e.push(`La opción ${i + 1} de personalización necesita un título.`);
      if (o.tipo === "extra" && !(o.precio > 0)) e.push(`La opción "${o.etiqueta || i + 1}" necesita un costo mayor a $0.`);
      if (o.tipo === "colores" && o.opciones.length < 2) e.push(`La opción "${o.etiqueta || i + 1}" necesita al menos 2 colores.`);
    });
    return e;
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const fallos = validar();
    setErrores(fallos);
    if (fallos.length) return;
    setOcupado(true);
    setErrorGuardar("");
    try {
      await guardarProducto(
        creador,
        {
          ...d,
          nombre: d.nombre.trim(),
          descripcion: d.descripcion.trim(),
          precioAntes: d.precioAntes || undefined,
          // Solo se guarda si está completo
          paquete: d.paquete && d.paquete.pesoKg > 0 && d.paquete.largoCm > 0 && d.paquete.anchoCm > 0 && d.paquete.altoCm > 0 ? d.paquete : undefined,
        },
        existente,
      );
      // Las fotos que se quitaron se borran del almacenamiento hasta que se guarda
      const quedan = new Set((d.fotos ?? []).map((x) => x.ruta));
      (existente?.fotos ?? []).filter((x) => !quedan.has(x.ruta)).forEach((x) => borrarFoto(x));
      router.push("/panel");
    } catch (err) {
      setErrorGuardar(mensajeError(err));
      setOcupado(false);
    }
  }

  // Vista previa de la tarjeta tal como se verá en la tienda
  const vista = {
    slug: existente?.slug ?? "vista-previa",
    nombre: d.nombre || "Nombre de tu producto",
    taller: creador.taller,
    estado: creador.estado,
    categoria: d.categoria,
    precio: d.precio || 0,
    precioAntes: d.precioAntes && d.precioAntes > d.precio ? d.precioAntes : undefined,
    calificacion: existente?.calificacion ?? 0,
    nuevo: !existente,
    personalizable: opciones.length > 0,
    colores: d.colores,
    forma: d.forma,
    ...(d.fotos?.[0] ? { foto: d.fotos[0].mini } : {}),
  };

  const campo = "h-11 w-full rounded-xl border border-arena-oscura bg-white px-3.5 text-sm outline-none focus:border-terracota focus:ring-2 focus:ring-terracota/15";
  const etiqueta = "grid gap-1.5 text-sm font-medium";
  const tarjeta = "rounded-3xl bg-white p-5 ring-1 ring-arena-oscura/60 sm:p-6";

  return (
    <form onSubmit={guardar} className="grid gap-6 lg:grid-cols-[1fr_280px]">
      <div className="grid content-start gap-6">
        <Link href="/panel" className="text-sm text-cafe hover:underline">← Volver a mi tienda</Link>

        <AsistenteIA aplicar={(cambios) => setD((x) => ({ ...x, ...cambios }))} />

        {/* Básico */}
        <section className={tarjeta}>
          <h2 className="mb-4 font-display text-xl font-semibold">Lo básico</h2>
          <div className="grid gap-4">
            <label className={etiqueta}>
              Nombre del producto *
              <input className={campo} maxLength={120} value={d.nombre} onChange={(e) => poner("nombre", e.target.value)} placeholder="Ej. Taza de talavera con tu nombre" />
            </label>
            <label className={etiqueta}>
              Categoría
              <select className={campo} value={d.categoria} onChange={(e) => poner("categoria", e.target.value as CategoriaSlug)}>
                {categorias.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.nombre}</option>
                ))}
              </select>
            </label>
            <label className={etiqueta}>
              Descripción *
              <textarea
                className={`${campo} h-32 py-2.5`}
                maxLength={2000}
                value={d.descripcion}
                onChange={(e) => poner("descripcion", e.target.value)}
                placeholder="¿Cómo es? ¿Cómo lo haces? ¿Qué lo hace especial? Medidas, cuidados…"
              />
            </label>
          </div>
        </section>

        {/* Precio y tiempos */}
        <section className={tarjeta}>
          <h2 className="mb-4 font-display text-xl font-semibold">Precio y tiempos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={etiqueta}>
              Precio (MXN) *
              <input className={campo} type="number" inputMode="numeric" min={1} max={200000} value={d.precio || ""} onChange={(e) => poner("precio", Number(e.target.value))} placeholder="350" />
            </label>
            <label className={etiqueta}>
              Precio anterior (opcional)
              <input className={campo} type="number" inputMode="numeric" min={1} value={d.precioAntes || ""} onChange={(e) => poner("precioAntes", Number(e.target.value) || undefined)} placeholder="Para mostrarlo como oferta" />
            </label>
            <label className={etiqueta}>
              Tiempo de elaboración
              <select className={campo} value={d.diasElaboracion} onChange={(e) => poner("diasElaboracion", e.target.value)}>
                {tiempos.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
            <label className={etiqueta}>
              Materiales
              <input className={campo} maxLength={150} value={d.materiales} onChange={(e) => poner("materiales", e.target.value)} placeholder="Ej. Barro, esmalte de talavera" />
            </label>
          </div>
          <p className="mt-3 text-xs text-cafe">XICO cobra una comisión por venta; la verás al conectar los pagos (Fase 6).</p>
        </section>

        {/* Fotos */}
        <section className={tarjeta}>
          <h2 className="font-display text-xl font-semibold">📸 Fotos</h2>
          <p className="mt-1 mb-4 text-sm text-cafe">La primera es la portada que verán en la tienda. Puedes subir hasta 6.</p>
          <EditorFotos fotos={d.fotos ?? []} cambiar={(f) => poner("fotos", f)} carpeta={`productos/${creador.slug}`} />
        </section>

        {/* Paquete para el envío */}
        <section className={tarjeta}>
          <h2 className="font-display text-xl font-semibold">📦 Paquete para el envío</h2>
          <p className="mt-1 mb-4 text-sm text-cafe">
            Peso y medidas <strong>ya empacado</strong>. Con esto se calculará el costo real del envío a cada parte de México.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(
              [
                ["pesoKg", "Peso (kg)", 0.1, 70],
                ["largoCm", "Largo (cm)", 1, 200],
                ["anchoCm", "Ancho (cm)", 1, 200],
                ["altoCm", "Alto (cm)", 1, 200],
              ] as const
            ).map(([clave, texto, min, max]) => (
              <label key={clave} className={etiqueta}>
                {texto}
                <input
                  className={campo}
                  type="number"
                  inputMode="decimal"
                  step={clave === "pesoKg" ? 0.1 : 1}
                  min={min}
                  max={max}
                  value={d.paquete?.[clave] || ""}
                  onChange={(e) =>
                    poner("paquete", { pesoKg: 0, largoCm: 0, anchoCm: 0, altoCm: 0, ...d.paquete, [clave]: Number(e.target.value) })
                  }
                />
              </label>
            ))}
          </div>
          <p className="mt-3 text-xs text-cafe">Tip: pesa la pieza dentro de su caja con una báscula de cocina y mide la caja por fuera.</p>
        </section>

        {/* Personalización */}
        <section className={tarjeta}>
          <h2 className="font-display text-xl font-semibold">✍️ Personalización</h2>
          <p className="mt-1 mb-4 text-sm text-cafe">¿Qué puede elegir tu cliente? Si no agregas nada, el producto se vende tal cual.</p>
          <ConstructorOpciones opciones={opciones} cambiar={ponerOpciones} />
        </section>
      </div>

      {/* Columna derecha: apariencia + vista previa + guardar */}
      <aside className="grid content-start gap-5 lg:sticky lg:top-36 lg:self-start">
        <section className={tarjeta}>
          <h2 className="mb-3 font-display text-lg font-semibold">Apariencia</h2>
          <p className="mb-3 text-xs text-cafe">Mientras activamos las fotos, tu producto se muestra con estos colores.</p>
          <div className="flex gap-3">
            {[0, 1].map((i) => (
              <label key={i} className="grid flex-1 gap-1 text-xs font-medium">
                Color {i + 1}
                <input
                  type="color"
                  value={d.colores[i]}
                  onChange={(e) => poner("colores", (i === 0 ? [e.target.value, d.colores[1]] : [d.colores[0], e.target.value]) as [string, string])}
                  className="h-10 w-full cursor-pointer rounded-lg border border-arena-oscura bg-white"
                />
              </label>
            ))}
          </div>
          <label className="mt-3 grid gap-1 text-xs font-medium">
            Forma en el mosaico
            <select className={campo} value={d.forma} onChange={(e) => poner("forma", e.target.value as Producto["forma"])}>
              {formas.map((f) => (
                <option key={f.valor} value={f.valor}>{f.texto}</option>
              ))}
            </select>
          </label>
        </section>

        <div>
          <p className="mb-2 text-xs font-semibold tracking-wider text-cafe uppercase">Vista previa</p>
          <div className="pointer-events-none">
            <TarjetaProducto producto={vista} />
          </div>
        </div>

        {errores.length > 0 && (
          <ul role="alert" className="grid gap-1 rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa">
            {errores.map((e) => (
              <li key={e}>• {e}</li>
            ))}
          </ul>
        )}
        {errorGuardar && <p role="alert" className="rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa">{errorGuardar}</p>}

        <button type="submit" disabled={ocupado} className="flex h-12 items-center justify-center gap-2 rounded-full bg-terracota font-semibold text-crema hover:bg-terracota-oscura disabled:opacity-60">
          {ocupado && <Loader2 className="size-5 animate-spin" />} {existente ? "Guardar cambios" : "Publicar producto"}
        </button>
      </aside>
    </form>
  );
}

// Lista editable de opciones de personalización
function ConstructorOpciones({ opciones, cambiar }: { opciones: OpcionPersonalizacion[]; cambiar: (o: OpcionPersonalizacion[]) => void }) {
  const id = () => Math.random().toString(36).slice(2, 8);
  const agregar = (o: OpcionPersonalizacion) => cambiar([...opciones, o]);
  const actualizar = (i: number, o: OpcionPersonalizacion) => cambiar(opciones.map((x, j) => (j === i ? o : x)));
  const quitar = (i: number) => cambiar(opciones.filter((_, j) => j !== i));
  const mover = (i: number, paso: -1 | 1) => {
    const j = i + paso;
    if (j < 0 || j >= opciones.length) return;
    const copia = [...opciones];
    [copia[i], copia[j]] = [copia[j], copia[i]];
    cambiar(copia);
  };

  const campo = "h-10 w-full rounded-lg border border-arena-oscura bg-white px-3 text-sm outline-none focus:border-terracota";
  const nombres = { texto: "✏️ Texto", colores: "🎨 Colores", foto: "📷 Foto", extra: "➕ Extra con costo" };

  return (
    <div className="grid gap-3">
      {opciones.map((o, i) => (
        <div key={o.id} className="rounded-2xl border border-arena-oscura p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold">{nombres[o.tipo]}</span>
            <span className="flex">
              <button type="button" onClick={() => mover(i, -1)} className="grid size-8 place-items-center rounded-full hover:bg-arena" aria-label="Subir"><ArrowUp className="size-4" /></button>
              <button type="button" onClick={() => mover(i, 1)} className="grid size-8 place-items-center rounded-full hover:bg-arena" aria-label="Bajar"><ArrowDown className="size-4" /></button>
              <button type="button" onClick={() => quitar(i)} className="grid size-8 place-items-center rounded-full text-cafe hover:bg-rosa/10 hover:text-rosa" aria-label="Quitar opción"><Trash2 className="size-4" /></button>
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1 text-xs font-medium sm:col-span-2">
              Título que verá el cliente
              <input className={campo} maxLength={60} value={o.etiqueta} onChange={(e) => actualizar(i, { ...o, etiqueta: e.target.value })} />
            </label>

            {o.tipo === "texto" && (
              <>
                <label className="grid gap-1 text-xs font-medium">
                  Máximo de letras
                  <input className={campo} type="number" min={1} max={200} value={o.max} onChange={(e) => actualizar(i, { ...o, max: Math.max(1, Number(e.target.value)) })} />
                </label>
                <label className="grid gap-1 text-xs font-medium">
                  Ayuda (opcional)
                  <input className={campo} maxLength={80} value={o.ayuda ?? ""} onChange={(e) => actualizar(i, { ...o, ayuda: e.target.value || undefined })} placeholder="Ej. CH, M, G o XG" />
                </label>
              </>
            )}

            {o.tipo === "foto" && (
              <label className="grid gap-1 text-xs font-medium sm:col-span-2">
                Ayuda (opcional)
                <input className={campo} maxLength={80} value={o.ayuda ?? ""} onChange={(e) => actualizar(i, { ...o, ayuda: e.target.value || undefined })} placeholder="Ej. Con buena luz y de frente" />
              </label>
            )}

            {o.tipo === "extra" && (
              <label className="grid gap-1 text-xs font-medium">
                Costo extra (MXN)
                <input className={campo} type="number" min={1} value={o.precio || ""} onChange={(e) => actualizar(i, { ...o, precio: Number(e.target.value) })} />
              </label>
            )}

            {o.tipo === "colores" && (
              <div className="grid gap-1 text-xs font-medium sm:col-span-2">
                Colores disponibles
                <div className="flex flex-wrap gap-2">
                  {paletaMexicana.map((c) => {
                    const activo = o.opciones.some((x) => x.nombre === c.nombre);
                    return (
                      <button
                        key={c.nombre}
                        type="button"
                        aria-pressed={activo}
                        title={c.nombre}
                        onClick={() =>
                          actualizar(i, {
                            ...o,
                            opciones: activo ? o.opciones.filter((x) => x.nombre !== c.nombre) : paletaMexicana.filter((p) => p.nombre === c.nombre || o.opciones.some((x) => x.nombre === p.nombre)),
                          })
                        }
                        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs ${activo ? "border-tinta bg-arena" : "border-arena-oscura opacity-60"}`}
                      >
                        <span className="size-4 rounded-full" style={{ backgroundColor: c.hex }} /> {c.nombre}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {(o.tipo === "texto" || o.tipo === "foto") && (
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <input type="checkbox" className="accent-terracota" checked={!!o.requerido} onChange={(e) => actualizar(i, { ...o, requerido: e.target.checked || undefined })} />
                Obligatorio
              </label>
            )}
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => agregar({ tipo: "texto", id: id(), etiqueta: "Nombre", max: 20, requerido: true })} className="rounded-full border border-arena-oscura px-3 py-1.5 text-sm hover:bg-arena">+ Texto</button>
        <button type="button" onClick={() => agregar({ tipo: "colores", id: id(), etiqueta: "Color", opciones: paletaMexicana.slice(0, 4) })} className="rounded-full border border-arena-oscura px-3 py-1.5 text-sm hover:bg-arena">+ Colores</button>
        <button type="button" onClick={() => agregar({ tipo: "foto", id: id(), etiqueta: "Foto de referencia" })} className="rounded-full border border-arena-oscura px-3 py-1.5 text-sm hover:bg-arena">+ Foto</button>
        <button type="button" onClick={() => agregar({ tipo: "extra", id: id(), etiqueta: "Caja de regalo", precio: 50 })} className="rounded-full border border-arena-oscura px-3 py-1.5 text-sm hover:bg-arena">+ Extra con costo</button>
      </div>
    </div>
  );
}
