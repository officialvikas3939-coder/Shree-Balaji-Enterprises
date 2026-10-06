import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminDeleteCategory, adminListCategories, adminSaveCategory } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

type FormValues = {
  slug: string;
  name: string;
  tagline: string;
  image_url: string;
  sort_order: number;
  is_active: boolean;
};

const empty: FormValues = { slug: "", name: "", tagline: "", image_url: "", sort_order: 0, is_active: true };

function AdminCategories() {
  const qc = useQueryClient();
  const list = useServerFn(adminListCategories);
  const save = useServerFn(adminSaveCategory);
  const del = useServerFn(adminDeleteCategory);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormValues>(empty);
  const [open, setOpen] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: () => list(),
  });

  const refresh = () => {
    void qc.invalidateQueries({ queryKey: ["admin-categories"] });
    void qc.invalidateQueries({ queryKey: ["catalog"] });
  };

  const saveMut = useMutation({
    mutationFn: () => save({ data: editingId ? { id: editingId, values: form } : { values: form } }),
    onSuccess: () => {
      toast.success(editingId ? "Category updated" : "Category added");
      setOpen(false);
      setEditingId(null);
      setForm(empty);
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Save failed"),
  });

  const delMut = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => {
      toast.success("Category hidden");
      refresh();
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Delete failed"),
  });

  return (
    <div>
      <div className="mb-6">
        <button
          type="button"
          className="btn-gold rounded-md px-5 py-2 text-sm"
          onClick={() => {
            setEditingId(null);
            setForm(empty);
            setOpen(true);
          }}
        >
          + Add Category
        </button>
      </div>

      {open && (
        <form
          className="mb-8 grid gap-4 rounded-lg border border-border bg-card p-6 md:grid-cols-3"
          onSubmit={(e) => {
            e.preventDefault();
            saveMut.mutate();
          }}
        >
          {(
            [
              ["Name", "name", "text"],
              ["Slug", "slug", "text"],
              ["Tagline", "tagline", "text"],
              ["Image URL", "image_url", "text"],
              ["Sort Order", "sort_order", "number"],
            ] as const
          ).map(([label, key, type]) => (
            <label key={key} className="block text-xs">
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
          ))}
          <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm((f) => ({ ...f, is_active: e.target.checked }))}
            />
            Active
          </label>
          <div className="flex gap-3 md:col-span-3">
            <button type="submit" disabled={saveMut.isPending} className="btn-gold rounded-md px-6 py-2 text-sm">
              {saveMut.isPending ? "Saving…" : editingId ? "Update Category" : "Add Category"}
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
        <p className="py-16 text-center text-muted-foreground">Loading categories…</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b border-border text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Tagline</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-border/60">
                  <td className="px-4 py-3">
                    <span className="font-medium text-ink">{c.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{c.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{c.tagline}</td>
                  <td className="px-4 py-3">{c.sort_order}</td>
                  <td className="px-4 py-3 text-xs">{c.is_active ? "Active" : "Hidden"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="rounded-md border border-border px-3 py-1 text-xs"
                        onClick={() => {
                          setEditingId(c.id);
                          setForm({
                            slug: c.slug,
                            name: c.name,
                            tagline: c.tagline ?? "",
                            image_url: c.image_url ?? "",
                            sort_order: c.sort_order ?? 0,
                            is_active: c.is_active,
                          });
                          setOpen(true);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="rounded-md border border-destructive/50 px-3 py-1 text-xs text-destructive"
                        onClick={() => delMut.mutate(c.id)}
                      >
                        Hide
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
