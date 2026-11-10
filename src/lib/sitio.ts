// Dirección pública del sitio (en Vercel se configura SITE_URL; en tu computadora es localhost)
export const urlSitio = () => (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
