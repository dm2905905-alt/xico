// Lectura del catálogo desde Firestore (en el servidor).
// El resultado se guarda en caché y se refresca solo cada pocos minutos,
// así la tienda es rápida y no consulta Firebase en cada visita.
import { cacheLife } from "next/cache";
import { getApp, getApps, initializeApp } from "firebase/app";
import { collection, getDocs, getFirestore } from "firebase/firestore/lite";
import { tiendaActiva, type Creador, type Producto } from "./datos";
import { catalogoEjemplo } from "./ejemplo";
import { firebaseConfig, firebaseConfigurado } from "./firebase-config";

export type Catalogo = { productos: Producto[]; creadores: Creador[]; origen: "firebase" | "ejemplo" };

const NOMBRE_APP = "servidor";

export async function obtenerCatalogo(): Promise<Catalogo> {
  "use cache";
  cacheLife("minutes");

  // Sin Firebase configurado (por ejemplo, alguien que descarga el código) se usan los datos de ejemplo
  if (!firebaseConfigurado) return { ...catalogoEjemplo(), origen: "ejemplo" };

  const app = getApps().some((a) => a.name === NOMBRE_APP) ? getApp(NOMBRE_APP) : initializeApp(firebaseConfig, NOMBRE_APP);
  const db = getFirestore(app);
  try {
    const [p, c] = await Promise.all([getDocs(collection(db, "productos")), getDocs(collection(db, "creadores"))]);
    // Solo tiendas aprobadas: las solicitudes en revisión y las suspendidas no se muestran
    const creadores = c.docs.map((d) => d.data() as Creador).filter(tiendaActiva);
    const activas = new Set(creadores.map((x) => x.slug));
    return {
      // Los productos ocultos por moderación (o de tiendas no activas) no aparecen en la tienda
      productos: p.docs.map((d) => d.data() as Producto).filter((x) => !x.oculto && activas.has(x.creador)),
      creadores,
      origen: "firebase",
    };
  } catch (e) {
    // Base de datos sin crear, sin permisos o sin conexión: la tienda se muestra vacía en lugar de romperse
    console.error("[XICO] No se pudo leer el catálogo de Firestore:", (e as Error).message);
    return { productos: [], creadores: [], origen: "firebase" };
  }
}

// Consultas sobre el catálogo ya cargado
export function consultas({ productos, creadores }: Catalogo) {
  const creadorPorSlug = (slug: string) => creadores.find((c) => c.slug === slug);
  return {
    productos,
    creadores,
    creadorPorSlug,
    productoPorSlug: (slug: string) => productos.find((p) => p.slug === slug),
    productosDeCreador: (slug: string) => productos.filter((p) => p.creador === slug),
    productosDeEstado: (estado: string) => productos.filter((p) => p.estado === estado),
    creadoresDeEstado: (estado: string) => creadores.filter((c) => c.estado === estado),
    ofertas: () => productos.filter((p) => p.precioAntes),
    nuevos: () => productos.filter((p) => p.nuevo),
    masVendidos: () => [...productos].sort((a, b) => b.vendidos - a.vendidos).slice(0, 8),
    desde99: () => productos.filter((p) => p.precio <= 99),
  };
}

// Para generateStaticParams: con la caché de Next.js debe haber al menos un valor;
// si la tienda está vacía se usa uno de relleno que termina en "no encontrado".
export const RELLENO = "__vacio__";
export const conRelleno = (slugs: string[]) => (slugs.length ? slugs : [RELLENO]).map((slug) => ({ slug }));
