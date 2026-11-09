"use client";

import { crearAlmacen } from "./almacen";
import type { ProductoTarjeta } from "./datos";

// Se guarda una copia de la tarjeta para mostrar favoritos sin consultar la base de datos.
// (Versiones anteriores guardaban solo el texto del slug: esas se descartan.)
const almacen = crearAlmacen<ProductoTarjeta[]>("xico-favoritos", []);

const validos = (lista: unknown[]) => lista.filter((x): x is ProductoTarjeta => typeof x === "object" && x !== null && "slug" in x);

export const useFavoritos = () => validos(almacen.useValor());
export const leerFavoritos = () => validos(almacen.leer());
export const suscribirFavoritos = almacen.suscribir;
export const guardarFavoritos = (lista: ProductoTarjeta[]) => almacen.escribir(lista);

export function alternarFavorito(p: ProductoTarjeta) {
  almacen.escribir((lista) => {
    const actuales = validos(lista);
    return actuales.some((x) => x.slug === p.slug) ? actuales.filter((x) => x.slug !== p.slug) : [p, ...actuales];
  });
}
