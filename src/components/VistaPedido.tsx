"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, Clock, Loader2, MapPin, XCircle } from "lucide-react";
import { vaciarCarrito } from "@/lib/carrito";
import { precio } from "@/lib/formato";
import { nombreEnvio } from "@/lib/envios";
import { nombreEstado } from "@/lib/pedidos";
import { useMiCreador } from "@/lib/panel";
import { usePedido } from "@/lib/usar-pedidos";
import { FormularioEntrar } from "./FormularioEntrar";
import { EnvioPaquete } from "./EnvioPaquete";
import { FotoProducto } from "./FotoProducto";
import { useSesion } from "./Sesion";

export function VistaPedido({ id, pagoId }: { id: string; pagoId?: string }) {
  const { usuario, cargando: cargandoSesion } = useSesion();
  const { pedido, cargando } = usePedido(id, usuario?.uid);
  const { creador: miTienda } = useMiCreador(usuario?.uid);
  const [revisando, setRevisando] = useState(!!pagoId);
  const [aviso, setAviso] = useState("");
  const yaPedido = useRef(false);
  const yaVaciado = useRef(false);

  // El comprador pide al servidor que verifique su pago con Mercado Pago:
  // al regresar de pagar (trae el número de pago) o al abrir un pedido que sigue pendiente
  // (por ejemplo, si cerró la ventana antes de volver a XICO).
  const esComprador = !!usuario && pedido?.uid === usuario.uid;
  const pendiente = pedido?.estado === "pendiente_pago";
  useEffect(() => {
    if (!usuario || yaPedido.current) return;
    if (!pagoId && !(esComprador && pendiente)) return;
    yaPedido.current = true;
    (async () => {
      try {
        const r = await fetch("/api/pagos/confirmar", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${await usuario.getIdToken()}` },
          body: JSON.stringify({ pedidoId: id, pagoId }),
        });
        if (!r.ok) setAviso((await r.json()).error ?? "No pudimos verificar tu pago todavía.");
      } catch {
        setAviso("No pudimos verificar tu pago todavía. Recarga en un momento.");
      } finally {
        setRevisando(false);
      }
    })();
  }, [usuario, pagoId, id, esComprador, pendiente]);

  // Pagado: se vacía el carrito (una sola vez)
  useEffect(() => {
    if (pedido?.estado === "pagado" && !yaVaciado.current) {
      yaVaciado.current = true;
      vaciarCarrito();
    }
  }, [pedido?.estado]);

  if (cargandoSesion) return <div className="h-64 animate-pulse rounded-3xl bg-arena" />;
  if (!usuario) {
    return (
      <div className="mx-auto max-w-md rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60">
        <p className="mb-4 text-sm text-cafe">Entra a tu cuenta para ver tu pedido.</p>
        <FormularioEntrar volver={`/pedido/${id}${pagoId ? `?payment_id=${pagoId}` : ""}`} />
      </div>
    );
  }
  if (cargando || revisando) {
    return (
      <div className="grid place-items-center gap-3 rounded-3xl bg-white p-12 text-center ring-1 ring-arena-oscura/60">
        <Loader2 className="size-8 animate-spin text-terracota" />
        <p className="text-cafe">{revisando ? "Verificando tu pago con Mercado Pago…" : "Cargando tu pedido…"}</p>
      </div>
    );
  }
  if (!pedido) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center ring-1 ring-arena-oscura/60">
        <p className="font-display text-xl font-semibold">No encontramos este pedido.</p>
        <Link href="/cuenta" className="mt-4 inline-block text-terracota hover:underline">Ver mis pedidos</Link>
      </div>
    );
  }

  const comprador = pedido.uid === usuario.uid;
  // Un creador solo ve su parte del pedido
  const grupos = comprador ? pedido.grupos : pedido.grupos.filter((g) => g.creador === miTienda?.slug);
  const miParte = comprador ? undefined : grupos[0];
  const encabezado = {
    pagado: { Icono: CheckCircle2, color: "text-jade bg-jade/10", titulo: "¡Gracias por tu compra!", texto: "Tu pago se confirmó. Los creadores ya están preparando tu pedido." },
    pendiente_pago: { Icono: Clock, color: "text-terracota bg-maiz/20", titulo: "Esperando tu pago", texto: "Si pagaste en OXXO o con transferencia, se confirmará cuando Mercado Pago lo reciba." },
    rechazado: { Icono: XCircle, color: "text-rosa bg-rosa/10", titulo: "El pago no se completó", texto: "No se hizo ningún cargo. Puedes intentarlo de nuevo desde tu carrito." },
    enviado: { Icono: CheckCircle2, color: "text-jade bg-jade/10", titulo: "Tu pedido va en camino", texto: "Abajo puedes ver la paquetería y rastrear cada paquete." },
    entregado: { Icono: CheckCircle2, color: "text-jade bg-jade/10", titulo: "Pedido entregado", texto: "¡Esperamos que te encante! Gracias por apoyar a creadores mexicanos." },
    cancelado: { Icono: XCircle, color: "text-rosa bg-rosa/10", titulo: "Pedido cancelado", texto: "" },
  }[pedido.estado];

  return (
    <div className="grid gap-6">
      <div className={`flex items-start gap-4 rounded-3xl p-6 ${encabezado.color}`}>
        <encabezado.Icono className="size-8 shrink-0" />
        <div>
          <h2 className="font-display text-2xl font-semibold">{comprador ? encabezado.titulo : miParte ? `Tu paquete: ${nombreEnvio[miParte.envioEstado ?? "preparando"]}` : nombreEstado[pedido.estado]}</h2>
          {comprador && encabezado.texto && <p className="mt-1 text-sm text-tinta/80">{encabezado.texto}</p>}
          <p className="mt-2 text-xs text-tinta/60">
            Pedido #{pedido.id.slice(0, 8).toUpperCase()} · {new Date(pedido.creado).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" })}
          </p>
        </div>
      </div>

      {aviso && <p className="rounded-xl bg-maiz/20 px-4 py-3 text-sm">{aviso}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="grid content-start gap-4">
          {grupos.map((g) => (
            <section key={g.creador} className="overflow-hidden rounded-3xl bg-white ring-1 ring-arena-oscura/60">
              <header className="flex justify-between border-b border-arena-oscura/60 bg-arena/40 px-5 py-3 text-sm">
                <Link href={`/creador/${g.creador}`} className="font-semibold hover:text-terracota">{g.taller}</Link>
                <span className="text-cafe">Envío: {g.envio ? precio(g.envio) : "gratis"}</span>
              </header>
              <ul className="divide-y divide-arena-oscura/50">
                {g.articulos.map((a, i) => (
                  <li key={a.slug + i} className="flex gap-4 p-5">
                    <div className="w-16 shrink-0 overflow-hidden rounded-xl">
                      <FotoProducto producto={{ colores: a.colores, forma: a.forma, categoria: a.categoria }} uniforme />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex justify-between gap-3">
                        <p className="font-medium">{a.nombre}</p>
                        <p className="shrink-0 font-semibold">{precio(a.precioUnitario * a.cantidad)}</p>
                      </div>
                      <p className="text-xs text-cafe">{a.cantidad} × {precio(a.precioUnitario)}</p>
                      {a.opciones.length > 0 && (
                        <dl className="mt-1 grid gap-0.5 text-xs text-cafe">
                          {a.opciones.map((o) => (
                            <div key={o.etiqueta} className="flex gap-1">
                              <dt>{o.etiqueta}:</dt>
                              <dd className="font-medium text-tinta">{o.valor}</dd>
                            </div>
                          ))}
                        </dl>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
              <EnvioPaquete pedido={pedido} grupo={g} rol={comprador ? "comprador" : "tienda"} />
            </section>
          ))}
        </div>

        <aside className="grid content-start gap-4">
          <section className="rounded-3xl bg-white p-5 ring-1 ring-arena-oscura/60">
            <h3 className="font-display text-lg font-semibold">Resumen</h3>
            {miParte ? (
              <dl className="mt-3 grid gap-2 text-sm">
                <div className="flex justify-between"><dt className="text-cafe">Tus productos</dt><dd>{precio(miParte.subtotal)}</dd></div>
                <div className="flex justify-between"><dt className="text-cafe">Comisión XICO (15%)</dt><dd>−{precio(miParte.comision)}</dd></div>
                <div className="flex justify-between"><dt className="text-cafe">Envío</dt><dd>{precio(miParte.envio)}</dd></div>
                <div className="flex justify-between border-t border-arena-oscura/60 pt-2 text-lg font-bold"><dt>Recibes</dt><dd>{precio(miParte.paraCreador)}</dd></div>
              </dl>
            ) : (
              <dl className="mt-3 grid gap-2 text-sm">
                <div className="flex justify-between"><dt className="text-cafe">Productos</dt><dd>{precio(pedido.productos)}</dd></div>
                <div className="flex justify-between"><dt className="text-cafe">Envío</dt><dd>{pedido.envio ? precio(pedido.envio) : "Gratis"}</dd></div>
                <div className="flex justify-between border-t border-arena-oscura/60 pt-2 text-lg font-bold"><dt>Total</dt><dd>{precio(pedido.total)}</dd></div>
              </dl>
            )}
          </section>
          <section className="rounded-3xl bg-white p-5 text-sm ring-1 ring-arena-oscura/60">
            <h3 className="mb-2 flex items-center gap-1.5 font-display text-lg font-semibold"><MapPin className="size-4" /> Envío a</h3>
            <p className="font-medium">{pedido.direccion.nombre}</p>
            <p className="text-cafe">
              {pedido.direccion.calle} {pedido.direccion.numero}, {pedido.direccion.colonia}
              <br />
              {pedido.direccion.cp} {pedido.direccion.ciudad}, {pedido.direccion.estado}
              <br />
              Tel. {pedido.direccion.telefono}
            </p>
            {pedido.direccion.referencias && <p className="mt-1 text-xs text-cafe">Ref.: {pedido.direccion.referencias}</p>}
          </section>
          {comprador && pedido.estado === "rechazado" && (
            <Link href="/carrito" className="rounded-full bg-terracota py-3 text-center font-semibold text-crema hover:bg-terracota-oscura">
              Volver a intentar
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
