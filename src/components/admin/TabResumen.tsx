"use client";

import { AlertTriangle, BadgeCheck, HandCoins, Package, ShoppingBag, Store, Truck, Wallet } from "lucide-react";
import { precio } from "@/lib/formato";
import { cobrados, type DatosAdmin } from "./datos";

export function TabResumen({ datos, ir }: { datos: DatosAdmin; ir: (tab: string) => void }) {
  const pagados = cobrados(datos.pedidos);
  const grupos = pagados.flatMap((p) => p.grupos);
  const ventas = pagados.reduce((s, p) => s + p.total, 0);
  const comisiones = grupos.reduce((s, g) => s + g.comision, 0);
  const porPagar = grupos.filter((g) => !g.liquidado).reduce((s, g) => s + g.paraCreador, 0);
  const porEnviar = grupos.filter((g) => (g.envioEstado ?? "preparando") === "preparando").length;
  const sinVerificar = datos.creadores.filter((c) => c.uid && !c.verificado).length;
  const solicitudes = datos.creadores.filter((c) => c.estadoTienda === "revision").length;
  const ocultos = datos.productos.filter((p) => p.oculto).length;
  const sinPagar = datos.pedidos.filter((p) => p.estado === "pendiente_pago").length;

  const tarjetas = [
    { icono: ShoppingBag, valor: precio(ventas), texto: "Ventas cobradas", nota: `${pagados.length} pedidos` },
    { icono: Wallet, valor: precio(comisiones), texto: "Comisiones de XICO", nota: "15% de cada venta" },
    { icono: HandCoins, valor: precio(porPagar), texto: "Por pagar a creadores", nota: "Ver pagos", tab: "pagos", alerta: porPagar > 0 },
    { icono: Truck, valor: porEnviar, texto: "Paquetes por enviar", nota: "Ver pedidos", tab: "pedidos", alerta: porEnviar > 0 },
    { icono: Store, valor: datos.creadores.length, texto: "Tiendas", nota: solicitudes ? `${solicitudes} solicitudes nuevas` : `${sinVerificar} por verificar`, tab: "creadores", alerta: solicitudes + sinVerificar > 0 },
    { icono: Package, valor: datos.productos.length, texto: "Productos", nota: `${ocultos} ocultos`, tab: "productos" },
    { icono: AlertTriangle, valor: sinPagar, texto: "Pedidos sin pagar", nota: "Intentos abandonados", tab: "config" },
    { icono: BadgeCheck, valor: datos.creadores.filter((c) => c.verificado).length, texto: "Artistas verificados", nota: "", tab: "creadores" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {tarjetas.map((t) => {
        const contenido = (
          <>
            <t.icono className={`size-5 ${t.alerta ? "text-rosa" : "text-terracota"}`} />
            <p className="mt-2 text-2xl font-bold">{t.valor}</p>
            <p className="text-sm">{t.texto}</p>
            {t.nota && <p className="text-xs text-cafe">{t.nota}</p>}
          </>
        );
        const cls = `rounded-3xl bg-white p-5 text-left ring-1 ${t.alerta ? "ring-rosa/40" : "ring-arena-oscura/60"}`;
        return t.tab ? (
          <button key={t.texto} onClick={() => ir(t.tab!)} className={`${cls} transition hover:shadow-md`}>
            {contenido}
          </button>
        ) : (
          <div key={t.texto} className={cls}>
            {contenido}
          </div>
        );
      })}
    </div>
  );
}
