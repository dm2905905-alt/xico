import type { MetadataRoute } from "next";
import { urlSitio } from "@/lib/sitio";

// Qué pueden revisar los buscadores (las páginas privadas quedan fuera)
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/panel", "/cuenta", "/carrito", "/pagar", "/pedido/", "/entrar", "/favoritos", "/api/"],
    },
    sitemap: `${urlSitio()}/sitemap.xml`,
  };
}
