// Equipo de XICO: además de la administración, puede haber moderadores (por ejemplo, una socia)
// que aprueban tiendas, moderan productos, videos y reseñas y crean eventos,
// pero NO ven CLABE ni direcciones, ni tocan pagos, mensualidades o configuración.
// La lista vive en config/equipo y solo la cambia la administración.
import { adminDb, esAdmin, type UsuarioVerificado } from "./admin";

export type Rol = "admin" | "moderador" | null;

export async function moderadores(): Promise<string[]> {
  const d = await adminDb().collection("config").doc("equipo").get();
  return ((d.data()?.moderadores as string[] | undefined) ?? []).map((c) => c.trim().toLowerCase());
}

export async function esModerador(usuario: UsuarioVerificado) {
  if (!usuario.email || usuario.email_verified !== true) return false;
  return (await moderadores()).includes(usuario.email.toLowerCase());
}

export async function rolDe(usuario: UsuarioVerificado): Promise<Rol> {
  if (esAdmin(usuario)) return "admin";
  return (await esModerador(usuario)) ? "moderador" : null;
}
