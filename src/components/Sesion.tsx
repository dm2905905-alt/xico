"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { vaciarCarrito } from "@/lib/carrito";
import { guardarFavoritos } from "@/lib/favoritos";
import { firebaseConfigurado, obtenerAuth } from "@/lib/firebase";
import { SincronizarCuenta } from "./SincronizarCuenta";

type Sesion = {
  usuario: User | null;
  cargando: boolean;
  configurado: boolean;
  salir: () => Promise<void>;
};

const Contexto = createContext<Sesion>({
  usuario: null,
  cargando: false,
  configurado: false,
  salir: async () => {},
});

export function ProveedorSesion({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<User | null>(null);
  const [cargando, setCargando] = useState(firebaseConfigurado);

  useEffect(() => {
    const auth = obtenerAuth();
    if (!auth) return;
    return onAuthStateChanged(auth, (u) => {
      setUsuario(u);
      setCargando(false);
    });
  }, []);

  const salir = async () => {
    const auth = obtenerAuth();
    if (!auth) return;
    await signOut(auth);
    // En un dispositivo compartido, al salir no se deja el carrito de esta cuenta a la vista
    // (sigue guardado en la cuenta y vuelve al entrar)
    vaciarCarrito();
    guardarFavoritos([]);
  };

  return (
    <Contexto.Provider value={{ usuario, cargando, configurado: firebaseConfigurado, salir }}>
      {usuario && <SincronizarCuenta key={usuario.uid} uid={usuario.uid} />}
      {children}
    </Contexto.Provider>
  );
}

export const useSesion = () => useContext(Contexto);
