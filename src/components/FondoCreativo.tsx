// Fondo decorativo fijo detrás de todo: el dibujo de XICO (muy deslavado, como visto a través del papel)
// y el margen rojo de una libreta. Es solo decoración (aria-hidden) y no recibe clics.
export function FondoCreativo() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* El dibujo, como si se transparentara a través de la hoja */}
      <div className="absolute inset-0 bg-[url('/fondos/libreta-1.webp')] bg-[length:720px] bg-repeat opacity-[0.16] md:bg-[length:900px]" />
      {/* Papel encima, más opaco al centro para que el texto se lea bien */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgb(253_246_232/0.82)_0%,rgb(253_246_232/0.55)_70%,rgb(253_246_232/0.35)_100%)]" />
      {/* Renglones de libreta */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_31px,rgb(37_71_166/0.10)_31px,rgb(37_71_166/0.10)_32px)]" />
      {/* Margen rojo (solo en pantallas grandes) */}
      <div className="absolute inset-y-0 left-10 hidden w-[2px] bg-rosa/30 lg:block" />
      <div className="absolute inset-y-0 left-11 hidden w-px bg-rosa/20 lg:block" />
    </div>
  );
}
