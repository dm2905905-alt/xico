import { categoriaPorSlug, estadoPorSlug, type Producto } from "./datos";

export type Filtros = {
  q?: string;
  categoria?: string;
  estado?: string;
  max?: number;
  orden?: "relevancia" | "vendidos" | "nuevos" | "precio-asc" | "precio-desc" | "calificacion";
  personalizable?: boolean;
  ofertas?: boolean;
};

// Quita acentos y mayúsculas para que "michoacan" encuentre "Michoacán"
const normalizar = (t: string) =>
  t.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

const textoBuscable = (p: Producto) =>
  normalizar([p.nombre, categoriaPorSlug(p.categoria)?.nombre, p.taller, estadoPorSlug(p.estado)?.nombre].join(" "));

export function buscarProductos(productos: Producto[], f: Filtros): Producto[] {
  const palabras = f.q ? normalizar(f.q).split(/\s+/).filter((w) => w.length > 1) : [];

  let lista = productos.filter((p) => {
    if (f.categoria && p.categoria !== f.categoria) return false;
    if (f.estado && p.estado !== f.estado) return false;
    if (f.max && p.precio > f.max) return false;
    if (f.personalizable && !p.personalizable) return false;
    if (f.ofertas && !p.precioAntes) return false;
    if (palabras.length) {
      const texto = textoBuscable(p);
      // Basta con que coincida alguna palabra; se ordena por cuántas coinciden
      if (!palabras.some((w) => texto.includes(w))) return false;
    }
    return true;
  });

  const coincidencias = (p: Producto) => {
    const texto = textoBuscable(p);
    return palabras.filter((w) => texto.includes(w)).length;
  };

  switch (f.orden) {
    case "vendidos":
      lista = lista.sort((a, b) => b.vendidos - a.vendidos);
      break;
    case "nuevos":
      lista = lista.sort((a, b) => Number(!!b.nuevo) - Number(!!a.nuevo));
      break;
    case "precio-asc":
      lista = lista.sort((a, b) => a.precio - b.precio);
      break;
    case "precio-desc":
      lista = lista.sort((a, b) => b.precio - a.precio);
      break;
    case "calificacion":
      lista = lista.sort((a, b) => b.calificacion - a.calificacion);
      break;
    default:
      if (palabras.length) lista = lista.sort((a, b) => coincidencias(b) - coincidencias(a) || b.vendidos - a.vendidos);
  }
  return lista;
}

// Convierte los parámetros de la URL en filtros válidos
export function leerFiltros(sp: Record<string, string | string[] | undefined>): Filtros {
  const uno = (k: string) => {
    const v = sp[k];
    return Array.isArray(v) ? v[0] : v;
  };
  const max = Number(uno("max"));
  const ordenes = ["relevancia", "vendidos", "nuevos", "precio-asc", "precio-desc", "calificacion"] as const;
  const orden = ordenes.find((o) => o === uno("orden"));
  return {
    q: uno("q")?.slice(0, 80),
    categoria: uno("categoria"),
    estado: uno("estado"),
    max: Number.isFinite(max) && max > 0 ? max : undefined,
    orden,
    personalizable: uno("personalizable") === "1",
    ofertas: uno("ofertas") === "1",
  };
}
