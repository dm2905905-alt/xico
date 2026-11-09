// Reduce una foto del celular (que puede pesar varios MB) a una imagen ligera
// para guardarla con el pedido. En la Fase 4 se subirá a Firebase Storage.
export async function comprimirImagen(archivo: File, ladoMax = 800, calidad = 0.8): Promise<string> {
  const bitmap = await createImageBitmap(archivo);
  const escala = Math.min(1, ladoMax / Math.max(bitmap.width, bitmap.height));
  const lienzo = document.createElement("canvas");
  lienzo.width = Math.round(bitmap.width * escala);
  lienzo.height = Math.round(bitmap.height * escala);
  lienzo.getContext("2d")!.drawImage(bitmap, 0, 0, lienzo.width, lienzo.height);
  bitmap.close();
  return lienzo.toDataURL("image/jpeg", calidad);
}
