import { ImageResponse } from "next/og";

// Imagen que aparece al compartir XICO en WhatsApp, Facebook, etc.
export const alt = "XICO · Cosas únicas hechas a mano en México";
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
          backgroundImage: "linear-gradient(120deg, #ff2d87 0%, #d63af0 45%, #7c2df0 100%)",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 24,
              background: "#ffffff",
              color: "#7c2df0",
              fontSize: 64,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transform: "rotate(-6deg)",
            }}
          >
            X
          </div>
          <div style={{ fontSize: 76, fontWeight: 800, letterSpacing: -2 }}>XICO</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 78, fontWeight: 800, lineHeight: 1.02, letterSpacing: -2, display: "flex", flexWrap: "wrap" }}>
            Cosas únicas, hechas a mano por&nbsp;<span style={{ color: "#ffc634" }}>gente creativa</span>
          </div>
          <div style={{ fontSize: 32, color: "rgba(255,255,255,0.9)" }}>Fundas, ropa, arte, joyería, velas y regalos personalizados</div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          {["#ffffff", "#ffc634", "#ff2d87", "#0fb5a6", "#1d0b36"].map((c) => (
            <div key={c} style={{ width: 180, height: 14, borderRadius: 7, background: c }} />
          ))}
        </div>
      </div>
    ),
    size,
  );
}
