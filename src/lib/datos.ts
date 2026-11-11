// Tipos y datos fijos de XICO (categorías y estados).
// Los productos y creadores viven en Firestore: ver catalogo.ts.

export type CategoriaSlug =
  | "fundas"
  | "ropa"
  | "cuadros"
  | "joyeria"
  | "velas"
  | "regalos"
  | "artesania"
  | "decoracion";

export type Categoria = { slug: CategoriaSlug; nombre: string };

export type Estado = { slug: string; nombre: string; especialidad: string; colores: [string, string] };

export type Creador = {
  slug: string;
  nombre: string;
  taller: string;
  estado: string; // slug del estado
  ciudad: string;
  especialidad: string;
  historia: string;
  calificacion: number;
  resenas: number;
  verificado: boolean;
  top: boolean;
  colores: [string, string];
  uid?: string; // cuenta dueña de la tienda (los creadores de ejemplo no tienen)
};

// Opciones del formulario de personalización de un producto
export type OpcionPersonalizacion =
  | { tipo: "texto"; id: string; etiqueta: string; max: number; requerido?: boolean; ayuda?: string }
  | { tipo: "colores"; id: string; etiqueta: string; opciones: { nombre: string; hex: string }[] }
  | { tipo: "foto"; id: string; etiqueta: string; ayuda?: string; requerido?: boolean }
  | { tipo: "extra"; id: string; etiqueta: string; precio: number };

export type Producto = {
  slug: string;
  nombre: string;
  creador: string; // slug del creador
  taller: string; // copia del nombre del taller (para las tarjetas)
  estado: string; // copia del estado del creador (para filtrar)
  categoria: CategoriaSlug;
  precio: number;
  precioAntes?: number;
  calificacion: number;
  resenas: number;
  vendidos: number;
  nuevo?: boolean;
  personalizable: boolean;
  colores: [string, string];
  forma: "alta" | "media" | "cuadrada";
  descripcion: string;
  materiales: string;
  diasElaboracion: string;
  personalizacion?: OpcionPersonalizacion[];
  paquete?: Paquete; // para cotizar el envío con la paquetería
  // Moderación: la administración puede ocultar un producto (por ejemplo, si es reventa)
  oculto?: boolean;
  motivoOculto?: string;
};

// Tamaño del paquete ya empacado (las paqueterías cobran por peso real o por volumen, lo que sea mayor)
export type Paquete = { pesoKg: number; largoCm: number; anchoCm: number; altoCm: number };

// Lo mínimo para dibujar una tarjeta (se guarda también en favoritos)
export type ProductoTarjeta = Pick<
  Producto,
  | "slug"
  | "nombre"
  | "taller"
  | "estado"
  | "categoria"
  | "precio"
  | "precioAntes"
  | "calificacion"
  | "nuevo"
  | "personalizable"
  | "colores"
  | "forma"
>;

// Recorta un producto a solo los datos de la tarjeta
export const aTarjeta = (p: ProductoTarjeta): ProductoTarjeta => ({
  slug: p.slug,
  nombre: p.nombre,
  taller: p.taller,
  estado: p.estado,
  categoria: p.categoria,
  precio: p.precio,
  ...(p.precioAntes ? { precioAntes: p.precioAntes } : {}),
  calificacion: p.calificacion,
  ...(p.nuevo ? { nuevo: true } : {}),
  personalizable: p.personalizable,
  colores: p.colores,
  forma: p.forma,
});

export const categorias: Categoria[] = [
  { slug: "fundas", nombre: "Fundas pintadas" },
  { slug: "ropa", nombre: "Ropa intervenida" },
  { slug: "cuadros", nombre: "Cuadros y lienzos" },
  { slug: "joyeria", nombre: "Joyería" },
  { slug: "velas", nombre: "Velas y aromas" },
  { slug: "regalos", nombre: "Regalos personalizados" },
  { slug: "artesania", nombre: "Artesanía" },
  { slug: "decoracion", nombre: "Decoración" },
];

export const estados: Estado[] = [
  { slug: "oaxaca", nombre: "Oaxaca", especialidad: "Textiles, barro y color", colores: ["#ff2d87", "#ff8a3d"] },
  { slug: "michoacan", nombre: "Michoacán", especialidad: "Cobre, laca y diseño", colores: ["#7c2df0", "#ff2d87"] },
  { slug: "jalisco", nombre: "Jalisco", especialidad: "Vidrio, moda y decoración", colores: ["#0fb5a6", "#7c2df0"] },
  { slug: "puebla", nombre: "Puebla", especialidad: "Talavera y regalos", colores: ["#3b5bff", "#b23cf0"] },
  { slug: "chiapas", nombre: "Chiapas", especialidad: "Bordados y joyería", colores: ["#d63af0", "#ffc634"] },
  { slug: "yucatan", nombre: "Yucatán", especialidad: "Hamacas y accesorios", colores: ["#0fb5a6", "#ffc634"] },
  { slug: "guanajuato", nombre: "Guanajuato", especialidad: "Cerámica e ilustración", colores: ["#ff5c5c", "#d63af0"] },
  { slug: "cdmx", nombre: "Ciudad de México", especialidad: "Arte urbano y diseño", colores: ["#1d0b36", "#7c2df0"] },
];

// Colores que el comprador puede elegir en la personalización
export const paletaMexicana = [
  { nombre: "Rosa mexicano", hex: "#d6246e" },
  { nombre: "Terracota", hex: "#c4511f" },
  { nombre: "Amarillo maíz", hex: "#e9a824" },
  { nombre: "Verde jade", hex: "#2f7d6b" },
  { nombre: "Azul talavera", hex: "#1e3a8a" },
  { nombre: "Negro", hex: "#2b1d14" },
];

export const estadoPorSlug = (slug: string) => estados.find((e) => e.slug === slug);
export const categoriaPorSlug = (slug: string) => categorias.find((c) => c.slug === slug);
