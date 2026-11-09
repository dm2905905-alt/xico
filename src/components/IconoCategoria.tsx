import {
  Brush,
  Flame,
  Flower2,
  Frame,
  Gem,
  Gift,
  Palette,
  Shirt,
  Smartphone,
  type LucideProps,
} from "lucide-react";
import type { CategoriaSlug } from "@/lib/datos";

const iconos: Record<CategoriaSlug, React.ComponentType<LucideProps>> = {
  fundas: Smartphone,
  ropa: Shirt,
  cuadros: Frame,
  joyeria: Gem,
  velas: Flame,
  regalos: Gift,
  artesania: Palette,
  decoracion: Flower2,
};

export function IconoCategoria({ slug, ...props }: { slug: CategoriaSlug } & LucideProps) {
  const Icono = iconos[slug] ?? Brush;
  return <Icono {...props} />;
}
