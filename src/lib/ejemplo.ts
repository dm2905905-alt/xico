// Datos de ejemplo para arrancar la tienda.
// Se importan a Firestore una sola vez desde /admin; después la tienda lee de Firebase.
import type { Creador, OpcionPersonalizacion, Producto } from "./datos";

type ProductoBase = Omit<Producto, "taller" | "estado" | "descripcion" | "materiales" | "diasElaboracion" | "personalizacion">;
type DetalleProducto = Pick<Producto, "descripcion" | "materiales" | "diasElaboracion"> & {
  personalizacion?: OpcionPersonalizacion[];
};

export const creadoresEjemplo: Creador[] = [
  {
    slug: "taller-xochitl",
    nombre: "Xóchitl Ramírez",
    taller: "Taller Xóchitl",
    estado: "oaxaca",
    ciudad: "Teotitlán del Valle",
    especialidad: "Textiles bordados a mano",
    historia: "Tercera generación de bordadoras. Cada pieza lleva entre 3 y 10 días de trabajo.",
    calificacion: 4.9,
    resenas: 312,
    verificado: true,
    top: true,
    colores: ["#d6246e", "#f08a4b"],
  },
  {
    slug: "pinceles-de-luz",
    nombre: "Andrés Medina",
    taller: "Pinceles de Luz",
    estado: "cdmx",
    ciudad: "Coyoacán",
    especialidad: "Fundas y tenis pintados",
    historia: "Pinto fundas, tenis y chamarras a mano con acrílico y acabado sellado.",
    calificacion: 4.8,
    resenas: 541,
    verificado: true,
    top: true,
    colores: ["#4a2c6b", "#e9a824"],
  },
  {
    slug: "cera-y-copal",
    nombre: "Lucía Herrera",
    taller: "Cera & Copal",
    estado: "jalisco",
    ciudad: "Tlaquepaque",
    especialidad: "Velas aromáticas artesanales",
    historia: "Velas de cera de soya con aromas mexicanos: copal, cacao, flor de naranjo.",
    calificacion: 4.7,
    resenas: 188,
    verificado: true,
    top: false,
    colores: ["#e9a824", "#c4511f"],
  },
  {
    slug: "plata-de-taxco",
    nombre: "Emiliano Vargas",
    taller: "Plata Viva",
    estado: "guanajuato",
    ciudad: "San Miguel de Allende",
    especialidad: "Joyería de plata .925",
    historia: "Joyero desde los 15 años. Diseños inspirados en la arquitectura colonial.",
    calificacion: 4.9,
    resenas: 97,
    verificado: true,
    top: false,
    colores: ["#5c6b73", "#9fb1ba"],
  },
  {
    slug: "talavera-don-pepe",
    nombre: "José Luis Cortés",
    taller: "Talavera Don Pepe",
    estado: "puebla",
    ciudad: "Puebla",
    especialidad: "Talavera poblana",
    historia: "Taller familiar con más de 40 años. Piezas con denominación de origen.",
    calificacion: 4.8,
    resenas: 256,
    verificado: true,
    top: true,
    colores: ["#1e3a8a", "#4f7cd6"],
  },
  {
    slug: "lienzo-norte",
    nombre: "Mariana Soto",
    taller: "Lienzo Norte",
    estado: "michoacan",
    ciudad: "Morelia",
    especialidad: "Retratos y cuadros por encargo",
    historia: "Retratos de familias y mascotas en óleo y acrílico, desde una foto.",
    calificacion: 4.9,
    resenas: 143,
    verificado: false,
    top: false,
    colores: ["#2f7d6b", "#e9a824"],
  },
];

const productosBase: ProductoBase[] = [
  { slug: "funda-frida-pintada", nombre: "Funda pintada a mano “Frida”", creador: "pinceles-de-luz", categoria: "fundas", precio: 349, precioAntes: 449, calificacion: 4.9, resenas: 128, vendidos: 860, personalizable: true, colores: ["#d6246e", "#e9a824"], forma: "alta" },
  { slug: "huipil-bordado-flores", nombre: "Huipil bordado de flores", creador: "taller-xochitl", categoria: "ropa", precio: 1290, calificacion: 5, resenas: 64, vendidos: 210, personalizable: false, colores: ["#c4511f", "#d6246e"], forma: "alta" },
  { slug: "vela-copal-cacao", nombre: "Vela de soya copal y cacao", creador: "cera-y-copal", categoria: "velas", precio: 189, precioAntes: 229, calificacion: 4.8, resenas: 302, vendidos: 1420, personalizable: false, colores: ["#e9a824", "#6f5442"], forma: "cuadrada" },
  { slug: "retrato-mascota-oleo", nombre: "Retrato de tu mascota al óleo", creador: "lienzo-norte", categoria: "cuadros", precio: 890, calificacion: 4.9, resenas: 87, vendidos: 340, nuevo: true, personalizable: true, colores: ["#2f7d6b", "#e9a824"], forma: "media" },
  { slug: "aretes-plata-colonial", nombre: "Aretes de plata “Colonial”", creador: "plata-de-taxco", categoria: "joyeria", precio: 640, calificacion: 4.9, resenas: 45, vendidos: 190, personalizable: false, colores: ["#5c6b73", "#c9d4da"], forma: "cuadrada" },
  { slug: "taza-talavera-nombre", nombre: "Taza de talavera con tu nombre", creador: "talavera-don-pepe", categoria: "regalos", precio: 279, calificacion: 4.7, resenas: 210, vendidos: 980, personalizable: true, colores: ["#1e3a8a", "#4f7cd6"], forma: "cuadrada" },
  { slug: "chamarra-mezclilla-pintada", nombre: "Chamarra de mezclilla intervenida", creador: "pinceles-de-luz", categoria: "ropa", precio: 1490, calificacion: 4.8, resenas: 39, vendidos: 120, nuevo: true, personalizable: true, colores: ["#1f4e79", "#e9a824"], forma: "alta" },
  { slug: "plato-talavera-decorativo", nombre: "Plato decorativo de talavera", creador: "talavera-don-pepe", categoria: "artesania", precio: 99, precioAntes: 139, calificacion: 4.6, resenas: 95, vendidos: 610, personalizable: false, colores: ["#1e3a8a", "#e9a824"], forma: "cuadrada" },
  { slug: "collar-ambar-chiapas", nombre: "Collar con ámbar natural", creador: "plata-de-taxco", categoria: "joyeria", precio: 980, calificacion: 5, resenas: 22, vendidos: 75, nuevo: true, personalizable: false, colores: ["#c4511f", "#e9a824"], forma: "media" },
  { slug: "vela-flor-de-naranjo", nombre: "Vela flor de naranjo en barro", creador: "cera-y-copal", categoria: "velas", precio: 99, calificacion: 4.7, resenas: 140, vendidos: 720, personalizable: false, colores: ["#f08a4b", "#e9a824"], forma: "media" },
  { slug: "cuadro-catrina-lienzo", nombre: "Lienzo “Catrina en flor”", creador: "lienzo-norte", categoria: "cuadros", precio: 1150, precioAntes: 1390, calificacion: 4.8, resenas: 31, vendidos: 88, personalizable: false, colores: ["#4a2c6b", "#d6246e"], forma: "alta" },
  { slug: "bolsa-bordada-tenango", nombre: "Bolsa bordada estilo tenango", creador: "taller-xochitl", categoria: "decoracion", precio: 450, calificacion: 4.9, resenas: 77, vendidos: 305, nuevo: true, personalizable: true, colores: ["#d6246e", "#2f7d6b"], forma: "cuadrada" },
  { slug: "tenis-pintados-ajolote", nombre: "Tenis pintados “Ajolote”", creador: "pinceles-de-luz", categoria: "ropa", precio: 1190, calificacion: 4.9, resenas: 58, vendidos: 160, personalizable: true, colores: ["#e57ba0", "#4f7cd6"], forma: "media" },
  { slug: "llavero-nombre-barro", nombre: "Llavero de barro con nombre", creador: "talavera-don-pepe", categoria: "regalos", precio: 99, calificacion: 4.5, resenas: 180, vendidos: 1310, personalizable: true, colores: ["#a33a3a", "#e9a824"], forma: "cuadrada" },
  { slug: "anillo-plata-maguey", nombre: "Anillo de plata “Maguey”", creador: "plata-de-taxco", categoria: "joyeria", precio: 520, precioAntes: 590, calificacion: 4.8, resenas: 33, vendidos: 140, personalizable: true, colores: ["#2f7d6b", "#9fb1ba"], forma: "cuadrada" },
  { slug: "camino-mesa-bordado", nombre: "Camino de mesa bordado", creador: "taller-xochitl", categoria: "decoracion", precio: 690, calificacion: 4.9, resenas: 41, vendidos: 132, personalizable: false, colores: ["#c4511f", "#2f7d6b"], forma: "alta" },
];

const paletaMexicana = [
  { nombre: "Rosa mexicano", hex: "#d6246e" },
  { nombre: "Terracota", hex: "#c4511f" },
  { nombre: "Amarillo maíz", hex: "#e9a824" },
  { nombre: "Verde jade", hex: "#2f7d6b" },
  { nombre: "Azul talavera", hex: "#1e3a8a" },
  { nombre: "Negro", hex: "#2b1d14" },
];

const detalles: Record<string, DetalleProducto> = {
  "funda-frida-pintada": {
    descripcion: "Funda rígida pintada a mano con acrílico y sellada con barniz mate para que no se despinte. Cada una es única: ninguna sale exactamente igual.",
    materiales: "Policarbonato, acrílico profesional, barniz sellador",
    diasElaboracion: "3 a 5 días",
    personalizacion: [
      { tipo: "texto", id: "modelo", etiqueta: "Modelo de tu celular", max: 40, requerido: true, ayuda: "Ej. iPhone 15, Galaxy S24, Moto G84" },
      { tipo: "texto", id: "nombre", etiqueta: "Nombre o frase (opcional)", max: 20 },
      { tipo: "colores", id: "fondo", etiqueta: "Color de fondo", opciones: paletaMexicana },
      { tipo: "extra", id: "brillos", etiqueta: "Agregar detalles con brillo", precio: 50 },
    ],
  },
  "huipil-bordado-flores": {
    descripcion: "Huipil de manta bordado a mano con flores de colores. El bordado toma alrededor de una semana por pieza.",
    materiales: "Manta de algodón, hilo de algodón mercerizado",
    diasElaboracion: "Listo para enviar",
  },
  "vela-copal-cacao": {
    descripcion: "Vela de cera de soya con aroma a copal y cacao, en vaso de vidrio reutilizable. Hasta 40 horas de duración.",
    materiales: "Cera de soya, aceites esenciales, mecha de algodón",
    diasElaboracion: "Listo para enviar",
  },
  "retrato-mascota-oleo": {
    descripcion: "Pintamos a tu mascota a partir de una foto. Te enviamos un avance antes de terminar para que lo apruebes.",
    materiales: "Óleo sobre lienzo de algodón, bastidor de madera",
    diasElaboracion: "10 a 15 días",
    personalizacion: [
      { tipo: "foto", id: "foto", etiqueta: "Foto de tu mascota", requerido: true, ayuda: "Con buena luz y donde se vea bien su carita" },
      { tipo: "texto", id: "nombre", etiqueta: "Nombre de tu mascota", max: 20 },
      { tipo: "colores", id: "fondo", etiqueta: "Color de fondo", opciones: paletaMexicana },
      { tipo: "extra", id: "mascota2", etiqueta: "¿Agregar otra mascota?", precio: 100 },
      { tipo: "extra", id: "marco", etiqueta: "Agregar marco de madera", precio: 250 },
    ],
  },
  "aretes-plata-colonial": {
    descripcion: "Aretes de plata .925 inspirados en los balcones coloniales de San Miguel de Allende. Incluyen estuche.",
    materiales: "Plata .925",
    diasElaboracion: "Listo para enviar",
  },
  "taza-talavera-nombre": {
    descripcion: "Taza de talavera poblana pintada a mano con el nombre que elijas. Apta para microondas.",
    materiales: "Barro, esmalte de talavera",
    diasElaboracion: "7 a 10 días",
    personalizacion: [
      { tipo: "texto", id: "nombre", etiqueta: "Nombre en la taza", max: 15, requerido: true },
      { tipo: "colores", id: "color", etiqueta: "Color principal", opciones: paletaMexicana.slice(0, 5) },
      { tipo: "extra", id: "caja", etiqueta: "Caja de regalo", precio: 60 },
    ],
  },
  "chamarra-mezclilla-pintada": {
    descripcion: "Chamarra de mezclilla intervenida y pintada a mano en la espalda. Pintura textil que resiste lavadas.",
    materiales: "Mezclilla 100% algodón, pintura textil",
    diasElaboracion: "7 a 10 días",
    personalizacion: [
      { tipo: "texto", id: "talla", etiqueta: "Talla", max: 5, requerido: true, ayuda: "CH, M, G o XG" },
      { tipo: "foto", id: "referencia", etiqueta: "Imagen de referencia (opcional)", ayuda: "Si quieres un diseño en especial" },
      { tipo: "texto", id: "nombre", etiqueta: "Nombre o frase en la manga (opcional)", max: 15 },
    ],
  },
  "plato-talavera-decorativo": {
    descripcion: "Plato decorativo de talavera para colgar o lucir en tu mesa. Pintado a mano por artesanos poblanos.",
    materiales: "Barro, esmalte de talavera",
    diasElaboracion: "Listo para enviar",
  },
  "collar-ambar-chiapas": {
    descripcion: "Collar con ámbar natural de Chiapas montado en plata .925. Cada piedra es distinta.",
    materiales: "Ámbar de Chiapas, plata .925",
    diasElaboracion: "Listo para enviar",
  },
  "vela-flor-de-naranjo": {
    descripcion: "Vela pequeña con aroma a flor de naranjo dentro de un cazo de barro. Perfecta para regalar.",
    materiales: "Cera de soya, barro, aceite esencial",
    diasElaboracion: "Listo para enviar",
  },
  "cuadro-catrina-lienzo": {
    descripcion: "Pintura original en acrílico de una catrina rodeada de flores de cempasúchil. Pieza única, firmada.",
    materiales: "Acrílico sobre lienzo, 50 × 70 cm",
    diasElaboracion: "Listo para enviar",
  },
  "bolsa-bordada-tenango": {
    descripcion: "Bolsa de manta con bordado estilo tenango. Puedes elegir el color del bordado.",
    materiales: "Manta, hilo de algodón",
    diasElaboracion: "5 a 7 días",
    personalizacion: [
      { tipo: "colores", id: "bordado", etiqueta: "Color del bordado", opciones: paletaMexicana },
      { tipo: "texto", id: "iniciales", etiqueta: "Iniciales bordadas (opcional)", max: 4 },
    ],
  },
  "tenis-pintados-ajolote": {
    descripcion: "Tenis de lona pintados a mano con ajolotes. Pintura especial para tela, sellada.",
    materiales: "Tenis de lona, pintura textil",
    diasElaboracion: "7 a 10 días",
    personalizacion: [
      { tipo: "texto", id: "talla", etiqueta: "Talla (MX)", max: 5, requerido: true, ayuda: "Ej. 25.5" },
      { tipo: "colores", id: "ajolote", etiqueta: "Color de los ajolotes", opciones: paletaMexicana.slice(0, 4) },
      { tipo: "extra", id: "nombre", etiqueta: "Agregar tu nombre en el talón", precio: 80 },
    ],
  },
  "llavero-nombre-barro": {
    descripcion: "Llavero de barro pintado con el nombre que quieras. Ideal para recuerdos de fiesta.",
    materiales: "Barro, pintura acrílica, argolla metálica",
    diasElaboracion: "3 a 5 días",
    personalizacion: [
      { tipo: "texto", id: "nombre", etiqueta: "Nombre", max: 12, requerido: true },
      { tipo: "colores", id: "color", etiqueta: "Color", opciones: paletaMexicana },
    ],
  },
  "anillo-plata-maguey": {
    descripcion: "Anillo de plata .925 con hojas de maguey grabadas. Lo hacemos a tu medida.",
    materiales: "Plata .925",
    diasElaboracion: "5 a 7 días",
    personalizacion: [
      { tipo: "texto", id: "medida", etiqueta: "Medida del anillo", max: 4, requerido: true, ayuda: "Del 5 al 10" },
      { tipo: "texto", id: "grabado", etiqueta: "Grabado interior (opcional)", max: 12 },
    ],
  },
  "camino-mesa-bordado": {
    descripcion: "Camino de mesa de 1.80 m bordado a mano con grecas oaxaqueñas.",
    materiales: "Manta de algodón, hilo de algodón",
    diasElaboracion: "Listo para enviar",
  },
};


// Une cada producto con su detalle y copia los datos del creador que se muestran en las tarjetas
// (en Firestore se guardan juntos para no tener que buscar al creador en cada tarjeta)
export function catalogoEjemplo(): { productos: Producto[]; creadores: Creador[] } {
  const productos = productosBase.map((p) => {
    const c = creadoresEjemplo.find((x) => x.slug === p.creador)!;
    return { ...p, ...detalles[p.slug], taller: c.taller, estado: c.estado };
  });
  return { productos, creadores: creadoresEjemplo };
}
