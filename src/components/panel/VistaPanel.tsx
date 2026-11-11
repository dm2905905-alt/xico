"use client";

import Link from "next/link";
import { useState } from "react";
import { BadgeCheck, CreditCard, ExternalLink, Film, MessageCircle, Package, Pencil, Plus, Settings, ShoppingBag, Star, Trash2 } from "lucide-react";
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
    <div className="grid gap-4 sm:gap-6">
      {/* Encabezado: foto, nombre y enlace a la tienda pública */}
      <div className="flex items-center gap-3">
        <span
          className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-full font-display text-xl font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}
        >
          {creador.foto ? (
            // eslint-disable-next-line @next/next/no-img-element -- miniatura ya reducida al subirla
            <img src={creador.foto.mini} alt="" className="size-full object-cover" />
          ) : (
            creador.taller.slice(0, 1).toUpperCase()
          )}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-1.5 font-display text-xl font-bold sm:text-2xl">
            <span className="truncate">{creador.taller}</span>
            {creador.verificado && <BadgeCheck className="size-5 shrink-0 text-jade" aria-label="Verificado" />}
          </h2>
          <Link href={`/creador/${creador.slug}`} className="inline-flex items-center gap-1 text-sm text-terracota hover:underline">
            Ver mi tienda <ExternalLink className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Accesos rápidos estilo app */}
      <nav className="grid grid-cols-5 gap-1.5 sm:gap-2" aria-label="Accesos de mi tienda">
        {[
          { href: "/panel/producto/nuevo", texto: "Nuevo producto", icono: Plus, fuerte: true },
          { href: "/panel/videos", texto: "Videos", icono: Film },
          { href: "/mensajes", texto: "Mensajes", icono: MessageCircle },
          { href: "/panel/perfil", texto: "Perfil", icono: Settings },
          { href: "/panel/cuenta", texto: "Cobros", icono: CreditCard, alerta: sinCobro },
        ].map((x) => (
          <Link key={x.href} href={x.href} className="relative flex flex-col items-center gap-1.5 rounded-2xl bg-white px-1 py-3 text-center text-[11px] leading-tight font-medium ring-1 ring-arena-oscura/60 transition hover:ring-terracota sm:text-xs">
            <span className={`grid size-10 place-items-center rounded-xl ${x.fuerte ? "degradado-xico text-white" : "bg-arena text-terracota"}`}>
              <x.icono className="size-5" />
            </span>
            {x.texto}
            {x.alerta && <span className="absolute top-2 right-2 size-2.5 rounded-full bg-rosa" aria-label="Falta completar" />}
          </Link>
        ))}
      </nav>

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
      <div className="grid grid-cols-4 gap-2">
        {[
          { icono: Package, valor: productos.length, texto: "Productos" },
          { icono: ShoppingBag, valor: vendidos, texto: "Vendidas" },
          { icono: Star, valor: creador.resenas ? creador.calificacion.toFixed(1) : "—", texto: "Calificación" },
          { icono: Package, valor: porEnviar, texto: "Por enviar" },
        ].map((n) => (
          <div key={n.texto} className={`rounded-2xl p-3 text-center ring-1 ${n.texto === "Por enviar" && porEnviar > 0 ? "bg-maiz/20 ring-maiz/60" : "bg-white ring-arena-oscura/60"}`}>
            <p className="text-lg font-bold sm:text-2xl">{n.valor}</p>
            <p className="text-[11px] text-cafe sm:text-sm">{n.texto}</p>
          </div>
        ))}
      </div>

      {/* Productos */}
      <section className="rounded-3xl bg-white p-4 ring-1 ring-arena-oscura/60 sm:p-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-lg font-bold sm:text-xl">Mis productos</h2>
          <Link href="/panel/producto/nuevo" className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-semibold text-terracota hover:bg-terracota/10">
            <Plus className="size-4" /> Agregar
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

      <section className="rounded-3xl bg-white p-4 ring-1 ring-arena-oscura/60 sm:p-6">
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
