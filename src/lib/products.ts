import anillo from "@/assets/jewel-anillo-sello.jpg";
import cadena from "@/assets/jewel-cadena-cubana.jpg";
import aretes from "@/assets/jewel-aretes-aro.jpg";
import pulsera from "@/assets/jewel-pulsera-figaro.jpg";
import dije from "@/assets/jewel-dije-cruz.jpg";
import set from "@/assets/jewel-set-plata.jpg";

export type ProductType = string;

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  type: ProductType;
  tagline: string;
  description: string;
  usage: string;
  stock: number;
  active?: boolean;
  related?: string[];
}

/** Imágenes empaquetadas de los productos iniciales (referencia "seed:<id>"). */
const SEED_IMAGES: Record<string, string> = {
  "anillo-sello": anillo,
  "cadena-cubana": cadena,
  "aretes-aro": aretes,
  "pulsera-figaro": pulsera,
  "dije-cruz": dije,
  "set-plata": set,
};

/** Convierte la referencia guardada en base de datos en una URL usable por <img>. */
export function resolveImage(ref: string | undefined | null): string {
  if (!ref) return "";
  if (ref.startsWith("seed:")) return SEED_IMAGES[ref.slice(5)] ?? "";
  if (ref.startsWith("storage:")) return `/api/public/img/${ref.slice(8)}`;
  return ref;
}
