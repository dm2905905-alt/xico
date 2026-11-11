// Reduce una foto del celular (que puede pesar varios MB) a una imagen ligera.
export async function comprimirImagen(archivo: File, ladoMax = 800, calidad = 0.8): Promise<string> {
  const lienzo = await dibujar(archivo, ladoMax);
  return lienzo.toDataURL("image/jpeg", calidad);
}

// Igual, pero devuelve un archivo listo para subir
export async function comprimirABlob(archivo: File, ladoMax: number, calidad = 0.85): Promise<Blob> {
  const lienzo = await dibujar(archivo, ladoMax);
  return new Promise((ok, mal) => lienzo.toBlob((b) => (b ? ok(b) : mal(new Error("No se pudo procesar la imagen"))), "image/jpeg", calidad));
}

async function dibujar(archivo: File, ladoMax: number) {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, ladoMax / Math.max(bitmap.width, bitmap.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(bitmap.width * escala);
  lienzo.height = Math.round(bitmap.height * escala);
  const ctx = lienzo.getContext("2d")!;
  ctx.fillStyle = "#ffffff"; // fondo blanco para PNG con transparencia
  ctx.fillRect(0, 0, lienzo.width, lienzo.height);
  ctx.drawImage(bitmap, 0, 0, lienzo.width, lienzo.height);
  bitmap.close();
  return lienzo;
}
