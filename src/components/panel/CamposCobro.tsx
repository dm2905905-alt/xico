"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { bancoDeClabe, clabeValida, rfcValido, soloDigitos } from "@/lib/clabe";
import type { DatosCobro } from "@/lib/panel";
import { camposDireccion, problemaDireccion, type Direccion } from "@/lib/pedidos";

export type ValoresCobro = { titular: string; clabe: string; rfc: string };

// Revisa los datos de cobro; devuelve el primer problema o null
export function problemaCobro(v: ValoresCobro): string | null {
  if (v.titular.trim().length < 5) return "Escribe el nombre completo del titular de la cuenta.";
  if (soloDigitos(v.clabe).length !== 18) return "La CLABE debe tener 18 dígitos.";
  if (!clabeValida(v.clabe)) return "La CLABE no es válida: revisa que no falte o sobre un número.";
  if (v.rfc.trim() && !rfcValido(v.rfc)) return "El RFC no tiene un formato válido (o déjalo vacío).";
  return null;
}

export const aDatosCobro = (v: ValoresCobro): DatosCobro => ({
  titular: v.titular.trim(),
  clabe: soloDigitos(v.clabe),
  banco: bancoDeClabe(v.clabe),
  ...(v.rfc.trim() ? { rfc: v.rfc.trim().toUpperCase() } : {}),
});

const campo = "h-11 w-full rounded-xl border border-arena-oscura bg-white px-3.5 text-sm outline-none focus:border-terracota focus:ring-2 focus:ring-terracota/15";

// Titular, CLABE (con verificación y banco en vivo) y RFC
export function CamposCobro({ v, cambiar }: { v: ValoresCobro; cambiar: (v: ValoresCobro) => void }) {
  const digitos = soloDigitos(v.clabe);
  const completa = digitos.length === 18;
  const valida = completa && clabeValida(digitos);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid gap-1 text-sm font-medium sm:col-span-2">
        Nombre completo del titular de la cuenta
        <input className={campo} maxLength={100} value={v.titular} onChange={(e) => cambiar({ ...v, titular: e.target.value })} placeholder="Como aparece en tu banco" autoComplete="name" />
      </label>
      <label className="grid gap-1 text-sm font-medium sm:col-span-2">
        CLABE interbancaria (18 dígitos)
        <input
          className={`${campo} font-mono tracking-wider`}
          inputMode="numeric"
          maxLength={22}
          value={v.clabe}
          onChange={(e) => cambiar({ ...v, clabe: e.target.value.replace(/[^\d ]/g, "") })}
          placeholder="012 180 01234567890 1"
        />
        <span className="flex items-center gap-1.5 text-xs font-normal">
          {!digitos.length ? (
            <span className="text-cafe">La encuentras en tu app del banco o en tu estado de cuenta. Ahí te depositaremos tus ventas.</span>
          ) : !completa ? (
            <span className="text-cafe">{digitos.length}/18 dígitos</span>
          ) : valida ? (
            <span className="flex items-center gap-1 font-semibold text-jade">
              <CheckCircle2 className="size-4" /> CLABE válida · {bancoDeClabe(digitos)}
            </span>
          ) : (
            <span className="flex items-center gap-1 font-semibold text-rosa">
              <XCircle className="size-4" /> Esta CLABE no es válida: revisa los números
            </span>
          )}
        </span>
      </label>
      <label className="grid gap-1 text-sm font-medium">
        RFC (opcional)
        <input className={`${campo} uppercase`} maxLength={13} value={v.rfc} onChange={(e) => cambiar({ ...v, rfc: e.target.value })} placeholder="XAXX010101000" />
      </label>
    </div>
  );
}

// Dirección completa con teléfono (también es la dirección de recolección de paquetes)
export function CamposDireccion({ d, cambiar }: { d: Partial<Direccion>; cambiar: (d: Partial<Direccion>) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {camposDireccion.map((c) => (
        <label key={c.clave} className={`grid gap-1 text-sm font-medium ${c.ancho ? "sm:col-span-2" : ""}`}>
          {c.clave === "nombre" ? "Nombre de contacto" : c.etiqueta}
          <input
            className={campo}
            type={c.tipo ?? "text"}
            inputMode={c.clave === "cp" || c.clave === "telefono" ? "numeric" : undefined}
            maxLength={c.max}
            value={d[c.clave] ?? ""}
            onChange={(e) => cambiar({ ...d, [c.clave]: e.target.value })}
          />
        </label>
      ))}
    </div>
  );
}

export { problemaDireccion };
