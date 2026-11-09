// Asistente de IA para creadores (Gemini). Solo en el servidor: la clave nunca llega al navegador.
import { categorias, estadoPorSlug, type Creador } from "../datos";
import { ErrorXico } from "./admin";

const API = "https://generativelanguage.googleapis.com/v1beta/models";
const modelo = () => process.env.GEMINI_MODELO || "gemini-3.5-flash";

export type PropuestaIA = {
  nombre: string;
  descripcion: string;
  materiales: string;
  categoria: string;
  precioSugerido: number;
  precioMin: number;
  precioMax: number;
  razonPrecio: string;
};

const esquema = {
  type: "OBJECT",
  properties: {
    nombre: { type: "STRING", description: "Título atractivo y claro, máximo 70 caracteres" },
    descripcion: { type: "STRING", description: "2 a 4 frases cálidas: qué es, cómo se hace a mano, medidas o cuidados si se conocen" },
    materiales: { type: "STRING", description: "Materiales separados por coma" },
    categoria: { type: "STRING", enum: categorias.map((c) => c.slug) },
    precioSugerido: { type: "INTEGER", description: "Precio de venta sugerido en pesos mexicanos" },
    precioMin: { type: "INTEGER" },
    precioMax: { type: "INTEGER" },
    razonPrecio: { type: "STRING", description: "Una frase explicando el precio" },
  },
  required: ["nombre", "descripcion", "materiales", "categoria", "precioSugerido", "precioMin", "precioMax", "razonPrecio"],
};

export async function proponerProducto(idea: string, tienda: Creador | undefined): Promise<PropuestaIA> {
  const clave = process.env.GEMINI_API_KEY;
  if (!clave) throw new ErrorXico("La IA no está configurada en el servidor.", 500);

  const texto = idea.trim().slice(0, 800);
  if (texto.length < 8) throw new ErrorXico("Cuéntale a la IA un poco más de tu producto (al menos una frase).");

  const contexto = tienda
    ? `El creador es "${tienda.taller}" de ${estadoPorSlug(tienda.estado)?.nombre ?? "México"}${tienda.especialidad ? `, especialidad: ${tienda.especialidad}` : ""}.`
    : "";

  const instrucciones = `Eres el asistente de XICO, un marketplace de productos hechos a mano por artesanos y creadores mexicanos.
Ayudas a un creador a publicar su producto. Escribe en español de México, cálido y honesto, sin exagerar ni inventar datos
(no inventes medidas, materiales ni certificaciones que el creador no mencionó). No uses emojis ni mayúsculas sostenidas.
Sugiere un precio justo en pesos mexicanos para un producto artesanal vendido en línea en México en 2026, considerando
el trabajo a mano; da un rango razonable. ${contexto}`;

  const r = await fetch(`${API}/${modelo()}:generateContent`, {
    method: "POST",
    headers: { "x-goog-api-key": clave, "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: instrucciones }] },
      contents: [{ role: "user", parts: [{ text: `Lo que el creador cuenta de su producto:\n"""${texto}"""` }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: esquema, temperature: 0.7 },
    }),
    signal: AbortSignal.timeout(30000),
    cache: "no-store",
  }).catch(() => null);

  if (!r) throw new ErrorXico("La IA tardó demasiado. Inténtalo de nuevo.", 504);
  const cuerpo = await r.json().catch(() => ({}));
  if (!r.ok) {
    console.error("[XICO] Gemini respondió", r.status, cuerpo?.error?.message);
    throw new ErrorXico(r.status === 429 ? "La IA está muy ocupada. Espera un minuto e inténtalo de nuevo." : "La IA no pudo responder. Inténtalo de nuevo.", 502);
  }

  try {
    const salida = cuerpo.candidates[0].content.parts.map((p: { text?: string }) => p.text ?? "").join("");
    const p = JSON.parse(salida) as PropuestaIA;
    // Límites razonables por si la IA se equivoca
    const precio = (n: number) => Math.min(200000, Math.max(1, Math.round(Number(n) || 0)));
    return {
      nombre: String(p.nombre).slice(0, 120),
      descripcion: String(p.descripcion).slice(0, 2000),
      materiales: String(p.materiales).slice(0, 150),
      categoria: categorias.some((c) => c.slug === p.categoria) ? p.categoria : "regalos",
      precioSugerido: precio(p.precioSugerido),
      precioMin: precio(p.precioMin),
      precioMax: precio(p.precioMax),
      razonPrecio: String(p.razonPrecio).slice(0, 200),
    };
  } catch {
    throw new ErrorXico("La IA respondió algo que no entendimos. Inténtalo de nuevo.", 502);
  }
}
