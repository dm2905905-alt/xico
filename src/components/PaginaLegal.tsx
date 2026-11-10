import { negocio, pendiente } from "@/lib/negocio";

// Diseño común de las páginas legales y de ayuda
export function PaginaLegal({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children: React.ReactNode }) {
  const faltan = Object.values(negocio).some((v) => typeof v === "string" && pendiente(v));
  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight">{titulo}</h1>
      {subtitulo && <p className="mt-2 text-cafe">{subtitulo}</p>}
      <p className="mt-2 text-sm text-cafe">Última actualización: {negocio.actualizado}</p>
      {faltan && (
        <p className="mt-6 rounded-2xl bg-maiz/20 p-4 text-sm">
          <strong>Borrador:</strong> faltan datos marcados como &quot;Pendiente&quot; y la revisión de un abogado antes del lanzamiento.
        </p>
      )}
      <div
        className="mt-8 grid gap-4 leading-relaxed text-tinta/90 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-tinta [&_h3]:mt-2 [&_h3]:font-semibold [&_h3]:text-tinta [&_li]:ml-5 [&_li]:list-disc [&_ul]:grid [&_ul]:gap-1.5 [&_a]:font-semibold [&_a]:text-terracota [&_a]:underline"
      >
        {children}
      </div>
    </article>
  );
}

// Muestra un dato del negocio; si falta, lo resalta
export function Dato({ v }: { v: string }) {
  return pendiente(v) ? <mark className="rounded bg-maiz/40 px-1">{v}</mark> : <>{v}</>;
}
