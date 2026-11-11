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

export type Ciudad = { nombre: string; lat: number; lon: number };

export type Estado = {
  slug: string;
  nombre: string;
  codigo: string; // ISO 3166-2 (ej. MX-OAX), para unirlo con el mapa
  especialidad: string;
  colores: [string, string];
  capital: Ciudad;
  ciudades: Ciudad[]; // otras ciudades importantes (además de la capital)
};

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

// Los 32 estados de México. Coordenadas aproximadas (latitud, longitud) de capitales y ciudades principales.
const c = (nombre: string, lat: number, lon: number): Ciudad => ({ nombre, lat, lon });

export const estados: Estado[] = [
  { slug: "aguascalientes", nombre: "Aguascalientes", codigo: "MX-AGU", especialidad: "Bordado, moda y diseño", colores: ["#ff2d87", "#7c2df0"], capital: c("Aguascalientes", 21.88, -102.29), ciudades: [c("Calvillo", 21.85, -102.72)] },
  { slug: "baja-california", nombre: "Baja California", codigo: "MX-BCN", especialidad: "Arte urbano y surf", colores: ["#0fb5a6", "#3b5bff"], capital: c("Mexicali", 32.62, -115.45), ciudades: [c("Tijuana", 32.51, -117.04), c("Ensenada", 31.87, -116.6)] },
  { slug: "baja-california-sur", nombre: "Baja California Sur", codigo: "MX-BCS", especialidad: "Joyería de mar y decoración", colores: ["#0fb5a6", "#ffc634"], capital: c("La Paz", 24.14, -110.31), ciudades: [c("Los Cabos", 23.06, -109.7), c("Todos Santos", 23.45, -110.22)] },
  { slug: "campeche", nombre: "Campeche", codigo: "MX-CAM", especialidad: "Palma, sombreros y color", colores: ["#ffc634", "#ff2d87"], capital: c("Campeche", 19.85, -90.53), ciudades: [c("Ciudad del Carmen", 18.65, -91.83)] },
  { slug: "chiapas", nombre: "Chiapas", codigo: "MX-CHP", especialidad: "Bordados y joyería", colores: ["#d63af0", "#ffc634"], capital: c("Tuxtla Gutiérrez", 16.75, -93.12), ciudades: [c("San Cristóbal de las Casas", 16.74, -92.64), c("Tapachula", 14.9, -92.26)] },
  { slug: "chihuahua", nombre: "Chihuahua", codigo: "MX-CHH", especialidad: "Piel, botas y textiles", colores: ["#ff5c5c", "#7c2df0"], capital: c("Chihuahua", 28.63, -106.07), ciudades: [c("Ciudad Juárez", 31.69, -106.42), c("Creel", 27.75, -107.63)] },
  { slug: "cdmx", nombre: "Ciudad de México", codigo: "MX-DIF", especialidad: "Arte urbano y diseño", colores: ["#1d0b36", "#7c2df0"], capital: c("Ciudad de México", 19.43, -99.13), ciudades: [c("Coyoacán", 19.35, -99.16), c("Xochimilco", 19.26, -99.1)] },
  { slug: "coahuila", nombre: "Coahuila", codigo: "MX-COA", especialidad: "Dulces, piel y decoración", colores: ["#3b5bff", "#ff2d87"], capital: c("Saltillo", 25.42, -101.0), ciudades: [c("Torreón", 25.54, -103.41), c("Parras", 25.44, -102.18)] },
  { slug: "colima", nombre: "Colima", codigo: "MX-COL", especialidad: "Cerámica y sal de mar", colores: ["#ff8a3d", "#d63af0"], capital: c("Colima", 19.24, -103.72), ciudades: [c("Manzanillo", 19.05, -104.32)] },
  { slug: "durango", nombre: "Durango", codigo: "MX-DUR", especialidad: "Madera, piel y arte", colores: ["#7c2df0", "#0fb5a6"], capital: c("Durango", 24.02, -104.66), ciudades: [c("Gómez Palacio", 25.56, -103.5)] },
  { slug: "estado-de-mexico", nombre: "Estado de México", codigo: "MX-MEX", especialidad: "Árboles de la vida y moda", colores: ["#ff2d87", "#ffc634"], capital: c("Toluca", 19.29, -99.66), ciudades: [c("Metepec", 19.25, -99.6), c("Valle de Bravo", 19.19, -100.13)] },
  { slug: "guanajuato", nombre: "Guanajuato", codigo: "MX-GUA", especialidad: "Cerámica e ilustración", colores: ["#ff5c5c", "#d63af0"], capital: c("Guanajuato", 21.02, -101.26), ciudades: [c("León", 21.12, -101.68), c("San Miguel de Allende", 20.91, -100.74)] },
  { slug: "guerrero", nombre: "Guerrero", codigo: "MX-GRO", especialidad: "Plata, máscaras y laca", colores: ["#0fb5a6", "#d63af0"], capital: c("Chilpancingo", 17.55, -99.5), ciudades: [c("Taxco", 18.56, -99.6), c("Acapulco", 16.85, -99.88)] },
  { slug: "hidalgo", nombre: "Hidalgo", codigo: "MX-HID", especialidad: "Tenangos y bordados", colores: ["#ff2d87", "#0fb5a6"], capital: c("Pachuca", 20.1, -98.76), ciudades: [c("Tenango de Doria", 20.34, -98.23)] },
  { slug: "jalisco", nombre: "Jalisco", codigo: "MX-JAL", especialidad: "Vidrio, moda y decoración", colores: ["#0fb5a6", "#7c2df0"], capital: c("Guadalajara", 20.67, -103.35), ciudades: [c("Tlaquepaque", 20.64, -103.31), c("Tonalá", 20.62, -103.24), c("Puerto Vallarta", 20.65, -105.23)] },
  { slug: "michoacan", nombre: "Michoacán", codigo: "MX-MIC", especialidad: "Cobre, laca y diseño", colores: ["#7c2df0", "#ff2d87"], capital: c("Morelia", 19.7, -101.19), ciudades: [c("Uruapan", 19.42, -102.06), c("Pátzcuaro", 19.51, -101.61)] },
  { slug: "morelos", nombre: "Morelos", codigo: "MX-MOR", especialidad: "Cerámica y velas", colores: ["#ffc634", "#7c2df0"], capital: c("Cuernavaca", 18.92, -99.23), ciudades: [c("Tepoztlán", 18.99, -99.1)] },
  { slug: "nayarit", nombre: "Nayarit", codigo: "MX-NAY", especialidad: "Arte huichol y chaquira", colores: ["#d63af0", "#0fb5a6"], capital: c("Tepic", 21.5, -104.89), ciudades: [c("Sayulita", 20.87, -105.44)] },
  { slug: "nuevo-leon", nombre: "Nuevo León", codigo: "MX-NLE", especialidad: "Diseño y moda", colores: ["#3b5bff", "#7c2df0"], capital: c("Monterrey", 25.69, -100.32), ciudades: [c("San Pedro Garza García", 25.66, -100.4)] },
  { slug: "oaxaca", nombre: "Oaxaca", codigo: "MX-OAX", especialidad: "Textiles, barro y color", colores: ["#ff2d87", "#ff8a3d"], capital: c("Oaxaca de Juárez", 17.07, -96.72), ciudades: [c("Teotitlán del Valle", 17.03, -96.52), c("Puerto Escondido", 15.86, -97.07)] },
  { slug: "puebla", nombre: "Puebla", codigo: "MX-PUE", especialidad: "Talavera y regalos", colores: ["#3b5bff", "#b23cf0"], capital: c("Puebla", 19.04, -98.21), ciudades: [c("Cholula", 19.06, -98.3)] },
  { slug: "queretaro", nombre: "Querétaro", codigo: "MX-QUE", especialidad: "Muñecas, ópalo y vino", colores: ["#ff2d87", "#d63af0"], capital: c("Querétaro", 20.59, -100.39), ciudades: [c("Tequisquiapan", 20.52, -99.89), c("Bernal", 20.74, -99.94)] },
  { slug: "quintana-roo", nombre: "Quintana Roo", codigo: "MX-ROO", especialidad: "Accesorios de playa y joyería", colores: ["#0fb5a6", "#3b5bff"], capital: c("Chetumal", 18.5, -88.3), ciudades: [c("Cancún", 21.16, -86.85), c("Playa del Carmen", 20.63, -87.08), c("Tulum", 20.21, -87.46)] },
  { slug: "san-luis-potosi", nombre: "San Luis Potosí", codigo: "MX-SLP", especialidad: "Rebozos y arte", colores: ["#7c2df0", "#ffc634"], capital: c("San Luis Potosí", 22.15, -100.98), ciudades: [c("Xilitla", 21.39, -98.99)] },
  { slug: "sinaloa", nombre: "Sinaloa", codigo: "MX-SIN", especialidad: "Moda de playa y decoración", colores: ["#ff8a3d", "#ff2d87"], capital: c("Culiacán", 24.81, -107.39), ciudades: [c("Mazatlán", 23.25, -106.41)] },
  { slug: "sonora", nombre: "Sonora", codigo: "MX-SON", especialidad: "Palo fierro y piel", colores: ["#ffc634", "#ff5c5c"], capital: c("Hermosillo", 29.07, -110.96), ciudades: [c("Álamos", 27.03, -108.94)] },
  { slug: "tabasco", nombre: "Tabasco", codigo: "MX-TAB", especialidad: "Cacao y jícaras", colores: ["#0fb5a6", "#ff8a3d"], capital: c("Villahermosa", 17.99, -92.93), ciudades: [c("Comalcalco", 18.26, -93.22)] },
  { slug: "tamaulipas", nombre: "Tamaulipas", codigo: "MX-TAM", especialidad: "Cuera y piel", colores: ["#3b5bff", "#0fb5a6"], capital: c("Ciudad Victoria", 23.74, -99.15), ciudades: [c("Tampico", 22.23, -97.86)] },
  { slug: "tlaxcala", nombre: "Tlaxcala", codigo: "MX-TLA", especialidad: "Sarapes y talavera", colores: ["#ff2d87", "#3b5bff"], capital: c("Tlaxcala", 19.32, -98.24), ciudades: [c("Huamantla", 19.31, -97.92)] },
  { slug: "veracruz", nombre: "Veracruz", codigo: "MX-VER", especialidad: "Vainilla, jarana y color", colores: ["#ffc634", "#0fb5a6"], capital: c("Xalapa", 19.54, -96.91), ciudades: [c("Veracruz", 19.17, -96.13), c("Papantla", 20.45, -97.32)] },
  { slug: "yucatan", nombre: "Yucatán", codigo: "MX-YUC", especialidad: "Hamacas y accesorios", colores: ["#0fb5a6", "#ffc634"], capital: c("Mérida", 20.97, -89.62), ciudades: [c("Valladolid", 20.69, -88.2), c("Izamal", 20.93, -89.02)] },
  { slug: "zacatecas", nombre: "Zacatecas", codigo: "MX-ZAC", especialidad: "Plata y cantera", colores: ["#7c2df0", "#ff5c5c"], capital: c("Zacatecas", 22.77, -102.58), ciudades: [c("Jerez", 22.65, -102.99)] },
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
