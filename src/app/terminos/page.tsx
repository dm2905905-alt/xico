import type { Metadata } from "next";
import Link from "next/link";
import { Dato, PaginaLegal } from "@/components/PaginaLegal";
import { negocio } from "@/lib/negocio";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description: "Reglas de uso de XICO para compradores y creadores: compras, pagos, envíos, devoluciones y Compra protegida.",
};

// BORRADOR. Debe revisarlo un abogado antes del lanzamiento.
export default function Terminos() {
  const n = negocio;
  return (
    <PaginaLegal titulo="Términos y condiciones" subtitulo={`Las reglas para comprar y vender en ${n.marca}.`}>
      <h2>1. Qué es {n.marca}</h2>
      <p>
        {n.marca} ({n.sitio}) es un marketplace operado por <Dato v={n.responsable} />, persona física con RFC <Dato v={n.rfc} />, que conecta a personas que compran con
        creadores, artesanos y emprendedores mexicanos que venden productos hechos a mano por ellos mismos. Al usar {n.marca} aceptas
        estos términos y nuestro <Link href="/privacidad">Aviso de privacidad</Link>.
      </p>
      <p>
        Cada producto lo vende directamente su creador. {n.marca} facilita la tienda, el cobro, la comunicación y el seguimiento del
        envío, y responde por la Compra protegida descrita abajo.
      </p>

      <h2>2. Tu cuenta</h2>
      <ul>
        <li>Puedes navegar, guardar favoritos y armar tu carrito sin cuenta. Para pagar o vender necesitas entrar con Google o con tu celular.</li>
        <li>Debes ser mayor de edad o comprar con el permiso de tu madre, padre o tutor.</li>
        <li>Eres responsable de lo que se haga con tu cuenta. Si notas algo raro, avísanos de inmediato.</li>
      </ul>

      <h2>3. Comprar</h2>
      <ul>
        <li>Los precios están en pesos mexicanos. El total que pagas (productos y envío) se muestra antes de pagar.</li>
        <li>
          Si compras a varios creadores en un mismo pedido, cada uno te envía su paquete por separado y cada paquete puede llegar en
          días distintos.
        </li>
        <li>
          Los productos personalizados se hacen con los datos que tú escribes (nombres, colores, fotos). Revísalos bien: el creador hará
          la pieza tal como la pediste.
        </li>
        <li>El tiempo de elaboración que indica cada producto se suma al tiempo de envío.</li>
        <li>Como son piezas hechas a mano, pueden tener pequeñas variaciones respecto a las fotos; eso las hace únicas.</li>
      </ul>

      <h2>4. Pagos</h2>
      <p>
        Los pagos se procesan con Mercado Pago (tarjeta, OXXO, saldo y otros medios disponibles). {n.marca} no recibe ni guarda los
        datos de tu tarjeta. Un pedido se confirma cuando Mercado Pago aprueba el pago. Si pagas en efectivo (por ejemplo en OXXO), el
        pedido se confirma cuando Mercado Pago recibe el pago.
      </p>

      <h2>5. Envíos</h2>
      <ul>
        <li>
          Enviamos a todo México con paqueterías externas a través de Envia.com. Al pagar ves el <strong>costo real del envío</strong> según tu código
          postal y eliges la paquetería; cada tienda envía su propio paquete.
        </li>
        <li>Cuando tu paquete salga, verás la paquetería y el número de guía en tu pedido para rastrearlo; el rastreo se actualiza solo.</li>
        <li>Verifica que tu dirección y teléfono estén correctos; un dato equivocado puede retrasar o impedir la entrega.</li>
      </ul>

      <h2>6. Compra protegida, devoluciones y reembolsos</h2>
      <p>Te devolvemos tu dinero si:</p>
      <ul>
        <li>Tu pedido no llega.</li>
        <li>Llega dañado, incompleto o es distinto a lo que pediste (incluida la personalización que escribiste).</li>
      </ul>
      <p>
        Repórtalo dentro de los {n.diasParaReportar} días naturales siguientes a la entrega (o a la fecha estimada, si no llegó)
        escribiendo a <Dato v={n.correoContacto} /> o por <Dato v={n.telefono} /> con tu número de pedido y fotos del producto y del empaque. Revisaremos el caso con
        el creador y, si procede, te reembolsaremos por el mismo medio de pago o te enviaremos un reemplazo.
      </p>
      <p>
        <strong>Productos personalizados:</strong> como se hacen especialmente para ti, no se aceptan devoluciones por cambio de opinión.
        Sí aplica la Compra protegida si llegan con defectos o distintos a lo que pediste.
      </p>
      <p>
        <strong>Productos no personalizados:</strong> puedes pedir una devolución por cambio de opinión dentro de los{" "}
        {n.diasParaReportar} días naturales siguientes a la entrega, si el producto está sin usar y en su empaque. El costo del envío
        de regreso corre por tu cuenta, salvo que el producto tenga un defecto.
      </p>
      <p>
        Esto no limita los derechos que te da la Ley Federal de Protección al Consumidor. Puedes acudir a la PROFECO si no quedas
        satisfecho con nuestra respuesta.
      </p>

      <h2>7. Vender en {n.marca} (creadores)</h2>
      <h3>Solicitud y revisión</h3>
      <ul>
        <li>
          Para vender llenas una solicitud con los datos de tu tienda, tu cuenta para cobrar (CLABE) y tu domicilio. El equipo de{" "}
          {n.marca} la revisa y decide si la aprueba. Mientras está en revisión puedes subir productos, pero no se muestran ni se
          pueden comprar.
        </li>
        <li>La cuenta donde cobras debe estar a tu nombre o al de tu negocio. Eres responsable de que tus datos sean correctos.</li>
        <li>
          Si cambias tu CLABE, {n.marca} puede pedirte que lo confirmes antes de enviarte el siguiente pago, para proteger tu dinero.
        </li>
      </ul>
      <h3>Reglas para vender</h3>
      <ul>
        <li>
          <strong>Regla de oro: solo puedes vender lo que tú haces.</strong> No se permite la reventa de productos importados o hechos
          en serie por terceros, ni falsificaciones o productos que usen marcas ajenas sin permiso.
        </li>
        <li>Lo que publiques (fotos, textos, precios, tiempos de elaboración) debe ser verdadero. Puedes usar el asistente de IA, pero tú eres responsable de revisar lo que publicas.</li>
        <li>
          <strong>Mensualidad:</strong> los primeros {n.mesesGratis} meses desde que registras tu tienda son gratis. Después pagas{" "}
          <strong>{n.mensualidad} al mes</strong> con Mercado Pago desde tu panel; puedes pagar varios meses por adelantado. Si la
          mensualidad vence, tienes {n.diasTolerancia} días de tolerancia; después tu tienda se pausa (tus productos no se muestran ni se
          pueden comprar) hasta que pagues. No se borra nada. Los pagos de mensualidad no son reembolsables.
        </li>
        <li>
          Además, {n.marca} cobra una <strong>comisión del {n.comision}</strong> sobre el precio de tus productos vendidos. Recibes el precio de
          tus productos menos la comisión. El envío lo paga el cliente y con ese dinero {n.marca} compra la guía de tu paquete.
        </li>
        <li>
          Debes elaborar y enviar los pedidos en el tiempo indicado. Cuando se paga un pedido, {n.marca} genera la guía: la descargas
          en tu panel, la pegas en la caja y entregas el paquete a la paquetería.
        </li>
        <li>
          Los pagos a creadores se hacen <strong>cada semana por transferencia</strong> a la CLABE que registraste, e incluyen los
          pedidos que ya fueron <strong>entregados</strong>. Los pedidos en camino se pagan en el corte siguiente a su entrega. Si hay
          una aclaración o reembolso de Compra protegida, el pago de ese pedido puede retenerse hasta resolverla.
        </li>
        <li>
          Puedes acordar piezas personalizadas con los clientes en el chat de {n.marca} y enviarles una propuesta con precio; el
          cliente la paga dentro de {n.marca} y aplica la misma comisión.
        </li>
        <li>Eres responsable de tus obligaciones fiscales por tus ventas.</li>
        <li>
          {n.marca} puede ocultar productos o suspender tiendas que incumplan estas reglas. La insignia &quot;Artista verificado&quot; la
          otorga el equipo de {n.marca} después de revisar tu trabajo.
        </li>
      </ul>

      <h3>Envíos y empaque</h3>
      <ul>
        <li>
          No puedes vender ni enviar artículos que las paqueterías prohíben (alimentos, plantas, animales, líquidos peligrosos o
          inflamables, aerosoles, medicamentos, armas, vapes, entre otros). Consulta la lista completa en las{" "}
          <Link href="/envios">Reglas de envío y empaque</Link>.
        </li>
        <li>
          <strong>Eres responsable de empacar correctamente tus productos.</strong> Si un pedido llega roto, dañado o incompleto por un
          empaque inadecuado, el reembolso o reemplazo al cliente corre por tu cuenta y se descuenta de tus pagos.
        </li>
        <li>
          Los artículos frágiles (vidrio, cerámica, barro), la joyería, el arte y los líquidos permitidos viajan sin seguro de la
          paquetería: empácalos con protección extra.
        </li>
        <li>
          Debes registrar el peso y las medidas reales de tus productos empacados. Si la paquetería cobra una diferencia porque el paquete
          pesa o mide más de lo registrado, se descontará de tus pagos.
        </li>
        <li>
          Si envías un artículo prohibido, la paquetería puede retenerlo o destruirlo; los costos y el reembolso al cliente corren por tu
          cuenta, y {n.marca} puede suspender tu tienda.
        </li>
      </ul>

      <h2>8. Contenido y propiedad intelectual</h2>
      <p>
        Los creadores conservan los derechos sobre sus diseños, fotos y textos, y autorizan a {n.marca} a mostrarlos en el sitio y en
        su promoción. No está permitido copiar contenido de {n.marca} para otros fines sin permiso.
      </p>

      <h2>9. Usos no permitidos</h2>
      <ul>
        <li>Publicar contenido ilegal, ofensivo, engañoso o que infrinja derechos de terceros.</li>
        <li>Intentar pagar menos de lo debido, manipular precios o calificaciones, o acceder a cuentas ajenas.</li>
        <li>
          Pedir o dar teléfonos, correos u otros datos de contacto para cerrar la venta fuera de {n.marca}. El chat los bloquea y la
          tienda o cuenta que lo intente puede ser suspendida, porque fuera de {n.marca} el comprador pierde la Compra protegida.
        </li>
      </ul>

      <h2>10. Responsabilidad</h2>
      <p>
        {n.marca} trabaja para que el sitio funcione bien y para que las compras sean seguras, pero no garantiza que el servicio esté
        libre de interrupciones. Cada creador es responsable de la calidad y legalidad de sus productos. Esto no limita la Compra
        protegida ni tus derechos como consumidor.
      </p>

      <h2>11. Cambios a estos términos</h2>
      <p>Podemos actualizar estos términos. La versión vigente siempre estará en esta página con su fecha de actualización.</p>

      <h2>12. Ley aplicable y contacto</h2>
      <p>
        Estos términos se rigen por las leyes de los Estados Unidos Mexicanos. Para dudas o aclaraciones escríbenos a{" "}
        <Dato v={n.correoContacto} /> o al <Dato v={n.telefono} />. Domicilio: <Dato v={n.domicilio} />.
      </p>
    </PaginaLegal>
  );
}
