"use client";

import { useState } from "react";
import { ChartLine, Film, Trophy, HandCoins, LayoutDashboard, Package, Settings, ShieldAlert, ShoppingBag, Store } from "lucide-react";
import { FormularioEntrar } from "../FormularioEntrar";
import { useSesion } from "../Sesion";
import { useDatosAdmin, useEsAdmin } from "./datos";
import { TabConfiguracion } from "./TabConfiguracion";
import { TabCreadores } from "./TabCreadores";
import { TabEventos } from "./TabEventos";
import { TabFinanzas } from "./TabFinanzas";
import { TabPagos } from "./TabPagos";
import { TabPedidos } from "./TabPedidos";
import { TabProductos } from "./TabProductos";
import { TabResumen } from "./TabResumen";
import { TabVideos } from "./TabVideos";

const tabs = [
  { id: "resumen", texto: "Resumen", icono: LayoutDashboard },
  { id: "finanzas", texto: "Finanzas", icono: ChartLine },
  { id: "creadores", texto: "Creadores", icono: Store },
  { id: "eventos", texto: "Eventos", icono: Trophy },
  { id: "productos", texto: "Productos", icono: Package },
  { id: "videos", texto: "Videos", icono: Film },
  { id: "pedidos", texto: "Pedidos", icono: ShoppingBag },
  { id: "pagos", texto: "Pagos a creadores", icono: HandCoins },
  { id: "config", texto: "Configuración", icono: Settings },
];

export function PanelAdmin() {
  const { usuario, cargando, configurado } = useSesion();
  const { admin, cargando: revisando } = useEsAdmin(usuario);
  const datos = useDatosAdmin(admin);
  const [tab, setTab] = useState("resumen");

  if (!configurado) return <p className="text-cafe">Firebase no está configurado (.env.local).</p>;
  if (cargando || revisando) return <div className="h-48 animate-pulse rounded-3xl bg-arena" />;

  if (!usuario) {
    return (
      <div className="max-w-md rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60">
        <p className="mb-4 text-sm text-cafe">Entra con la cuenta de Google que administra XICO.</p>
        <FormularioEntrar volver="/admin" />
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex items-start gap-3 rounded-3xl bg-white p-6 ring-1 ring-arena-oscura/60">
        <ShieldAlert className="size-6 shrink-0 text-rosa" />
        <div>
          <p className="font-semibold">Esta sección es solo para la administración de XICO.</p>
          <p className="mt-1 text-sm text-cafe">Entraste como {usuario.email}. Si eres el administrador, revisa ADMIN_EMAILS en el servidor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <nav className="sin-barra -mx-4 flex gap-2 overflow-x-auto px-4" aria-label="Secciones de administración">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            aria-current={tab === t.id ? "page" : undefined}
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium ${tab === t.id ? "bg-terracota text-crema" : "bg-white ring-1 ring-arena-oscura hover:bg-arena"}`}
          >
            <t.icono className="size-4" /> {t.texto}
          </button>
        ))}
      </nav>

      {!datos.listo && tab !== "config" ? (
        <div className="h-64 animate-pulse rounded-3xl bg-arena" />
      ) : (
        <>
          {tab === "resumen" && <TabResumen datos={datos} ir={setTab} />}
          {tab === "finanzas" && <TabFinanzas datos={datos} />}
          {tab === "creadores" && <TabCreadores datos={datos} />}
          {tab === "eventos" && <TabEventos datos={datos} />}
          {tab === "productos" && <TabProductos datos={datos} />}
          {tab === "videos" && <TabVideos />}
          {tab === "pedidos" && <TabPedidos datos={datos} />}
          {tab === "pagos" && <TabPagos datos={datos} />}
          {tab === "config" && <TabConfiguracion usuario={usuario} />}
        </>
      )}
    </div>
  );
}
