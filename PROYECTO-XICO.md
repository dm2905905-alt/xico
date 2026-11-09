# XICO — Resumen del proyecto

Fuente: conversación con Gemini Notebook "XICO" (leída el 2026-11-09).

## Concepto
Marketplace para creadores, artesanos y emprendedores mexicanos con productos hechos a mano o personalizados
(fundas pintadas, ropa intervenida, lienzos, joyería, velas, regalos, artesanía tradicional).

Modelo híbrido:
- Descubrimiento y promociones estilo Temu
- Feed de videos verticales del proceso ("Así se hace") estilo TikTok
- Productos personalizados / piezas únicas estilo Etsy
- Historia y conexión con el creador estilo Instagram

Garantía "100% hecho por el artista" y regla anti-dropshipping.

## Módulo del comprador
- Navegar, guardar favoritos y armar carrito sin registro; cuenta ligera (Google o teléfono) solo al pagar.
- Personalización en tiempo real: nombres, paletas de color, foto de referencia, extras con costo ("¿Agregar mascota? +$100").
- Feed "Descubre": videos verticales con like, comentarios y compra directa.
- Asistente "Encuentra un regalo": para quién, ocasión, presupuesto (<$300, $300–$500, $500–$1,000).
- Carrito multi-vendedor en un solo pago.
- "Explora México": comprar por estado (Oaxaca, Michoacán, Jalisco, Puebla…).

## Módulo del creador
- IA para contenido: quitar fondo, mejorar luz, fotos lifestyle, títulos/descripciones SEO, sugerir precio, videos de 10 s.
- Analytics: visitas, carritos iniciados, conversión; "Radar de oportunidades" (alta demanda / poca oferta).
- Creator Score (0–100): puntualidad, calidad, opiniones → insignias "Artista Verificado", "Top Vendedor".
- Envíos: elegir e imprimir guías con paqueterías integradas.

## Módulo administrativo
- Split payments (Mercado Pago Marketplace o Stripe Connect), ej. 85% creador / 15% plataforma.
- Ingresos: comisión 8–15%, planes Gratuito/Pro/Premium, kit de activación $99 MXN, anuncios patrocinados, regalos corporativos B2B.
- Moderación: bloqueo de importados masivos y falsificaciones; bloqueo de teléfonos/emails en el chat interno.
- Logística: tarifas con DHL, FedEx, Estafeta + mensajería en moto para entregas locales el mismo día.

## Diseño
- Estética mosaico (Pinterest/Instagram): limpio, moderno, cálido, centrado en la imagen.
- Buscador grande arriba: "¿Qué estás buscando? 🔍" con sugerencias ("funda pintada", "globo personalizado", "cuadro de Frida").
- Home en bloques: Ofertas del día, Nuevos, Más vendidos, Hecho en México, Creadores destacados, Artesanos cerca de ti, Desde $99.
- Perfil del creador: historia, taller, materiales, ubicación, calificaciones, trayectoria.

## Tecnología sugerida por Gemini
- Frontend: Flutter / FlutterFlow (web + Android + iOS)
- Backend: Firebase (Firestore, Auth, Storage) + Google Cloud / Vertex AI
- Pagos: Mercado Pago Marketplace (split payments)
