// Fondo decorativo fijo detrás de todo el contenido: manchas de color, garabatos y emojis flotando.
// Es solo decoración (aria-hidden) y no recibe clics.

const emojis: { e: string; x: string; y: string; tam: number; giro: number; dur: number; soloGrande?: boolean }[] = [
  { e: "🎨", x: "4%", y: "18%", tam: 44, giro: -12, dur: 9 },
  { e: "✂️", x: "92%", y: "14%", tam: 38, giro: 18, dur: 11 },
  { e: "🧶", x: "88%", y: "46%", tam: 46, giro: -8, dur: 10, soloGrande: true },
  { e: "🌸", x: "6%", y: "58%", tam: 40, giro: 10, dur: 12 },
  { e: "🎁", x: "48%", y: "88%", tam: 42, giro: -6, dur: 9, soloGrande: true },
  { e: "✨", x: "30%", y: "8%", tam: 30, giro: 0, dur: 8, soloGrande: true },
  { e: "🖌️", x: "95%", y: "78%", tam: 40, giro: 22, dur: 13 },
  { e: "💍", x: "16%", y: "86%", tam: 34, giro: -14, dur: 10, soloGrande: true },
  { e: "🕯️", x: "70%", y: "6%", tam: 34, giro: 8, dur: 11, soloGrande: true },
  { e: "🧵", x: "2%", y: "36%", tam: 32, giro: 16, dur: 12, soloGrande: true },
  { e: "💜", x: "78%", y: "92%", tam: 30, giro: -10, dur: 9 },
  { e: "🌈", x: "60%", y: "52%", tam: 36, giro: 4, dur: 14, soloGrande: true },
];

export function FondoCreativo() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {/* Manchas de color tipo acuarela */}
      <div className="absolute -top-32 -left-24 size-[28rem] rounded-full bg-rosa/15 blur-3xl" />
      <div className="absolute top-1/3 -right-32 size-[30rem] rounded-full bg-terracota/15 blur-3xl" />
      <div className="absolute -bottom-40 left-1/4 size-[26rem] rounded-full bg-maiz/20 blur-3xl" />

      {/* Garabatos repetidos */}
      <div className="fondo-garabatos absolute inset-0 opacity-[0.22]" />

      {/* Emojis flotando */}
      {emojis.map((m) => (
        <span
          key={m.e}
          className={`flotante absolute opacity-25 select-none ${m.soloGrande ? "hidden md:block" : ""}`}
          style={
            {
              left: m.x,
              top: m.y,
              fontSize: m.tam,
              "--giro": `${m.giro}deg`,
              "--duracion": `${m.dur}s`,
            } as React.CSSProperties
          }
        >
          {m.e}
        </span>
      ))}
    </div>
  );
}
