// Detecta y oculta datos de contacto en los mensajes (teléfonos, correos, links y redes sociales).
// Así las ventas se quedan dentro de XICO, con Compra protegida y la comisión de la plataforma.

export const OCULTO = "[dato oculto]";

const numerosEnLetra = ["cero", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez"];

// El orden importa: primero correos, luego links (ambos pueden contener números) y después teléfonos
const patrones: { nombre: string; re: RegExp }[] = [
  // Correos, incluso escritos como "juan arroba gmail punto com"
  { nombre: "correo", re: /[\w.+-]+\s*(?:@|\(at\)|\barroba\b)\s*[\w-]+(?:\s*(?:\.|\bpunto\b)\s*[a-z]{2,})+/gi },
  // Links y acortadores
  { nombre: "enlace", re: /\bwa\.me\/?\S*|\b(?:https?:\/\/|www\.)\S+|\b[\w-]+\.(?:com|mx|net|org|me|ly|link|io|app|shop|store)\b(?:\/\S*)?/gi },
  // 7 o más dígitos aunque vengan separados por espacios, puntos, guiones o paréntesis: 55 12 34 56 78
  { nombre: "teléfono", re: /\+?\(?\d(?:[\s().\-_/]{0,3}\d){6,}\)?/g },
  // Redes sociales y mensajería (y el usuario que se escriba justo después: "tiktok: funditasmx")
  {
    nombre: "red social",
    re: /\b(?:whats?app|whats|wasap|wats|wpp|wsp|telegram|telegrama|signal|insta(?:gram)?|ig|face(?:book)?|fb|tik\s*tok|snap(?:chat)?|twitter|messenger|linkedin|pinterest)\b(?:\s*[:=]\s*[\w.]+)?/gi,
  },
  // Usuarios tipo @nombre
  { nombre: "usuario", re: /(?:^|\s)@[\w.]{3,}/g },
  // Números escritos con letra seguidos: "cinco cinco uno dos tres cuatro"
  { nombre: "teléfono", re: new RegExp(`(?:\\b(?:${numerosEnLetra.join("|")})\\b[\\s,.-]*){5,}`, "gi") },
];

export type ResultadoContacto = { limpio: string; encontrados: string[] };

// Reemplaza los datos de contacto por "[dato oculto]"
export function ocultarContacto(texto: string): ResultadoContacto {
  let limpio = texto;
  const encontrados = new Set<string>();
  for (const { nombre, re } of patrones) {
    limpio = limpio.replace(re, (m) => {
      encontrados.add(nombre);
      return (m.startsWith(" ") ? " " : "") + OCULTO;
    });
  }
  return { limpio, encontrados: [...encontrados] };
}
