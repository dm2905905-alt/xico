// Fondo decorativo fijo detrás de todo: el dibujo de XICO, completo y a todo color.
// Es solo decoración (aria-hidden) y no recibe clics.
export function FondoCreativo() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/fondos/libreta-1.webp')] bg-[length:640px] bg-repeat md:bg-[length:820px]" />
    </div>
  );
}
