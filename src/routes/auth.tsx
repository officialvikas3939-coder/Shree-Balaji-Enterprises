import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign In or Create Account — Shree Balaji Enterprises" },
      {
        name: "description",
        content: "Login or create your Shree Balaji Enterprises account to save your cart, place orders and track deliveries.",
      },
      { property: "og:title", content: "Sign In — Shree Balaji Enterprises" },
      { property: "og:description", content: "Access your hardware orders, cart and wishlist." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    if (user) void navigate({ to: "/orders" });
  }, [user, navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { full_name: form.name },
          },
        });
        if (error) throw error;
        toast.success("Account created", { description: "You are signed in." });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: form.email,
          password: form.password,
        });
        if (error) throw error;
        toast.success("Welcome back");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const field = (key: "name" | "email" | "password", label: string, type = "text") => (
    <label className="block text-sm">
      <span className="text-muted-foreground">{label}</span>
      <input
        required
        type={type}
        autoComplete={type === "password" ? "current-password" : "on"}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );

  return (
    <>
      <PageHeader
        eyebrow="Customer account"
        title={mode === "login" ? "Sign in" : "Create your account"}
        subtitle="Save your cart and wishlist, place orders and track delivery status."
      />
      <div className="mx-auto max-w-md px-4 py-12">
        <form onSubmit={submit} className="grid gap-5 rounded-lg border border-border bg-card p-6">
          {mode === "signup" && field("name", "Full name")}
          {field("email", "Email", "email")}
          {field("password", "Password", "password")}
          <button disabled={busy} className="btn-gold rounded-md py-3 text-sm disabled:opacity-60">
            {busy ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-xs text-muted-foreground underline hover:text-accent"
          >
            {mode === "login" ? "New customer? Create an account" : "Already have an account? Sign in"}
          </button>
        </form>
      </div>
    </>
  );
}
