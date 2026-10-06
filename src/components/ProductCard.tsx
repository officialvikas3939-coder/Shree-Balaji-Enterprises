import { Link } from "@tanstack/react-router";
import { Heart, Star } from "lucide-react";
import { inr, type Product } from "@/data/products";
import { useStore } from "@/lib/store";

export function Stars({ rating, reviews }: { rating: number; reviews?: number }) {
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <span className="flex text-accent">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="h-3.5 w-3.5" fill={i <= Math.round(rating) ? "currentColor" : "none"} strokeWidth={1.5} />
        ))}
      </span>
      {rating.toFixed(1)}
      {reviews !== undefined && <span>({reviews})</span>}
    </span>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const { add, toggleWish, wishlist } = useStore();
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const wished = wishlist.includes(product.slug);

  return (
    <article className="card-elevated group relative flex flex-col overflow-hidden rounded-lg">
      <button
        onClick={() => toggleWish(product.slug)}
        aria-label="Add to wishlist"
        className="absolute right-3 top-3 z-10 rounded-full bg-card/90 p-2 text-ink-soft shadow-sm hover:text-accent"
      >
        <Heart className="h-4 w-4" fill={wished ? "currentColor" : "none"} />
      </button>
      <Link to="/product/$slug" params={{ slug: product.slug }} className="block overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={1024}
          height={1024}
          className="aspect-square w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[10px] font-semibold tracking-[0.2em] uppercase text-accent">{product.brand}</span>
        <Link to="/product/$slug" params={{ slug: product.slug }} className="mt-1 line-clamp-2 text-sm font-semibold text-ink hover:underline">
          {product.name}
        </Link>
        <div className="mt-2">
          <Stars rating={product.rating} reviews={product.reviews} />
        </div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold text-ink">{inr(product.price)}</span>
          <span className="text-xs text-muted-foreground line-through">{inr(product.mrp)}</span>
          <span className="text-xs font-bold text-success">{off}% off</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {product.finish} · per {product.unit.toLowerCase()}
        </p>
        <button onClick={() => add(product.slug)} className="btn-gold mt-4 w-full rounded-md py-2 text-sm">
          Add to Cart
        </button>
      </div>
    </article>
  );
}
