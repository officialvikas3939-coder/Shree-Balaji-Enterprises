import handlesImg from "@/assets/cat-handles.jpg";
import hingesImg from "@/assets/cat-hinges.jpg";
import closersImg from "@/assets/cat-closers.jpg";
import curtainImg from "@/assets/cat-curtain.jpg";
import locksImg from "@/assets/cat-locks.jpg";
import boltsImg from "@/assets/cat-bolts.jpg";
import knobsImg from "@/assets/cat-knobs.jpg";
import channelsImg from "@/assets/cat-channels.jpg";
import glassImg from "@/assets/cat-glass.jpg";
import screwsImg from "@/assets/cat-screws.jpg";
import bathImg from "@/assets/cat-bath.jpg";
import kitchenImg from "@/assets/cat-kitchen.jpg";

export type Category = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  image: string;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  categoryName: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  image: string;
  brand: string;
  finish: string;
  material: string;
  unit: string;
  stock: number;
  highlights: string[];
  description: string;
};

/** Rows as returned by the public catalog server function. */
export type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  image_key: string | null;
  image_url: string | null;
  sort_order: number;
};

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  price: number;
  mrp: number;
  rating: number;
  reviews: number;
  image_key: string | null;
  image_url: string | null;
  brand: string;
  finish: string;
  material: string;
  unit: string;
  stock: number;
  highlights: string[];
  description: string;
};

const IMAGE_MAP: Record<string, string> = {
  "cat-handles": handlesImg,
  "cat-hinges": hingesImg,
  "cat-closers": closersImg,
  "cat-curtain": curtainImg,
  "cat-locks": locksImg,
  "cat-bolts": boltsImg,
  "cat-knobs": knobsImg,
  "cat-channels": channelsImg,
  "cat-glass": glassImg,
  "cat-screws": screwsImg,
  "cat-bath": bathImg,
  "cat-kitchen": kitchenImg,
};

export const resolveImage = (imageUrl: string | null, imageKey: string | null) =>
  imageUrl && imageUrl.length > 0 ? imageUrl : (imageKey ? IMAGE_MAP[imageKey] : undefined) ?? handlesImg;

export const toCategory = (row: CategoryRow): Category => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  tagline: row.tagline,
  image: resolveImage(row.image_url, row.image_key),
});

export const toProduct = (row: ProductRow, categoryName: string): Product => ({
  id: row.id,
  slug: row.slug,
  name: row.name,
  category: row.category_slug,
  categoryName,
  price: row.price,
  mrp: row.mrp,
  rating: Number(row.rating),
  reviews: row.reviews,
  image: resolveImage(row.image_url, row.image_key),
  brand: row.brand,
  finish: row.finish,
  material: row.material,
  unit: row.unit,
  stock: row.stock,
  highlights: row.highlights ?? [],
  description: row.description,
});

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
