// CLABE interbancaria (México): 18 dígitos = banco (3) + plaza (3) + cuenta (11) + dígito verificador (1)

// Bancos más comunes por sus primeros 3 dígitos
const bancos: Record<string, string> = {
  "002": "Banamex",
  "012": "BBVA México",
  "014": "Santander",
  "021": "HSBC",
  "030": "BanBajío",
  "036": "Inbursa",
  "044": "Scotiabank",
  "058": "Banregio",
  "062": "Afirme",
  "072": "Banorte",
  "127": "Banco Azteca",
  "137": "BanCoppel",
  "166": "Banco del Bienestar",
  "638": "Nu México",
  "646": "STP",
  "722": "Mercado Pago",
};

export const soloDigitos = (t: string) => t.replace(/\D/g, "");

// Dígito verificador: pesos 3, 7, 1 repetidos sobre los primeros 17 dígitos
export function clabeValida(clabe: string): boolean {
  const d = soloDigitos(clabe);
  if (d.length !== 18) return false;
  const pesos = [3, 7, 1];
  const suma = [...d.slice(0, 17)].reduce((s, n, i) => s + ((Number(n) * pesos[i % 3]) % 10), 0);
  return (10 - (suma % 10)) % 10 === Number(d[17]);
}

export const bancoDeClabe = (clabe: string) => {
  const codigo = soloDigitos(clabe).slice(0, 3);
  return codigo.length === 3 ? (bancos[codigo] ?? `Banco (código ${codigo})`) : "";
};

// Para mostrarla sin exponerla completa: •••• •••• •••• 1234
export const clabeOculta = (clabe: string) => `•••• •••• •••• ${soloDigitos(clabe).slice(-4)}`;

// Formato legible: 012 180 01234567890 1
export const clabeLegible = (clabe: string) => {
  const d = soloDigitos(clabe);
  return d.length === 18 ? `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 17)} ${d.slice(17)}` : d;
};

// RFC de persona física (13) o moral (12), opcional
export const rfcValido = (rfc: string) => /^[A-ZÑ&]{3,4}\d{6}[A-Z\d]{3}$/.test(rfc.trim().toUpperCase());
