// Avisos dentro de la página (la campanita): ventas, envíos, reseñas y cambios en tu tienda.
export type TipoAviso = "venta" | "pago" | "envio" | "entrega" | "resena" | "respuesta" | "tienda";

export type Aviso = {
  id: string;
  uid: string; // a quién le llega
  tipo: TipoAviso;
  titulo: string;
  texto: string;
  enlace: string; // a dónde lleva al tocarlo
  fecha: number;
  leido: boolean;
};

export const fechaAviso = (t: number, ahora: number) => {
  const min = Math.round((ahora - t) / 60000);
  if (min < 1) return "ahora";
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  return new Date(t).toLocaleDateString("es-MX", { day: "numeric", month: "short" });
};
