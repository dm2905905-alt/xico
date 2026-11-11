import {
  Baby,
  Bath,
  Brush,
  Coffee,
  Flame,
  Footprints,
  Frame,
  Gem,
  Gift,
  NotebookPen,
  Palette,
  PartyPopper,
  PawPrint,
  Puzzle,
  Ribbon,
  Scissors,
  Shirt,
  ShoppingBag,
  Smartphone,
  Sofa,
  Sprout,
  type LucideProps,
} from "lucide-react";
import type { CategoriaSlug } from "@/lib/datos";

const iconos: Record<CategoriaSlug, React.ComponentType<LucideProps>> = {
  ropa: Shirt,
  calzado: Footprints,
  bolsas: ShoppingBag,
  accesorios: Ribbon,
  joyeria: Gem,
  fundas: Smartphone,
  cuadros: Frame,
  decoracion: Sofa,
  cocina: Coffee,
  jardin: Sprout,
  velas: Flame,
  belleza: Bath,
  papeleria: NotebookPen,
  fiestas: PartyPopper,
  bebes: Baby,
  juguetes: Puzzle,
  mascotas: PawPrint,
  regalos: Gift,
  artesania: Palette,
  manualidades: Scissors,
};

export function IconoCategoria({ slug, ...props }: { slug: CategoriaSlug } & LucideProps) {
  const Icono = iconos[slug] ?? Brush;
  return <Icono {...props} />;
}
