import { ImageResponse } from "next/og";

// Imagen que aparece al compartir XICO en WhatsApp, Facebook, etc.
export const alt = "XICO · Hecho a mano en México";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Imagen() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          background: "#fbf6ef",
          color: "#2b1d14",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "#c4511f",
              color: "#fbf6ef",
              fontSize: 64,
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            X
          </div>
          <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: -2 }}>XICO</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, display: "flex", flexWrap: "wrap" }}>
            Lo hecho a mano en México,&nbsp;<span style={{ color: "#c4511f" }}>directo de quien lo crea</span>
          </div>
          <div style={{ fontSize: 32, color: "#6f5442" }}>Fundas, ropa, cuadros, joyería, velas y regalos personalizados</div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {["#d6246e", "#c4511f", "#e9a824", "#2f7d6b", "#1e3a8a"].map((c) => (
            <div key={c} style={{ width: 180, height: 14, borderRadius: 7, background: c }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
