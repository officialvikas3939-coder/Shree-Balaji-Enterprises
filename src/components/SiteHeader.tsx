import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Heart, Menu, Phone, Search, ShieldCheck, ShoppingBag, User, X } from "lucide-react";
import logoUrl from "@/assets/logo.png";
import { useCatalog } from "@/lib/catalog";
import { useStore } from "@/lib/store";
import { useAuth } from "@/hooks/useAuth";
import { getAdminStatus } from "@/lib/admin.functions";

const navLinks = [
  { to: "/products", label: "All Products" },
  { to: "/bulk-orders", label: "Bulk / Dealer" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const { categories } = useCatalog();
  const { cartCount, wishlist } = useStore();
  const { user } = useAuth();
  const fetchAdminStatus = useServerFn(getAdminStatus);
  const { data: adminStatus } = useQuery({
    queryKey: ["admin-status", user?.id],
    queryFn: () => fetchAdminStatus(),
    enabled: Boolean(user),
  });
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();


  return (
    <header className="z-50">
      <div className="surface-ink text-center text-[11px] tracking-[0.18em] uppercase py-2">
        Free delivery above ₹4,999 · GST invoice on every order · Dealer rates available
      </div>
      <div className="border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
          <Link to="/" className="flex shrink-0 items-center gap-3">
            <img src={logoUrl} alt="Shree Balaji Enterprises logo" width={512} height={512} className="h-12 w-12 object-contain" />
            <span className="hidden sm:block leading-tight">
              <span className="block font-display text-lg font-semibold text-ink">Shree Balaji Enterprises</span>
              <span className="block text-[10px] tracking-[0.28em] uppercase text-muted-foreground">Hardware &amp; Fittings</span>
            </span>
          </Link>

          <form
            className="ml-auto hidden flex-1 max-w-xl items-center gap-2 rounded-full border border-border bg-background px-4 py-2 md:flex"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/products", search: { q, category: "all", sort: "featured" } });
            }}
          >
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search SS handles, hinges, door closers…"
              className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              aria-label="Search products"
            />
            <button type="submit" className="btn-ink rounded-full px-4 py-1 text-xs font-semibold">
              Search
            </button>
          </form>

          <div className="ml-auto flex items-center gap-1 md:ml-0">
            <a
              href="tel:+919414314135"
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-sm text-ink-soft hover:bg-muted lg:flex"
            >
              <Phone className="h-4 w-4" /> +91 94143 14135
            </a>
            {adminStatus?.isAdmin ? (
              <Link
                to="/admin"
                className="hidden rounded-full p-2 text-ink hover:bg-muted sm:block"
                aria-label="Open admin panel"
                title="Admin panel"
              >
                <ShieldCheck className="h-5 w-5" />
              </Link>
            ) : null}

            <Link to={user ? "/orders" : "/auth"} className="rounded-full p-2 hover:bg-muted" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>

            <Link to="/wishlist" className="relative rounded-full p-2 hover:bg-muted" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="relative rounded-full p-2 hover:bg-muted" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 rounded-full bg-accent px-1.5 text-[10px] font-bold text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
            <button className="rounded-full p-2 hover:bg-muted lg:hidden" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <nav className="hidden border-t border-border lg:block">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 overflow-x-auto px-4 py-2 text-sm">
            {categories.slice(0, 7).map((c) => (
              <Link
                key={c.slug}
                to="/category/$slug"
                params={{ slug: c.slug }}
                className="whitespace-nowrap text-ink-soft transition-colors hover:text-accent"
              >
                {c.name}
              </Link>
            ))}
            {navLinks.map((l) => (
              <Link key={l.to} to={l.to} className="whitespace-nowrap font-semibold text-ink hover:text-accent">
                {l.label}
              </Link>
            ))}
          </div>
        </nav>

        {open && (
          <div className="border-t border-border bg-card px-4 py-4 lg:hidden">
            <form
              className="mb-4 flex items-center gap-2 rounded-full border border-border px-3 py-2"
              onSubmit={(e) => {
                e.preventDefault();
                setOpen(false);
                navigate({ to: "/products", search: { q, category: "all", sort: "featured" } });
              }}
            >
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products"
                className="w-full bg-transparent text-sm outline-none"
                aria-label="Search products"
              />
            </form>
            <div className="grid gap-2 text-sm">
              {categories.map((c) => (
                <Link key={c.slug} to="/category/$slug" params={{ slug: c.slug }} onClick={() => setOpen(false)}>
                  {c.name}
                </Link>
              ))}
              {navLinks.map((l) => (
                <Link key={l.to} to={l.to} className="font-semibold" onClick={() => setOpen(false)}>
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
