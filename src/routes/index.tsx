import { createFileRoute, Link } from "@tanstack/react-router";
import { Hammer, PackageCheck, Ruler, ShieldCheck, Sparkles, Truck } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { useCatalog } from "@/lib/catalog";
import { ProductCard } from "@/components/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Shree Balaji Enterprises — SS Hardware, Hinges & Door Fittings" },
      {
        name: "description",
        content:
          "Buy SS handles, all types of hinges, door closers, curtain holders, locks and 100+ premium hardware items online. Dealer rates, GST invoice, fast delivery.",
      },
      { property: "og:title", content: "Shree Balaji Enterprises — Premium Hardware & Fittings" },
      {
        name: "og:description",
        content: "100+ stainless steel hardware products for homes, builders and contractors across India.",
      },
    ],
  }),
  component: Home,
});

const usps = [
  { icon: ShieldCheck, title: "304 Grade Steel", text: "Anti-rust, anti-tarnish fittings tested for Indian humidity." },
  { icon: Truck, title: "24 Hour Dispatch", text: "Free delivery on orders above ₹4,999, all India shipping." },
  { icon: Hammer, title: "Contractor Rates", text: "Slab pricing for builders, carpenters and interior firms." },
  { icon: PackageCheck, title: "12 Month Warranty", text: "Replacement warranty with GST invoice on every item." },
];

function Home() {
  const { categories, products } = useCatalog();
  const bestsellers = products.filter((p) => p.rating >= 4.6).slice(0, 8);
  const newArrivals = products.slice(-8);

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImg}
          alt="Premium stainless steel door hardware collection"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/80 to-ink/25" />
        <div className="relative mx-auto max-w-7xl px-4 py-28 md:py-36">
          <p className="text-[11px] font-semibold tracking-[0.35em] uppercase text-accent">Since 2004 · Jaipur</p>
          <h1 className="mt-5 max-w-2xl font-display text-5xl leading-[1.05] font-semibold text-primary-foreground md:text-7xl">
            Hardware that finishes <span className="text-gilded">a beautiful home.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-primary-foreground/80">
            SS handles, every type of hinge, hydraulic door closers, curtain holders, locks, channels and kitchen fittings —
            over {products.length} products under one trusted roof.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link to="/products" search={{ category: "all", sort: "featured", q: "" }} className="btn-gold rounded-md px-8 py-4 text-sm">
              Shop All {products.length} Products
            </Link>
            <Link
              to="/bulk-orders"
              className="rounded-md border border-primary-foreground/30 px-8 py-4 text-sm font-semibold text-primary-foreground hover:border-accent hover:text-accent"
            >
              Get Dealer Pricing
            </Link>
          </div>
          <dl className="mt-14 grid max-w-2xl grid-cols-2 gap-6 border-t border-primary-foreground/15 pt-8 sm:grid-cols-4">
            {[
              ["21+", "Years in trade"],
              ["12", "Categories"],
              [`${products.length}+`, "SKUs in stock"],
              ["4.8★", "Customer rating"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-3xl font-semibold text-accent">{v}</dt>
                <dd className="text-xs tracking-wide uppercase text-primary-foreground/60">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* USPs */}
      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
          {usps.map((u) => (
            <div key={u.title} className="flex gap-3">
              <u.icon className="h-6 w-6 shrink-0 text-accent" />
              <div>
                <p className="text-sm font-semibold text-ink">{u.title}</p>
                <p className="text-xs text-muted-foreground">{u.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-accent">Shop by category</p>
            <h2 className="mt-3 font-display text-4xl font-semibold text-ink">Everything for door, kitchen &amp; bath</h2>
            <div className="gold-rule mt-5" />
          </div>
          <Link to="/products" search={{ category: "all", sort: "featured", q: "" }} className="text-sm font-semibold text-ink underline hover:text-accent">
            View full catalogue →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.slug}
              to="/category/$slug"
              params={{ slug: c.slug }}
              className="card-elevated group overflow-hidden rounded-lg"
            >
              <div className="overflow-hidden bg-muted">
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  width={1024}
                  height={1024}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl font-semibold text-ink">{c.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">{c.tagline}</p>
                <p className="mt-3 text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                  {products.filter((p) => p.category === c.slug).length} products
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bestsellers */}
      <section className="surface-ink py-20">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-accent">Most ordered</p>
          <h2 className="mt-3 font-display text-4xl font-semibold">Bestsellers this season</h2>
          <div className="gold-rule mt-5" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-accent">Fresh stock</p>
        <h2 className="mt-3 font-display text-4xl font-semibold text-ink">New arrivals</h2>
        <div className="gold-rule mt-5" />
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {newArrivals.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* Craft strip */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid items-center gap-10 rounded-lg border border-border bg-card p-8 md:grid-cols-2 md:p-12">
          <div>
            <Sparkles className="h-7 w-7 text-accent" />
            <h2 className="mt-4 font-display text-3xl font-semibold text-ink">Finishes that match your interior</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Satin, mirror polish, antique brass, matte black, rose gold and chrome — every core product is available in
              six finishes so your handles, hinges and curtain holders speak the same language.
            </p>
            <ul className="mt-6 grid gap-2 text-sm text-ink-soft">
              <li className="flex gap-2">
                <Ruler className="h-4 w-4 text-accent" /> Free site measurement guidance over call
              </li>
              <li className="flex gap-2">
                <PackageCheck className="h-4 w-4 text-accent" /> Project kitting — one carton per door
              </li>
            </ul>
            <Link to="/contact" className="btn-ink mt-8 inline-block rounded-md px-6 py-3 text-sm font-semibold">
              Talk to a hardware expert
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {categories.slice(0, 4).map((c) => (
              <img
                key={c.slug}
                src={c.image}
                alt={c.name}
                loading="lazy"
                width={1024}
                height={1024}
                className="aspect-square w-full rounded-md object-cover"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <h2 className="font-display text-4xl font-semibold text-ink">What our customers say</h2>
        <div className="gold-rule mt-5" />
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              n: "Rajesh Mehta, Contractor",
              t: "Supplied hardware for a 24-flat project. Hinges and closers are still perfect after two years.",
            },
            { n: "Priya Sharma, Homeowner", t: "The rose gold cabinet handles changed my whole kitchen. Packing was excellent." },
            { n: "Interio Studio, Jaipur", t: "Best rates in Rajasthan for SS aldrops and glass fittings. Dispatch is always on time." },
          ].map((r) => (
            <blockquote key={r.n} className="rounded-lg border border-border bg-card p-6">
              <p className="text-accent">★★★★★</p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">“{r.t}”</p>
              <footer className="mt-4 text-xs font-semibold tracking-wide uppercase text-muted-foreground">{r.n}</footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Finishes palette */}
      <section className="border-y border-border bg-card">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-accent">Six signature finishes</p>
          <h2 className="mt-3 font-display text-4xl font-semibold text-ink">Pick a finish, we match the whole set</h2>
          <div className="gold-rule mt-5" />
          <div className="mt-10 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-6">
            {[
              ["Satin Steel", "linear-gradient(135deg,#d8dde2,#8d979f)"],
              ["Mirror Polish", "linear-gradient(135deg,#ffffff,#b9c2c9)"],
              ["Antique Brass", "linear-gradient(135deg,#c9a24a,#7a5a1c)"],
              ["Matte Black", "linear-gradient(135deg,#4a4a4a,#141414)"],
              ["Rose Gold", "linear-gradient(135deg,#e8b7a3,#b3705a)"],
              ["Chrome", "linear-gradient(135deg,#eef2f5,#9aa6ad)"],
            ].map(([name, bg]) => (
              <div key={name} className="text-center">
                <div
                  className="mx-auto h-20 w-20 rounded-full border border-border shadow-sm transition-transform duration-500 hover:scale-110"
                  style={{ backgroundImage: bg }}
                />
                <p className="mt-3 text-xs font-semibold tracking-wide uppercase text-ink-soft">{name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How ordering works */}
      <section className="mx-auto max-w-7xl px-4 py-20">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-accent">Simple process</p>
        <h2 className="mt-3 font-display text-4xl font-semibold text-ink">How ordering works</h2>
        <div className="gold-rule mt-5" />
        <div className="mt-10 grid gap-6 md:grid-cols-4">
          {[
            ["01", "Browse the catalogue", "Filter by category, finish and budget across our full range."],
            ["02", "Add to cart or ask", "Single piece or full project list — dealer rates on request."],
            ["03", "Confirm your order", "Live stock check, GST invoice and order confirmation instantly."],
            ["04", "Dispatch in 24 hours", "Tracked shipping across India, free above ₹4,999."],
          ].map(([n, t, d]) => (
            <div key={n} className="rounded-lg border border-border bg-card p-6">
              <p className="font-display text-3xl font-semibold text-accent">{n}</p>
              <h3 className="mt-3 text-base font-semibold text-ink">{t}</h3>
              <p className="mt-2 text-sm text-ink-soft">{d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dealer banner */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="surface-ink grid items-center gap-8 rounded-lg p-10 md:grid-cols-[1.4fr_1fr] md:p-14">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-accent">For builders & carpenters</p>
            <h2 className="mt-3 font-display text-4xl font-semibold">Dealer & project pricing</h2>
            <p className="mt-4 max-w-xl text-sm text-primary-foreground/75">
              Sharing your BOQ or door schedule gets you slab rates, labelled project kitting and a dedicated person on
              call for the whole site. Minimum order for dealer slabs starts at ₹25,000.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/bulk-orders" className="btn-gold rounded-md px-7 py-3.5 text-sm">
                Request a quote
              </Link>
              <a
                href="tel:+919414314135"
                className="rounded-md border border-primary-foreground/30 px-7 py-3.5 text-sm font-semibold text-primary-foreground hover:border-accent hover:text-accent"
              >
                Call +91 94143 14135
              </a>
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-6">
            {[
              ["Up to 32%", "Dealer discount"],
              ["24 hrs", "Quote turnaround"],
              ["500+", "Projects supplied"],
              ["Pan India", "Shipping network"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="font-display text-2xl font-semibold text-accent">{v}</dt>
                <dd className="text-xs tracking-wide uppercase text-primary-foreground/60">{l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Quick answers */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <p className="text-[11px] font-semibold tracking-[0.3em] uppercase text-accent">Good to know</p>
        <h2 className="mt-3 font-display text-4xl font-semibold text-ink">Quick answers</h2>
        <div className="gold-rule mt-5" />
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[
            ["Do you give GST invoice?", "Yes, every order ships with a GST invoice in your business or personal name."],
            ["How fast is delivery?", "Dispatch within 24 hours; 2–6 days transit depending on your pin code."],
            ["Can I return an item?", "Unused items can be returned within 7 days; manufacturing defects for 12 months."],
            ["Which hinge suits my door?", "Share door weight and size on call — we recommend the right hinge and closer free."],
          ].map(([q, a]) => (
            <details key={q} className="group rounded-lg border border-border bg-card p-5">
              <summary className="cursor-pointer list-none text-sm font-semibold text-ink">{q}</summary>
              <p className="mt-3 text-sm text-ink-soft">{a}</p>
            </details>
          ))}
        </div>
        <Link to="/faq" className="mt-6 inline-block text-sm font-semibold text-ink underline hover:text-accent">
          See all FAQs →
        </Link>
      </section>

      {/* Visit the store */}
      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="grid gap-8 rounded-lg border border-border bg-card p-8 md:grid-cols-3 md:p-12">
          <div>
            <h2 className="font-display text-3xl font-semibold text-ink">Visit our counter</h2>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              Shree Balaji Enterprises, Dhawas, near Yashswai Super Market, Jaipur, Rajasthan 302021
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">Shop hours</p>
            <ul className="mt-3 grid gap-1 text-sm text-ink-soft">
              <li>Monday – Saturday · 9:30 AM – 8:30 PM</li>
              <li>Sunday · 10:00 AM – 4:00 PM</li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">Talk to us</p>
            <ul className="mt-3 grid gap-1 text-sm text-ink-soft">
              <li>
                <a className="hover:text-accent" href="tel:+919414314135">Gopal Lal Jangid · +91 94143 14135</a>
              </li>
              <li>
                <a className="hover:text-accent" href="tel:+916376403939">Vikas Jangid · +91 63764 03939</a>
              </li>
            </ul>
            <Link to="/contact" className="btn-ink mt-5 inline-block rounded-md px-6 py-3 text-sm font-semibold">
              Send an enquiry
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

