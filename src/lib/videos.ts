// Videos de "Descubre": tipos y utilidades que sirven en el servidor y en el navegador

export type Video = {
  id: string;
  creador: string; // slug de la tienda
  creadorUid: string;
  taller: string;
  producto: string; // slug del producto que aparece en el video
  titulo: string;
  creado: number;
  oculto?: boolean;
} & (
  | { tipo: "archivo"; url: string; ruta: string; portada?: string }
  | { tipo: "youtube"; youtubeId: string }
);

export const MAX_SEGUNDOS = 60;
export const MAX_MB_VIDEO = 60;

// Saca el id de un enlace de YouTube: shorts, watch?v=, youtu.be, embed
export function youtubeIdDe(enlace: string): string | null {
  const t = enlace.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(t)) return t;
  try {
    const u = new URL(t.startsWith("http") ? t : `https://${t}`);
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      id = u.searchParams.get("v") ?? u.pathname.match(/^\/(shorts|embed|live)\/([^/?]+)/)?.[2] ?? null;
    }
    return id && /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export const portadaYoutube = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
export const portadaDe = (v: Video) => (v.tipo === "youtube" ? portadaYoutube(v.youtubeId) : v.portada);
