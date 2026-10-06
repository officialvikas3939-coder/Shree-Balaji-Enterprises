import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { adminListEnquiries, adminUpdateEnquiryStatus } from "@/lib/admin.functions";

export const Route = createFileRoute("/admin/enquiries")({
  component: AdminEnquiries,
});

const statuses = ["new", "in_progress", "closed"] as const;
const statusLabels: Record<string, string> = {
  new: "New",
  in_progress: "In Progress",
  closed: "Closed",
};

function AdminEnquiries() {
  const qc = useQueryClient();
  const list = useServerFn(adminListEnquiries);
  const update = useServerFn(adminUpdateEnquiryStatus);
  const [filter, setFilter] = useState<"all" | (typeof statuses)[number]>("all");

  const { data: enquiries = [], isLoading } = useQuery({
    queryKey: ["admin-enquiries"],
    queryFn: () => list(),
  });

  const statusMut = useMutation({
    mutationFn: (vars: { id: string; status: (typeof statuses)[number] }) => update({ data: vars }),
    onSuccess: () => {
      toast.success("Enquiry updated");
      void qc.invalidateQueries({ queryKey: ["admin-enquiries"] });
      void qc.invalidateQueries({ queryKey: ["admin-stats"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Update failed"),
  });

  const shown = filter === "all" ? enquiries : enquiries.filter((e) => e.status === filter);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-2">
        {(["all", ...statuses] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={
              filter === s
                ? "btn-gold rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
                : "rounded-full border border-border px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            }
          >
            {s === "all" ? `All (${enquiries.length})` : statusLabels[s]}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="py-16 text-center text-muted-foreground">Loading enquiries…</p>
      ) : shown.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">No enquiries in this view.</p>
      ) : (
        <div className="grid gap-4">
          {shown.map((e) => (
            <article key={e.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold text-ink">
                    {e.name}
                    <span className="ml-2 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {e.kind === "bulk" ? "Bulk / Dealer" : "Contact"}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {e.phone}
                    {e.email ? ` · ${e.email}` : ""}
                    {e.company ? ` · ${e.company}` : ""}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(e.created_at).toLocaleString("en-IN")}
                  </p>
                </div>
                <select
                  value={e.status}
                  disabled={statusMut.isPending}
                  onChange={(ev) =>
                    statusMut.mutate({ id: e.id, status: ev.target.value as (typeof statuses)[number] })
                  }
                  className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-ink"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {statusLabels[s]}
                    </option>
                  ))}
                </select>
              </div>
              {e.subject ? <p className="mt-3 text-sm font-medium text-ink">{e.subject}</p> : null}
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{e.message}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
