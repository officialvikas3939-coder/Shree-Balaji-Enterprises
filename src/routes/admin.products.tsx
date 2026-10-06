import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { inr } from "@/data/products";
import {
  adminDeleteProduct,
  adminListCategories,
  adminListProducts,
  adminSaveProduct,
  adminUpdateStock,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

type FormValues = {
  slug: string;
  name: string;
  category_slug: string;
  price: number;
  mrp: number;
  stock: number;
  brand: string;
  finish: string;
  material: string;
  unit: string;
  description: string;
  image_url: string;
  is_active: boolean;
};

const empty: FormValues = {
  slug: "",
  name: "",
  category_slug: "",
  price: 0,
  mrp: 0,
  stock: 0,
  brand: "Balaji Prime",
  finish: "Satin SS",
  material: "Stainless Steel 304",
  unit: "Piece",
  description: "",
  image_url: "",
  is_active: true,
};

function AdminProducts() {
  const qc = useQueryClient();
  const listProducts = useServerFn(adminListProducts);
  const listCategories = useServerFn(adminListCategories);
  const saveProduct = useServerFn(adminSaveProduct);
  const deleteProduct = useServerFn(adminDeleteProduct);
  const updateStock = useServerFn(adminUpdateStock);

  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormValues>(empty);
  const [open, setOpen] = useState(false);

  const { data: products = [], isLoading } = useQuery({ queryKey: ["admin-products"], queryFn: () => listProducts() });
  const { data: categories = [] } = useQuery({ queryKey: ["admin-categories"], queryFn: () => listCategories() });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["admin-products"] });
    void qc.invalidateQueries({ queryKey: ["catalog"] });
    void qc.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const save = useMutation({
    mutationFn: () => saveProduct({ data: editingId ? { id: editingId, values: form } : { values: form } }),
    onSuccess: () => {
      toast.success(editingId ? "Product updated" : "Product added");
      setOpen(false);
      setEditingId(null);
      setForm(empty);
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteProduct({ data: { id } }),
    onSuccess: () => {
      toast.success("Product removed from store");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  const stock = useMutation({
    mutationFn: (v: { id: string; stock: number }) => updateStock({ data: v }),
    onSuccess: () => {
      toast.success("Stock updated");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Stock update failed"),
  });

  const filtered = products.filter((p) =>
    `${p.name} ${p.slug} ${p.category_slug}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const field = (label: string, key: keyof FormValues, type: "text" | "number" = "text") => (
    <label className="block text-xs">
      <span className="font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        type={type}
        value={String(form[key] ?? "")}
        onChange={(e) =>
          setForm((f) => ({ ...f, [key]: type === "number" ? Number(e.target.value || 0) : e.target.value }))
        }
        className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ink"
      />
    </label>
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products…"
          className="w-64 rounded-md border border-border bg-background px-3 py-2 text-sm text-ink"
        />
        <button
          type="button"
          className="btn-gold rounded-md px-5 py-2 text-sm"
          onClick={() => {
            setEditingId(null);
            setForm({ ...empty, category_slug: categories[0]?.slug ?? "" });
            setOpen(true);
          }}
        >
          + Add Product
        </button>
        <span className="text-xs text-muted-foreground">{filtered.length} shown</span>
      </div>

      {open && (
        <form
          className="mb-8 grid gap-4 rounded-lg border border-border bg-card p-6 md:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            save.mutate();
          }}
        >
          {field("Name", "name")}
          {field("Slug", "slug")}
          <label className="block text-xs">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">Category</span>
            <select
              value={form.category_slug}
              onChange={(e) => setForm((f) => ({ ...f, category_slug: e.target.value }))}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ink"
            >
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {field("Price (₹)", "price", "number")}
          {field("MRP (₹)", "mrp", "number")}
          {field("Stock", "stock", "number")}
          {field("Brand", "brand")}
          {field("Finish", "finish")}
          {field("Material", "material")}
          {field("Unit", "unit")}
          {field("Image URL", "image_url")}
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            Active
          </label>
          <label className="block text-xs md:col-span-3">
            <span className="font-semibold uppercase tracking-wider text-muted-foreground">Description</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-ink"
            />
          </label>
          <div className="flex gap-3 md:col-span-3">
            <button type="submit" disabled={save.isPending} className="btn-gold rounded-md px-6 py-2 text-sm">
              {save.isPending ? "Saving…" : editingId ? "Update Product" : "Add Product"}
            </button>
            <button
              type="button"
              className="rounded-md border border-border px-6 py-2 text-sm"
              onClick={() => {
                setOpen(false);
                setEditingId(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <p className="py-16 text-center text-muted-foreground">Loading products…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-b border-border/60">
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">{p.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{p.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category_slug}</td>
                  <td className="px-4 py-3">{inr(Number(p.price))}</td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      defaultValue={p.stock}
                      min={0}
                      className="w-20 rounded-md border border-border bg-background px-2 py-1 text-sm text-ink"
                      onBlur={(e) => {
                        const next = Number(e.target.value);
                        if (next !== p.stock) stock.mutate({ id: p.id, stock: next });
                      }}
                    />
                  </td>
                  <td className="px-4 py-3 text-xs">{p.is_active ? "Active" : "Hidden"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-md border border-border px-3 py-1 text-xs"
                        onClick={() => {
                          setEditingId(p.id);
                          setForm({
                            ...empty,
                            slug: p.slug,
                            name: p.name,
                            category_slug: p.category_slug,
                            price: Number(p.price),
                            mrp: Number(p.mrp ?? 0),
                            stock: p.stock,
                            image_url: p.image_url ?? "",
                            is_active: p.is_active,
                          });
                          setOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-destructive/50 px-3 py-1 text-xs text-destructive"
                        onClick={() => remove.mutate(p.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
