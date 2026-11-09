// Paqueterías y rastreo (compartido por el servidor y el navegador)

export type EstadoEnvio = "preparando" | "enviado" | "entregado";

export type Paqueteria = {
  id: string;
  nombre: string;
  // Página de rastreo. Si la paquetería no permite poner la guía en la liga,
  // se abre su página de rastreo y el comprador pega la guía.
  rastreo: (guia: string) => string;
};

export const paqueterias: Paqueteria[] = [
  { id: "estafeta", nombre: "Estafeta", rastreo: () => "https://www.estafeta.com/rastreo" },
  { id: "dhl", nombre: "DHL", rastreo: (g) => `https://www.dhl.com/mx-es/home/rastreo.html?tracking-id=${encodeURIComponent(g)}` },
  { id: "fedex", nombre: "FedEx", rastreo: (g) => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(g)}` },
  { id: "paquetexpress", nombre: "Paquetexpress", rastreo: () => "https://www.paquetexpress.com.mx/" },
  { id: "redpack", nombre: "Redpack", rastreo: () => "https://www.redpack.com.mx/" },
  { id: "jt", nombre: "J&T Express", rastreo: () => "https://www.jtexpress.mx/" },
  { id: "99minutos", nombre: "99minutos", rastreo: () => "https://www.99minutos.com/" },
  { id: "correos", nombre: "Correos de México", rastreo: () => "https://www.correosdemexico.gob.mx/" },
  { id: "local", nombre: "Entrega local / en persona", rastreo: () => "" },
  { id: "otra", nombre: "Otra paquetería", rastreo: () => "" },
];

export const paqueteriaPorId = (id?: string) => paqueterias.find((p) => p.id === id);

export const nombreEnvio: Record<EstadoEnvio, string> = {
  preparando: "Por enviar",
  enviado: "Enviado",
  entregado: "Entregado",
};
