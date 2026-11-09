// Esqueleto que se muestra al instante mientras carga una página
export function CargandoPagina() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-4 py-8" aria-busy aria-label="Cargando">
      <div className="mb-6 h-4 w-48 rounded bg-arena" />
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="aspect-square rounded-3xl bg-arena" />
        <div className="grid content-start gap-4">
          <div className="h-10 w-3/4 rounded-lg bg-arena" />
          <div className="h-5 w-1/3 rounded bg-arena" />
          <div className="h-8 w-28 rounded bg-arena" />
          <div className="h-24 rounded-xl bg-arena" />
          <div className="h-48 rounded-2xl bg-arena" />
        </div>
      </div>
    </div>
  );
}
