# XICO

Marketplace de creadores, artesanos y emprendedores mexicanos: productos hechos a mano y personalizados, directo de quien los crea.

Hecho con **Next.js** + **Firebase** (Authentication y Firestore).

## Correr en tu computadora

1. Instala dependencias:

   ```bash
   npm install
   ```

2. Copia `.env.local.example` como `.env.local` y pega los datos de tu app web de Firebase
   (Firebase Console → ⚙️ Configuración del proyecto → Tus apps).

3. Arranca el servidor de desarrollo y abre http://localhost:3000:

   ```bash
   npm run dev
   ```

4. La primera vez, entra a `/admin` con la cuenta administradora para publicar las reglas de seguridad
   e importar los productos de ejemplo.

## Estructura

- `src/app/` — páginas (inicio, buscar, producto, creador, estado, carrito, pagar, cuenta, admin)
- `src/components/` — piezas de la interfaz
- `src/lib/catalogo.ts` — lectura del catálogo desde Firestore
- `src/lib/datos.ts` — tipos, categorías y estados
- `src/lib/ejemplo.ts` — datos de ejemplo para importar
- `src/lib/reglas.ts` — reglas de seguridad de Firestore
- `PROYECTO-XICO.md` — la idea completa del proyecto

## Avance

- [x] Fase 1: diseño y página principal
- [x] Fase 2: catálogo, búsqueda, producto con personalización, creadores y estados
- [x] Fase 3: carrito multi-vendedor, favoritos y cuentas con Google
- [x] Fase 4: base de datos en Firestore con reglas de seguridad
- [x] Fase 5: panel del creador (fotos pendientes: requieren Firebase Storage)
- [x] Fase 6: pagos con Mercado Pago (modo prueba; falta reparto automático a creadores)
- [x] Fase 7: envíos (guía manual y rastreo; falta cotizar/comprar guías automáticamente)
- [ ] Fase 8: videos, asistente de regalos e IA
- [ ] Fase 9: panel de administración
- [ ] Fase 10: lanzamiento
