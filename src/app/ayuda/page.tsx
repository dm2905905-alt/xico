import type { Metadata } from "next";
import Link from "next/link";
import { Dato, PaginaLegal } from "@/components/PaginaLegal";
import { negocio } from "@/lib/negocio";

export const metadata: Metadata = {
  title: "Centro de ayuda",
  description: "Preguntas frecuentes sobre compras, pagos, envíos, devoluciones y cómo vender en XICO.",
};

type Pregunta = { p: string; r: React.ReactNode };

// Preguntas que se abren y cierran al tocarlas
function Lista({ preguntas }: { preguntas: Pregunta[] }) {
  return (
    <div className="grid gap-2">
      {preguntas.map((x) => (
        <details key={x.p} className="group rounded-2xl bg-white p-4 ring-1 ring-arena-oscura/60 open:ring-terracota/40">
          <summary className="cursor-pointer list-none font-semibold marker:hidden">
            <span className="mr-2 inline-block text-terracota transition group-open:rotate-90">›</span>
            {x.p}
          </summary>
          <p className="mt-2 pl-5 text-tinta/85">{x.r}</p>
        </details>
      ))}
    </div>
  );
}

export default function Ayuda() {
  const n = negocio;
  const compradores: Pregunta[] = [
    { p: "¿Necesito cuenta para comprar?", r: "Puedes explorar, guardar favoritos y armar tu carrito sin cuenta. Solo al pagar te pedimos entrar con Google o tu celular, para darte seguimiento." },
    { p: "¿Cómo personalizo mi producto?", r: "En la página del producto llena el recuadro “Personaliza tu pieza”: nombres, colores, foto de referencia o extras. El precio se actualiza solo." },
    { p: "¿Cómo puedo pagar?", r: "Con Mercado Pago: tarjeta de crédito o débito, OXXO, saldo de Mercado Pago y otros medios. XICO nunca ve los datos de tu tarjeta." },
    { p: "Pagué en OXXO, ¿cuándo se confirma?", r: "Cuando Mercado Pago recibe el pago. Puedes revisar el estado en Mi cuenta → Mis pedidos." },
    { p: "¿Por qué me llegan varios paquetes?", r: "Cada creador hace y envía sus piezas desde su taller. Si compraste a varios, recibirás un paquete de cada uno." },
    { p: "¿Cómo rastreo mi pedido?", r: "En Mi cuenta → Mis pedidos, abre tu pedido. Cuando el creador lo envíe verás la paquetería, el número de guía y el botón “Rastrear paquete”." },
    { p: "¿Cuánto tarda?", r: "El tiempo de elaboración (lo dice cada producto) más el envío, normalmente de 2 a 7 días hábiles según tu zona." },
    {
      p: "Mi pedido llegó mal o no llegó",
      r: (
        <>
          Tienes Compra protegida. Escríbenos dentro de los {n.diasParaReportar} días siguientes a <Dato v={n.correoContacto} /> con tu
          número de pedido y fotos. Si procede, te devolvemos tu dinero o te enviamos un reemplazo. Detalles en los{" "}
          <Link href="/terminos">Términos</Link>.
        </>
      ),
    },
  ];

  const creadores: Pregunta[] = [
    { p: "¿Quién puede vender?", r: "Cualquier persona que haga sus productos a mano o los personalice ella misma. No se permite revender productos importados ni hechos por otros." },
    { p: "¿Cuánto cuesta vender?", r: `Abrir tu tienda es gratis. ${n.marca} cobra ${n.comision} de comisión solo cuando vendes.` },
    { p: "¿Cómo abro mi tienda?", r: "Entra a Vende en XICO y llena la solicitud: los datos de tu tienda, tu CLABE para cobrar y tu dirección. La revisamos y, al aprobarla, tus productos aparecen en XICO." },
    { p: "¿Cómo subo un producto?", r: "Entra a Mi tienda → Nuevo producto. Puedes usar el asistente con IA: le cuentas tu producto y te propone título, descripción y un precio justo." },
    { p: "¿Cómo y cuándo me pagan?", r: "Recibes el precio de tus productos menos la comisión, más el envío cobrado por tu paquete. Cada semana te transferimos a tu CLABE lo de tus pedidos ya entregados. Puedes cambiar tu cuenta en Mi tienda → Cobros." },
    { p: "¿Cómo envío un pedido?", r: "En Mi tienda → Pedidos abre el pedido, empaca con cuidado, envíalo y registra la paquetería y el número de guía. El cliente podrá rastrearlo." },
    { p: "¿Cómo obtengo la insignia de Artista verificado?", r: `El equipo de ${n.marca} revisa tu tienda y tu trabajo. Completa tu perfil e historia y sube productos con buenas descripciones.` },
  ];

  return (
    <PaginaLegal titulo="Centro de ayuda" subtitulo="Respuestas rápidas a las dudas más comunes.">
      <h2>Para compradores</h2>
      <Lista preguntas={compradores} />
      <h2>Para creadores</h2>
      <Lista preguntas={creadores} />
      <h2>¿No encontraste tu respuesta?</h2>
      <p>
        Escríbenos a <Dato v={n.correoContacto} /> o por <Dato v={n.telefono} />. Te respondemos lo antes posible.
      </p>
      <p>
        <a href={`https://wa.me/${n.whatsapp}`} target="_blank" rel="noopener noreferrer">
          Escribir por WhatsApp →
        </a>
      </p>
    </PaginaLegal>
  );
}
