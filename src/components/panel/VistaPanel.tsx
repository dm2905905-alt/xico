"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, CreditCard, ExternalLink, MessageCircle, Package, Pencil, Plus, Settings, ShoppingBag, Star, Trash2 } from "lucide-react";
import type { Creador } from "@/lib/datos";
import { mensajeError } from "@/lib/firebase";
import { precio } from "@/lib/formato";
import { borrarProducto, useDatosPrivados, useProductosDe } from "@/lib/panel";
import { usePedidosDe } from "@/lib/usar-pedidos";
import { ListaPedidos } from "../ListaPedidos";
import { useSesion } from "../Sesion";
import { FotoProducto } from "../FotoProducto";
import { ConTienda } from "./ConTienda";

export function VistaPanel() {
  return <ConTienda volver="/panel">{(creador) => <Tablero creador={creador} />}</ConTienda>;
}

function Tablero({ creador }: { creador: Creador }) {
  const { productos, cargando } = useProductosDe(creador.slug);
  const { usuario } = useSesion();
  // Solo pedidos ya pagados que incluyen productos de esta tienda
  const pedidos = usePedidosDe(usuario?.uid).pedidos.filter(
    (p) => p.creadores.includes(creador.slug) && p.estado !== "pendiente_pago" && p.estado !== "rechazado",
  );
  const porEnviar = pedidos.filter((p) => (p.grupos.find((g) => g.creador === creador.slug)?.envioEstado ?? "preparando") === "preparando").length;
  const privados = useDatosPrivados(creador.slug);
  const sinCobro = !privados.cargando && !privados.datos.pago;
  const [borrando, setBorrando] = useState<string | null>(null);
  const [error, setError] = useState("");

  const vendidos = productos.reduce((s, p) => s + p.vendidos, 0);

  async function borrar(slug: string, nombre: string) {
    if (!window.confirm(`¿Borrar "${nombre}"? Ya no aparecerá en la tienda. Esto no se puede deshacer.`)) return;
    setBorrando(slug);
    setError("");
    try {
      await borrarProducto(slug);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setBorrando(null);
    }
  }

  const [a, b] = creador.colores;

  return (
    <div className="grid gap-6">
      {/* Encabezado de la tienda */}
      <div className="overflow-hidden rounded-3xl bg-white ring-1 ring-arena-oscura/60">
        <div className="patron-picado h-20" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }} />
        <div className="flex flex-wrap items-center gap-4 p-5">
          <div className="min-w-0 flex-1">
            <h2 className="flex items-center gap-2 font-display text-2xl font-semibold">
              {creador.taller}
              {creador.verificado && <BadgeCheck className="size-5 text-jade" aria-label="Verificado" />}
            </h2>
            <p className="text-sm text-cafe">{creador.especialidad || "Completa tu perfil para que te conozcan"}</p>
            {!creador.verificado && (
              <p className="mt-1 text-xs text-cafe">⏳ Verificación pendiente: el equipo de XICO revisará tu trabajo.</p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href={`/creador/${creador.slug}`} className="flex items-center gap-1.5 rounded-full border border-arena-oscura px-4 py-2 text-sm hover:bg-arena">
              <ExternalLink className="size-4" /> Ver mi tienda
            </Link>
            <Link href="/panel/perfil" className="flex items-center gap-1.5 rounded-full border border-arena-oscura px-4 py-2 text-sm hover:bg-arena">
              <Settings className="size-4" /> Editar perfil
            </Link>
            <Link href="/panel/cuenta" className="flex items-center gap-1.5 rounded-full border border-arena-oscura px-4 py-2 text-sm hover:bg-arena">
              <CreditCard className="size-4" /> Mi cuenta de vendedor
            </Link>
            <Link href="/mensajes" className="degradado-xico flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white">
              <MessageCircle className="size-4" /> Mensajes
            </Link>
          </div>
        </div>
      </div>

      {/* Avisos de la solicitud y de la cuenta */}
      {creador.estadoTienda === "revision" && (
        <div className="rounded-3xl bg-maiz/20 p-5 text-sm ring-1 ring-maiz/60">
          <p className="font-semibold">⏳ Tu solicitud está en revisión</p>
          <p className="mt-1 text-cafe">
            El equipo de XICO la revisará pronto. Mientras tanto ya puedes subir tus productos: aparecerán en la tienda en cuanto te aprobemos.
          </p>
        </div>
      )}
      {creador.estadoTienda === "suspendida" && (
        <div className="rounded-3xl bg-rosa/10 p-5 text-sm text-rosa ring-1 ring-rosa/30">
          <p className="font-semibold">🚫 Tu tienda está suspendida</p>
          <p className="mt-1">Tus productos no se muestran por ahora. Escríbenos desde la página de Ayuda para resolverlo.</p>
        </div>
      )}
      {sinCobro && (
        <Link href="/panel/cuenta" className="block rounded-3xl bg-white p-5 text-sm ring-2 ring-terracota/50 hover:ring-terracota">
          <p className="font-semibold">💳 Falta tu cuenta de pago</p>
          <p className="mt-1 text-cafe">Registra tu CLABE para que podamos depositarte tus ventas. <span className="font-semibold text-terracota">Agregarla →</span></p>
        </Link>
      )}

      {/* Números */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { icono: Package, valor: productos.length, texto: "Productos" },
          { icono: ShoppingBag, valor: vendidos, texto: "Piezas vendidas" },
          { icono: Star, valor: creador.resenas ? creador.calificacion.toFixed(1) : "—", texto: "Calificación" },
          { icono: Package, valor: porEnviar, texto: "Pedidos por enviar" },
        ].map((n) => (
          <div key={n.texto} className="rounded-3xl bg-white p-5 ring-1 ring-arena-oscura/60">
            <n.icono className="size-5 text-terracota" />
            <p className="mt-2 text-2xl font-bold">{n.valor}</p>
            <p className="text-sm text-cafe">{n.texto}</p>
          </div>
        ))}
      </div>

      {/* Productos */}
      <section className="rounded-3xl bg-white p-5 ring-1 ring-arena-oscura/60 sm:p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-xl font-semibold">Mis productos</h2>
          <Link href="/panel/producto/nuevo" className="flex items-center gap-1.5 rounded-full bg-terracota px-5 py-2.5 text-sm font-semibold text-crema hover:bg-terracota-oscura">
            <Plus className="size-4" /> Nuevo producto
          </Link>
        </div>

        {error && <p role="alert" className="mb-4 rounded-xl bg-rosa/10 px-4 py-3 text-sm text-rosa">{error}</p>}

        {cargando ? (
          <div className="h-32 animate-pulse rounded-2xl bg-arena" />
        ) : productos.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-arena-oscura px-6 py-12 text-center">
            <p className="font-display text-lg font-semibold">Aún no tienes productos</p>
            <p className="mt-1 text-sm text-cafe">Sube tu primera pieza: tarda menos de 5 minutos.</p>
          </div>
        ) : (
          <ul className="divide-y divide-arena-oscura/50">
            {productos.map((p) => (
              <li key={p.slug} className="flex items-center gap-4 py-3">
                <div className="w-16 shrink-0 overflow-hidden rounded-xl">
                  <FotoProducto producto={p} uniforme />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/producto/${p.slug}`} className="line-clamp-1 font-medium hover:text-terracota">{p.nombre}</Link>
                  <p className="text-sm text-cafe">
                    {precio(p.precio)} · {p.vendidos} vendidos{p.personalizable && " · ✍️ personalizable"}
                  </p>
                  {p.oculto && (
                    <p className="mt-1 rounded-lg bg-rosa/10 px-2 py-1 text-xs text-rosa">
                      🚫 Oculto por XICO{p.motivoOculto ? `: ${p.motivoOculto}` : ""}. Escríbenos si crees que es un error.
                    </p>
                  )}
                </div>
                <Link href={`/panel/producto/${p.slug}`} className="grid size-10 place-items-center rounded-full hover:bg-arena" aria-label={`Editar ${p.nombre}`}>
                  <Pencil className="size-4" />
                </Link>
                <button
                  onClick={() => borrar(p.slug, p.nombre)}
                  disabled={borrando === p.slug}
                  className="grid size-10 place-items-center rounded-full text-cafe hover:bg-rosa/10 hover:text-rosa disabled:opacity-50"
                  aria-label={`Borrar ${p.nombre}`}
                >
                  <Trash2 className="size-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-cafe">Los cambios aparecen en la tienda pública en 1 a 2 minutos.</p>
      </section>

      <section className="rounded-3xl bg-white p-5 ring-1 ring-arena-oscura/60 sm:p-6">
        <h2 className="font-display text-xl font-semibold">Pedidos</h2>
        {pedidos.length ? (
          <ListaPedidos pedidos={pedidos} creador={creador.slug} />
        ) : (
          <p className="mt-2 text-sm text-cafe">Aún no tienes pedidos. Cuando alguien compre y pague, aparecerá aquí con la dirección de envío.</p>
        )}
        <p className="mt-3 text-xs text-cafe">XICO cobra por ti; recibes el total de tus productos menos 15% de comisión, más el envío.</p>
      </section>
    </div>
  );
}
