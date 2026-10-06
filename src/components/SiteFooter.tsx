import { Link } from "@tanstack/react-router";
import logoUrl from "@/assets/logo.png";
import { useCatalog } from "@/lib/catalog";

const help = [
  { to: "/faq", label: "FAQ" },
  { to: "/shipping", label: "Shipping & Delivery" },
  { to: "/returns", label: "Returns & Warranty" },
  { to: "/orders", label: "Track Your Order" },
  { to: "/contact", label: "Customer Support" },
];

const company = [
  { to: "/about", label: "About Us" },
  { to: "/bulk-orders", label: "Bulk & Dealer Enquiry" },
  { to: "/privacy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms of Use" },
];

export function SiteFooter() {
  const { categories } = useCatalog();
  return (
    <footer className="surface-ink mt-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-4">
        <div>
          <img src={logoUrl} alt="Shree Balaji Enterprises" loading="lazy" width={512} height={512} className="h-16 w-16 object-contain" />
          <p className="mt-4 text-sm text-primary-foreground/70">
            Stainless steel architectural hardware, door fittings and kitchen solutions supplied to homes, builders and
            contractors across India since 2004.
          </p>
          <p className="mt-4 text-sm text-primary-foreground/70">
            Shree Balaji Enterprises, Dhawas, Near Yashswai Super Market,
            <br />
            Jaipur, Rajasthan 302021
            <br />
            Gopal Lal Jangid · +91 94143 14135
            <br />
            Vikas Jangid · +91 63764 03939
            <br />
            care@shreebalajienterprises.in
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">Shop</h3>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
            {categories.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <Link to="/category/$slug" params={{ slug: c.slug }} className="hover:text-accent">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">Help</h3>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
            {help.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-[0.2em] uppercase text-accent">Company</h3>
          <ul className="mt-4 space-y-2 text-sm text-primary-foreground/75">
            {company.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="hover:text-accent">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15 py-5 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} Shree Balaji Enterprises · GSTIN 08ABCDE1234F1Z5 · All prices inclusive of GST
      </div>
    </footer>
  );
}
