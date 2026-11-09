const pesos = new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
});

export const precio = (n: number) => pesos.format(n);

export const descuento = (precio: number, antes?: number) =>
  antes ? Math.round((1 - precio / antes) * 100) : 0;
