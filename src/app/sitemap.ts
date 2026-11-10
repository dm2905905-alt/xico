import type { MetadataRoute } from "next";
import { obtenerCatalogo } from "@/lib/catalogo";
import { categorias, estados } from "@/lib/datos";
import { urlSitio } from "@/lib/sitio";

// Mapa del sitio para Google: todas las páginas públicas, productos y tiendas
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = urlSitio();
  const { productos, creadores } = await obtenerCatalogo();

  const fijas = ["", "/buscar", "/regalos", "/estados", "/creadores", "/vende", "/ayuda", "/terminos", "/privacidad"].map((ruta) => ({
    url: `${base}${ruta}`,
    changeFrequency: "weekly" as const,
    priority: ruta === "" ? 1 : 0.6,
  }));

  return [
    ...fijas,
    ...categorias.map((c) => ({ url: `${base}/categoria/${c.slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ...estados.map((e) => ({ url: `${base}/estado/${e.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...productos.map((p) => ({ url: `${base}/producto/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.9 })),
    ...creadores.map((c) => ({ url: `${base}/creador/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
