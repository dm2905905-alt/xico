import type { Metadata } from "next";
import Link from "next/link";
import { PaginaLegal } from "@/components/PaginaLegal";
import { comoEmpacar, fuenteReglasEnvio, prohibidos, responsabilidad, restringidos } from "@/lib/reglas-envio";

export const metadata: Metadata = {
  title: "Reglas de envío y empaque",
  description: "Qué no se puede enviar, qué se envía sin seguro y cómo empacar bien tus productos en XICO.",
};

export default function ReglasEnvio() {
  return (
    <PaginaLegal titulo="Reglas de envío y empaque" subtitulo="Para vendedores: qué no se puede enviar y cómo empacar para que todo llegue bien.">
      <p className="rounded-2xl bg-maiz/20 p-4">
        <strong>Lo más importante:</strong> empaca como si el paquete fuera a caerse. Las paqueterías mueven miles de cajas al día y un mal
        empaque es la causa número uno de piezas rotas. <strong>Si algo llega dañado por mal empaque, el reembolso al cliente se descuenta de tu pago.</strong>
      </p>

      <h2>🚫 Lo que no se puede enviar</h2>
      <p>Las paqueterías no aceptan estos artículos, así que tampoco se pueden vender en XICO:</p>
      <ul>
        {prohibidos.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>

      <h2>⚠️ Se envían, pero sin seguro</h2>
      <p>Puedes venderlos, pero si se dañan en el camino la paquetería no paga. Empácalos con mucho cuidado:</p>
      <ul>
        {restringidos.map((x) => (
          <li key={x.que}>
            <strong>{x.que}:</strong> {x.nota}.
          </li>
        ))}
      </ul>

      <h2>📦 Cómo empacar bien</h2>
      <ul>
        {comoEmpacar.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>

      <h2>🤝 Quién responde si algo sale mal</h2>
      <ul>
        {responsabilidad.map((x) => (
          <li key={x}>{x}</li>
        ))}
      </ul>
      <p>
        Si el daño fue culpa de la paquetería y el paquete estaba bien empacado, en XICO te ayudamos con la aclaración. Más detalles en los{" "}
        <Link href="/terminos">Términos y condiciones</Link>.
      </p>
      <p className="text-sm text-cafe">
        Lista basada en las reglas de nuestra paquetería (<a href={fuenteReglasEnvio} target="_blank" rel="noopener noreferrer">Envia.com</a>); pueden cambiar según la paquetería.
      </p>
    </PaginaLegal>
  );
}
