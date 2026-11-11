"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FeatureCollection, MultiPolygon } from "geojson";
import { geoConicConformal, geoPath } from "d3-geo";
import { select } from "d3-selection";
import "d3-transition";
import { zoom, zoomIdentity, zoomTransform, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import { Maximize2, Minus, Plus } from "lucide-react";
import geoData from "@/data/mexico-estados.json";
import { estadoPorSlug, estados, type Estado } from "@/lib/datos";
import { ubicarCreador, type CreadorMapa } from "@/lib/mapa";
import { PanelMapa, type Seleccion } from "./PanelMapa";

const ANCHO = 1000;
const ALTO = 680;

// Proyección cónica: así se dibuja México "derechito", como en los mapas escolares
const geo = geoData as FeatureCollection<MultiPolygon, { codigo: string; nombre: string }>;
const proyeccion = geoConicConformal().parallels([17.5, 29.5]).rotate([102, 0]).fitExtent(
  [
    [24, 24],
    [ANCHO - 24, ALTO - 24],
  ],
  geo,
);
const camino = geoPath(proyeccion);
const punto = (lat: number, lon: number) => proyeccion([lon, lat]) ?? [0, 0];

const claseControl =
  "grid size-11 place-items-center rounded-full bg-white text-terracota shadow-md transition hover:scale-105 hover:bg-terracota hover:text-white";

const porCodigo = new Map(estados.map((e) => [e.codigo, e]));
const formas = geo.features
  .map((f) => ({ estado: porCodigo.get(f.properties.codigo)!, d: camino(f) ?? "", limites: camino.bounds(f) }))
  .filter((f) => f.estado);

export function MapaMexico({ creadores }: { creadores: CreadorMapa[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [t, setT] = useState<ZoomTransform>(zoomIdentity);
  const [seleccion, setSeleccion] = useState<Seleccion>({ tipo: "mexico" });
  const [encima, setEncima] = useState<Estado | null>(null);
  // Aviso breve (por ejemplo, cómo acercar con la rueda)
  const [aviso, setAviso] = useState("");
  const reloj = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const avisar = useCallback((texto: string) => {
    setAviso(texto);
    clearTimeout(reloj.current);
    reloj.current = setTimeout(() => setAviso(""), 1600);
  }, []);

  // Cuántas unidades del dibujo mide un pixel de pantalla (para que letras y pines tengan tamaño legible)
  const [escala, setEscala] = useState(1.6);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const medir = () => {
      const r = svg.getBoundingClientRect();
      // El dibujo se ajusta al lado más chico (preserveAspectRatio por defecto)
      if (r.width && r.height) setEscala(Math.max(ANCHO / r.width, ALTO / r.height));
    };
    medir();
    const obs = new ResizeObserver(medir);
    obs.observe(svg);
    return () => obs.disconnect();
  }, []);

  // Vendedores ubicados en el mapa
  const marcadores = useMemo(
    () =>
      creadores
        .map((c) => {
          const u = ubicarCreador(c);
          return u ? { creador: c, xy: punto(u.lat, u.lon) } : null;
        })
        .filter((m): m is { creador: CreadorMapa; xy: [number, number] } => !!m),
    [creadores],
  );
  const cuantos = useMemo(() => {
    const m = new Map<string, number>();
    creadores.forEach((c) => m.set(c.estado, (m.get(c.estado) ?? 0) + 1));
    return m;
  }, [creadores]);

  // Acercar/alejar con rueda, dos dedos o arrastrando
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const z = zoom<SVGSVGElement, unknown>()
      .scaleExtent([1, 14])
      .translateExtent([
        [-100, -100],
        [ANCHO + 100, ALTO + 100],
      ])
      // Como Google Maps: la rueda sola hace scroll de la página (acercar = Ctrl + rueda),
      // y en celular un dedo hace scroll (mover/acercar = dos dedos, o un dedo ya acercado)
      .filter((e: Event) => {
        if (e.type === "wheel") {
          const w = e as WheelEvent;
          if (w.ctrlKey || w.metaKey) return true;
          avisar("Mantén Ctrl y usa la rueda para acercar el mapa");
          return false;
        }
        if (e.type === "touchstart") {
          const tocar = e as TouchEvent;
          if (tocar.touches.length > 1 || zoomTransform(svg).k > 1.01) return true;
          return false;
        }
        return !(e as MouseEvent).button;
      })
      .on("zoom", (e) => setT(e.transform));
    zoomRef.current = z;
    select(svg).call(z).on("dblclick.zoom", null);
    return () => {
      select(svg).on(".zoom", null);
    };
  }, [avisar]);

  const volar = useCallback((transformacion: ZoomTransform) => {
    if (!svgRef.current || !zoomRef.current) return;
    select(svgRef.current).transition().duration(800).call(zoomRef.current.transform, transformacion);
  }, []);

  // En celular el panel queda abajo del mapa: al elegir algo, se baja hasta él
  const panelRef = useRef<HTMLDivElement>(null);
  const mostrarPanel = useCallback(() => {
    if (window.innerWidth < 1024) setTimeout(() => panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 850);
  }, []);

  const verEstado = useCallback(
    (slug: string, abrirCreador?: string) => {
      const forma = formas.find((f) => f.estado.slug === slug);
      if (!forma) return;
      const [[x0, y0], [x1, y1]] = forma.limites;
      const k = Math.min(9, 0.82 / Math.max((x1 - x0) / ANCHO, (y1 - y0) / ALTO));
      volar(zoomIdentity.translate(ANCHO / 2 - (k * (x0 + x1)) / 2, ALTO / 2 - (k * (y0 + y1)) / 2).scale(k));
      setSeleccion(abrirCreador ? { tipo: "creador", slug: abrirCreador } : { tipo: "estado", slug });
      mostrarPanel();
    },
    [volar, mostrarPanel],
  );

  const verMexico = useCallback(() => {
    volar(zoomIdentity);
    setSeleccion({ tipo: "mexico" });
  }, [volar]);

  const acercar = (factor: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, factor);
  };

  const estadoActivo =
    seleccion.tipo === "estado"
      ? seleccion.slug
      : seleccion.tipo === "creador"
        ? creadores.find((c) => c.slug === seleccion.slug)?.estado
        : undefined;
  // Tamaño constante en pantalla: no crece al acercar y se ve igual en celular o computadora
  const inv = escala / t.k;
  // En pantallas chicas los pines van un poco más pequeños para no encimarse
  const invPin = inv * (escala > 2 ? 0.72 : 1);

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
      {/* Mapa */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#e9f6ff] via-[#f3ecff] to-[#ffeef7] shadow-xl shadow-terracota/10 ring-1 ring-white">
        <div className="fondo-garabatos pointer-events-none absolute inset-0 opacity-15" aria-hidden />

        {/* Etiqueta del estado bajo el puntero */}
        <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-2xl bg-white/90 px-4 py-2 shadow-md backdrop-blur" aria-live="polite">
          {encima ? (
            <>
              <p className="font-display text-lg leading-tight font-bold">{encima.nombre}</p>
              <p className="text-xs text-cafe">
                {cuantos.get(encima.slug) ? `${cuantos.get(encima.slug)} ${cuantos.get(encima.slug) === 1 ? "creador" : "creadores"}` : "Aún sin creadores"} ·
                Capital: {encima.capital.nombre}
              </p>
            </>
          ) : (
            <p className="text-sm font-medium text-cafe">👆 Toca un estado para explorarlo</p>
          )}
        </div>

        {/* Aviso de cómo acercar */}
        {aviso && (
          <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center bg-tinta/30 p-6 backdrop-blur-[1px]">
            <p className="rounded-2xl bg-white px-5 py-3 text-center font-semibold shadow-lg">{aviso}</p>
          </div>
        )}
        <p className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-full bg-white/80 px-3 py-1 text-[11px] text-cafe backdrop-blur lg:hidden">
          Usa dos dedos para mover el mapa
        </p>

        {/* Controles */}
        <div className="absolute right-4 bottom-4 z-10 flex flex-col gap-2">
          <button onClick={() => acercar(1.6)} aria-label="Acercar" title="Acercar" className={claseControl}>
            <Plus className="size-5" />
          </button>
          <button onClick={() => acercar(1 / 1.6)} aria-label="Alejar" title="Alejar" className={claseControl}>
            <Minus className="size-5" />
          </button>
          <button onClick={verMexico} aria-label="Ver todo México" title="Ver todo México" className={claseControl}>
            <Maximize2 className="size-5" />
          </button>
        </div>

        <svg
          ref={svgRef}
          viewBox={`0 0 ${ANCHO} ${ALTO}`}
          className={`relative aspect-[100/68] w-full cursor-grab select-none active:cursor-grabbing lg:aspect-auto lg:h-[72vh] ${
            t.k > 1.01 ? "touch-none" : "touch-pan-y"
          }`}
          role="group"
          aria-label="Mapa de México con los estados y sus creadores"
        >
          <defs>
            {formas.map(({ estado }) => (
              <linearGradient key={estado.codigo} id={`g-${estado.codigo}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor={estado.colores[0]} />
                <stop offset="1" stopColor={estado.colores[1]} />
              </linearGradient>
            ))}
            <filter id="sombra" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#7c2df0" floodOpacity="0.18" />
            </filter>
          </defs>

          <g transform={t.toString()}>
            {/* Estados */}
            <g filter="url(#sombra)">
              {formas.map(({ estado, d }) => {
                const conCreadores = !!cuantos.get(estado.slug);
                const activo = estado.slug === estadoActivo;
                const resaltado = activo || encima?.slug === estado.slug;
                return (
                  <path
                    key={estado.codigo}
                    d={d}
                    role="button"
                    tabIndex={0}
                    aria-label={`${estado.nombre}${conCreadores ? `, ${cuantos.get(estado.slug)} creadores` : ""}`}
                    fill={conCreadores || activo ? `url(#g-${estado.codigo})` : estado.colores[0]}
                    fillOpacity={conCreadores || activo ? (resaltado ? 1 : 0.85) : resaltado ? 0.45 : 0.2}
                    stroke="#ffffff"
                    strokeWidth={(activo ? 3 : 1.4) * inv}
                    strokeLinejoin="round"
                    className="cursor-pointer outline-none transition-[fill-opacity] duration-200"
                    onMouseEnter={() => setEncima(estado)}
                    onMouseLeave={() => setEncima(null)}
                    onFocus={() => setEncima(estado)}
                    onBlur={() => setEncima(null)}
                    onClick={() => verEstado(estado.slug)}
                    onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && verEstado(estado.slug)}
                  />
                );
              })}
            </g>

            {/* Capitales y ciudades (más detalle al acercar o al elegir un estado) */}
            {formas.map(({ estado }) => {
              const mostrarCiudades = estado.slug === estadoActivo;
              const mostrarCapital = mostrarCiudades || t.k >= 2.6;
              if (!mostrarCapital) return null;
              const lugares = [{ ...estado.capital, capital: true }, ...(mostrarCiudades ? estado.ciudades.map((x) => ({ ...x, capital: false })) : [])];
              return lugares.map((l) => {
                const [x, y] = punto(l.lat, l.lon);
                return (
                  <g key={estado.codigo + l.nombre} transform={`translate(${x},${y}) scale(${inv})`} className="pointer-events-none">
                    {l.capital ? (
                      <text textAnchor="middle" dy="5" fontSize="15" fill="#1d0b36">★</text>
                    ) : (
                      <circle r="3.5" fill="#1d0b36" />
                    )}
                    <text
                      x="9"
                      y="4"
                      fontSize={l.capital ? 14 : 12.5}
                      fontWeight={l.capital ? 700 : 500}
                      fill="#1d0b36"
                      stroke="#ffffff"
                      strokeWidth="3.5"
                      paintOrder="stroke"
                    >
                      {l.nombre}
                    </text>
                  </g>
                );
              });
            })}

            {/* Vendedores */}
            {marcadores.map(({ creador, xy: [x, y] }) => {
              const elegido = seleccion.tipo === "creador" && seleccion.slug === creador.slug;
              const inicial = (creador.taller || creador.nombre || "?").trim()[0]?.toUpperCase();
              return (
                <g
                  key={creador.slug}
                  transform={`translate(${x},${y}) scale(${invPin * (elegido ? 1.25 : 1)})`}
                  className="cursor-pointer outline-none"
                  role="button"
                  tabIndex={0}
                  aria-label={`Vendedor: ${creador.taller}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    verEstado(creador.estado, creador.slug);
                  }}
                  onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && verEstado(creador.estado, creador.slug)}
                >
                  {/* Pin */}
                  <path
                    d="M0 0 C -14 -16 -16 -22 -16 -30 A 16 16 0 1 1 16 -30 C 16 -22 14 -16 0 0 Z"
                    fill={`url(#g-${estadoPorSlug(creador.estado)?.codigo})`}
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                  <circle cx="0" cy="-30" r="11" fill="#ffffff" />
                  <text x="0" y="-25.5" textAnchor="middle" fontSize="13" fontWeight="800" fill="#7c2df0">
                    {inicial}
                  </text>
                  {(elegido || t.k >= 3) && (
                    <text y="16" textAnchor="middle" fontSize="12" fontWeight="700" fill="#1d0b36" stroke="#ffffff" strokeWidth="3.5" paintOrder="stroke">
                      {creador.taller}
                    </text>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Panel lateral (abajo en celular) */}
      <div ref={panelRef} className="scroll-mt-32">
        <PanelMapa
          creadores={creadores}
          seleccion={seleccion}
          cuantos={cuantos}
          verEstado={verEstado}
          verMexico={verMexico}
          verCreador={(c) => verEstado(c.estado, c.slug)}
        />
      </div>
    </div>
  );
}
