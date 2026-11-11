// Datos legales y de contacto de XICO. Se usan en el Aviso de privacidad, los Términos y el Centro de ayuda.
// Tomados de la Constancia de Situación Fiscal. Antes de lanzar: pide a un abogado que revise los textos,
// y cambia "sitio" (y los correos, si quieres) cuando compres el dominio.

export const negocio = {
  marca: "XICO",
  // Persona física responsable (como aparece en el RFC)
  responsable: "Damián Medina Ibarra",
  rfc: "MEID071001N22",
  domicilio: "Calle Kinyeti 263, Col. Jesús del Monte, C.P. 58350, Morelia, Michoacán, México",
  correoContacto: "dm2905905@gmail.com",
  correoPrivacidad: "dm2905905@gmail.com",
  telefono: "WhatsApp 452 132 6295",
  whatsapp: "524521326295", // para el enlace wa.me
  sitio: "xico.vercel.app",
  comision: "15%",
  mensualidad: "$400",
  mesesGratis: 3,
  diasTolerancia: 7,
  diasParaReportar: 7, // días después de recibir el pedido para reportar un problema
  actualizado: "11 de noviembre de 2026",
};

export const pendiente = (texto: string) => texto.startsWith("[Pendiente");
