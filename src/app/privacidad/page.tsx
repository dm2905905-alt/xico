import type { Metadata } from "next";
import Link from "next/link";
import { Dato, PaginaLegal } from "@/components/PaginaLegal";
import { negocio } from "@/lib/negocio";

export const metadata: Metadata = {
  title: "Aviso de privacidad",
  description: "Cómo XICO trata tus datos personales y cómo ejercer tus derechos ARCO.",
};

// BORRADOR basado en la legislación mexicana de protección de datos personales en posesión de particulares.
// Debe revisarlo un abogado antes del lanzamiento.
export default function Privacidad() {
  const n = negocio;
  return (
    <PaginaLegal titulo="Aviso de privacidad integral" subtitulo="Tus datos son tuyos. Aquí te explicamos qué datos usamos, para qué y cómo puedes controlarlos.">
      <h2>1. Quién es responsable de tus datos</h2>
      <p>
        <Dato v={n.responsable} /> (en adelante, &quot;{n.marca}&quot;), con domicilio en <Dato v={n.domicilio} />, es responsable del
        uso y protección de tus datos personales, de acuerdo con la legislación mexicana aplicable en materia de protección de datos
        personales en posesión de los particulares.
      </p>
      <p>
        Para cualquier tema de privacidad escríbenos a <Dato v={n.correoPrivacidad} />.
      </p>

      <h2>2. Qué datos personales usamos</h2>
      <h3>Si compras en {n.marca}</h3>
      <ul>
        <li>Datos de identificación y contacto: nombre, correo electrónico y, si lo usas para entrar, número de celular.</li>
        <li>Datos de envío: nombre de quien recibe, teléfono y domicilio de entrega.</li>
        <li>Información de tus pedidos: productos, personalizaciones (textos, colores) y fotos de referencia que decidas compartir.</li>
        <li>Tu carrito y tus favoritos.</li>
      </ul>
      <h3>Si vendes en {n.marca} (creadores)</h3>
      <ul>
        <li>Nombre, nombre de tu taller o marca, estado y ciudad, y la historia que decidas publicar.</li>
        <li>Domicilio de recolección de paquetes (no se publica).</li>
        <li>Datos para pagarte lo que te corresponde (por ejemplo, tu CLABE interbancaria) cuando los solicitemos.</li>
      </ul>
      <h3>Datos que no recabamos</h3>
      <p>
        {n.marca} <strong>no recibe ni guarda los datos de tu tarjeta</strong>. Los pagos los procesa Mercado Pago en su propia
        plataforma. Tampoco solicitamos datos personales sensibles.
      </p>

      <h2>3. Para qué usamos tus datos</h2>
      <h3>Finalidades necesarias (sin ellas no podemos darte el servicio)</h3>
      <ul>
        <li>Crear y administrar tu cuenta.</li>
        <li>Procesar tus compras, cobrar a través de Mercado Pago y darte seguimiento.</li>
        <li>Compartir con el creador los datos necesarios para elaborar y enviar tu pedido.</li>
        <li>Generar guías de envío con paqueterías y darte el número de rastreo.</li>
        <li>Atender aclaraciones, devoluciones y reembolsos de la Compra protegida.</li>
        <li>Pagar a los creadores lo que les corresponde por sus ventas.</li>
        <li>Prevenir fraudes, reventa y usos indebidos de la plataforma, y cumplir obligaciones legales.</li>
      </ul>
      <h3>Finalidades adicionales (puedes negarte)</h3>
      <ul>
        <li>Enviarte novedades, promociones y recomendaciones de productos.</li>
        <li>Hacer encuestas de satisfacción y estadísticas para mejorar {n.marca}.</li>
      </ul>
      <p>
        Si no quieres que usemos tus datos para las finalidades adicionales, escríbenos a <Dato v={n.correoPrivacidad} />. Negarte no
        afecta tus compras ni tu cuenta.
      </p>

      <h2>4. Con quién compartimos tus datos</h2>
      <p>Solo compartimos lo necesario para darte el servicio:</p>
      <ul>
        <li><strong>Creadores</strong> a quienes les compras: nombre, domicilio y teléfono de entrega, y la personalización de tu pedido.</li>
        <li><strong>Mercado Pago</strong>: para procesar tu pago.</li>
        <li><strong>Paqueterías y plataformas de envío</strong>: para entregar tu pedido.</li>
        <li>
          <strong>Proveedores de tecnología</strong> que guardan la información por cuenta nuestra (por ejemplo, Google Firebase para la
          base de datos y el inicio de sesión, y el servicio de alojamiento del sitio).
        </li>
        <li><strong>Autoridades</strong>, cuando la ley nos lo exija.</li>
      </ul>
      <p>
        Algunos de estos proveedores pueden guardar información fuera de México. No vendemos tus datos personales a nadie.
      </p>

      <h2>5. Tus derechos ARCO</h2>
      <p>
        Tienes derecho a <strong>Acceder</strong> a tus datos, <strong>Rectificarlos</strong> si son incorrectos,
        <strong> Cancelarlos</strong> cuando consideres que no se requieren y <strong>Oponerte</strong> a su uso para fines
        específicos. También puedes <strong>revocar tu consentimiento</strong> y limitar el uso o divulgación de tus datos.
      </p>
      <p>Para ejercerlos, envía un correo a <Dato v={n.correoPrivacidad} /> con:</p>
      <ul>
        <li>Tu nombre y el correo de tu cuenta.</li>
        <li>Una identificación oficial (o la de tu representante legal y el documento que lo acredite).</li>
        <li>Qué derecho quieres ejercer y sobre qué datos.</li>
      </ul>
      <p>
        Te responderemos en un plazo máximo de 20 días hábiles y, si procede, haremos el cambio dentro de los 15 días hábiles
        siguientes. Algunos datos debemos conservarlos por obligaciones legales o fiscales (por ejemplo, el registro de una venta).
      </p>

      <h2>6. Información que se guarda en tu dispositivo</h2>
      <p>
        {n.marca} guarda en tu navegador tu carrito, tus favoritos y tu última dirección de envío para que no tengas que escribirlos de
        nuevo, y mantiene tu sesión iniciada. No usamos cookies de publicidad de terceros. Puedes borrar esta información desde la
        configuración de tu navegador.
      </p>

      <h2>7. Cambios a este aviso</h2>
      <p>
        Si cambiamos este aviso, publicaremos la nueva versión en esta página con su fecha de actualización y, si el cambio es
        importante, te avisaremos por correo o dentro de {n.marca}.
      </p>

      <h2>8. ¿Dudas o una queja?</h2>
      <p>
        Escríbenos a <Dato v={n.correoPrivacidad} />. Si consideras que tu derecho a la protección de datos fue vulnerado, puedes acudir
        ante la autoridad competente en materia de protección de datos personales.
      </p>
      <p>
        Consulta también nuestros <Link href="/terminos">Términos y condiciones</Link>.
      </p>
    </PaginaLegal>
  );
}
