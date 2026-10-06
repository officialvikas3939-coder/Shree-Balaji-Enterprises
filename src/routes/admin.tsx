import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { claimFirstAdmin, getAdminStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Panel — Shree Balaji Enterprises" },
      { name: "description", content: "Manage products, categories, orders and enquiries." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin Panel — Shree Balaji Enterprises" },
      { property: "og:description", content: "Internal management console." },
    ],
  }),
  component: AdminLayout,
});

const tabs = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/enquiries", label: "Enquiries" },
] as const;

function AdminLayout() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const fetchStatus = useServerFn(getAdminStatus);
  const claim = useServerFn(claimFirstAdmin);

  const { data: status, isLoading } = useQuery({
    queryKey: ["admin-status", user?.id],
    queryFn: () => fetchStatus(),
    enabled: Boolean(user),
  });

  if (loading || (user && isLoading)) {
    return <div className="py-24 text-center text-muted-foreground">Loading…</div>;
  }

  if (!user) {
    return (
      <>
        <PageHeader eyebrow="Restricted" title="Admin Panel" />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="font-display text-2xl text-ink">Sign in with your admin account</p>
          <Link to="/auth" className="btn-gold mt-6 inline-block rounded-md px-6 py-3 text-sm">
            Sign In
          </Link>
        </div>
      </>
    );
  }

  if (!status?.isAdmin) {
    return (
      <>
        <PageHeader eyebrow="Restricted" title="Admin Panel" />
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <p className="font-display text-2xl text-ink">You do not have admin access</p>
          {status && !status.adminExists ? (
            <>
              <p className="mt-3 text-sm text-muted-foreground">
                No admin exists yet. You can claim the owner account once.
              </p>
              <button
                type="button"
                className="btn-gold mt-6 rounded-md px-6 py-3 text-sm"
                onClick={async () => {
                  try {
                    await claim();
                    await qc.invalidateQueries({ queryKey: ["admin-status"] });
                    toast.success("You are now the admin");
                  } catch (e) {
                    toast.error(e instanceof Error ? e.message : "Could not claim admin");
                  }
                }}
              >
                Claim Admin Access
              </button>
            </>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Ask the store owner to grant your account admin rights.
            </p>
          )}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader eyebrow="Management console" title="Admin Panel" subtitle="Catalog, stock, orders and enquiries." />
      <div className="mx-auto max-w-7xl px-4 py-10">
        <nav className="mb-8 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: t.to === "/admin" }}
              className="rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              activeProps={{ className: "btn-gold rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider" }}
            >
              {t.label}
            </Link>
          ))}
        </nav>
        <Outlet />
      </div>
    </>
  );
}
