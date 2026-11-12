// Reglas de envío para vendedores: qué no se puede enviar (según la paquetería, Envia.com),
// qué se envía sin seguro, cómo empacar y quién responde si algo llega mal.
// Fuente: https://help.envia.com/articulos-prohibidos-y-restringidos/ (revisar de vez en cuando por cambios).

export const fuenteReglasEnvio = "https://help.envia.com/articulos-prohibidos-y-restringidos/";

// No se pueden enviar (tampoco se pueden vender en XICO)
export const prohibidos = [
  "Plantas, flores, semillas vivas, frutas, verduras y cualquier alimento o bebida",
  "Animales vivos o muertos, pieles y carne",
  "Líquidos, aerosoles o productos inflamables, tóxicos o peligrosos (por ejemplo, solventes, pinturas en aerosol, alcohol)",
  "Explosivos, gases comprimidos, fuegos artificiales y material radiactivo",
  "Medicamentos, drogas, sustancias controladas o productos con CBD",
  "Armas o réplicas de armas",
  "Vapes, cigarros y productos de tabaco",
  "Material pornográfico",
  "Dinero en efectivo, títulos de valor, lingotes o metales preciosos sin trabajar",
  "Falsificaciones o productos con marcas ajenas (además, en XICO no se permite la reventa)",
];

// Se pueden enviar, pero la paquetería NO los asegura ni acepta reclamos
export const restringidos = [
  { que: "Frágiles: vidrio, cerámica, barro, talavera, espejos", nota: "si se rompen, la paquetería no paga" },
  { que: "Joyería, arte, cuadros y piezas de mucho valor", nota: "la paquetería no los asegura" },
  { que: "Líquidos no peligrosos (aceites, jabones líquidos, cosméticos)", nota: "pueden cobrar extra si se derraman" },
];

export const comoEmpacar = [
  "Usa una caja rígida, nueva o en buen estado, del tamaño justo (ni muy grande ni apretada).",
  "Envuelve cada pieza por separado y rellena los huecos (papel, burbuja, cartón) para que nada se mueva: deja unos 5 cm de relleno por cada lado.",
  "Piezas frágiles: doble caja (una caja dentro de otra con relleno entre ambas) y escribe “FRÁGIL” por fuera.",
  "Líquidos permitidos: tapa bien, sella la tapa con cinta y mételos en una bolsa cerrada.",
  "Cierra la caja con cinta en forma de “H” (en el centro y en los dos bordes), arriba y abajo.",
  "Pega la guía plana en la cara más grande, sin cubrir el código de barras, y quita etiquetas viejas.",
  "Registra el peso y las medidas reales del paquete en cada producto: si son mayores a las que pusiste, la paquetería cobra la diferencia.",
];

export const responsabilidad = [
  "Tú eres responsable de empacar bien. Si un pedido llega roto o dañado por un mal empaque, el reembolso al cliente se descuenta de tu pago.",
  "Si envías algo prohibido, la paquetería puede retenerlo o destruirlo; los costos y el reembolso al cliente corren por tu cuenta y tu tienda puede ser suspendida.",
  "Si el peso o las medidas reales son mayores a los que registraste, la diferencia que cobre la paquetería se descuenta de tu pago.",
  "Antes de cerrar la caja, toma una foto del producto empacado: te ayuda a demostrar que lo enviaste bien si hay una aclaración.",
];
