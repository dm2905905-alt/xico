// Dirección pública del sitio.
// 1) SITE_URL si la configuraste (en Vercel se ignora si dice "localhost", por si se copió de .env.local).
// 2) En Vercel, la dirección de producción que Vercel informa sola (xico.vercel.app o tu dominio).
// 3) En tu computadora, localhost.
export const urlSitio = () => {
  const enVercel = !!process.env.VERCEL;
  const manual = process.env.SITE_URL?.trim().replace(/\/$/, "");
  if (manual && !(enVercel && manual.includes("localhost"))) return manual;
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim().replace(/\/$/, "");
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
};
