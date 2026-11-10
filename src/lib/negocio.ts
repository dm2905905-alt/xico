// Datos legales y de contacto de XICO. Se usan en el Aviso de privacidad, los Términos y el Centro de ayuda.
// ⚠️ ANTES DE LANZAR: reemplaza cada "[Pendiente: …]" con los datos reales (y pide a un abogado que revise los textos).

export const negocio = {
  marca: "XICO",
  // Persona física o empresa responsable (como aparece en tu RFC)
  responsable: "[Pendiente: nombre completo o razón social]",
  rfc: "[Pendiente: RFC]",
  domicilio: "[Pendiente: calle, número, colonia, código postal, ciudad y estado]",
  correoContacto: "[Pendiente: correo de contacto, ej. hola@xico.mx]",
  correoPrivacidad: "[Pendiente: correo para temas de privacidad, ej. privacidad@xico.mx]",
  telefono: "[Pendiente: teléfono o WhatsApp de atención]",
  sitio: "[Pendiente: dominio, ej. www.xico.mx]",
  comision: "15%",
  diasParaReportar: 7, // días después de recibir el pedido para reportar un problema
  actualizado: "10 de noviembre de 2026",
};

export const pendiente = (texto: string) => texto.startsWith("[Pendiente");
