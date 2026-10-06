import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Shree Balaji Enterprises" },
      { name: "description", content: "Call, WhatsApp or email Shree Balaji Enterprises for hardware enquiries and site support." },
      { property: "og:title", content: "Contact Shree Balaji Enterprises" },
      { property: "og:description", content: "Dhawas, Near Yashswai Super Market, Jaipur · +91 94143 14135 · +91 63764 03939" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [sent, setSent] = useState(false);

  return (
    <>
      <PageHeader eyebrow="We are listening" title="Contact Us" subtitle="Product help, bulk quotes, order status — talk to us directly." />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2">
        <div className="grid gap-5 text-sm">
          {[
            {
              icon: MapPin,
              t: "Showroom",
              v: "Shree Balaji Enterprises, Dhawas, Near Yashswai Super Market, Jaipur, Rajasthan 302021",
            },
            { icon: Phone, t: "Gopal Lal Jangid — Phone / WhatsApp", v: "+91 94143 14135" },
            { icon: Phone, t: "Vikas Jangid — Phone / WhatsApp", v: "+91 63764 03939" },
            { icon: Mail, t: "Email", v: "care@shreebalajienterprises.in" },
            { icon: Clock, t: "Timings", v: "Mon–Sat, 9:30 AM – 8:00 PM" },
          ].map((c) => (
            <div key={c.t} className="flex gap-4 rounded-lg border border-border bg-card p-5">
              <c.icon className="h-5 w-5 shrink-0 text-accent" />
              <div>
                <p className="font-semibold text-ink">{c.t}</p>
                <p className="text-muted-foreground">{c.v}</p>
              </div>
            </div>
          ))}
        </div>

        <form
          className="grid gap-4 rounded-lg border border-border bg-card p-6"
          onSubmit={(e) => {
            e.preventDefault();
            setSent(true);
            toast.success("Enquiry sent", { description: "Our team will call you back within 1 working day." });
          }}
        >
          <h2 className="font-display text-2xl font-semibold text-ink">Send an enquiry</h2>
          {[
            { label: "Your name", type: "text" },
            { label: "Mobile number", type: "tel" },
            { label: "Email", type: "email" },
          ].map((f) => (
            <label key={f.label} className="block text-sm">
              <span className="text-muted-foreground">{f.label}</span>
              <input
                required
                type={f.type}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
          ))}
          <label className="block text-sm">
            <span className="text-muted-foreground">What do you need?</span>
            <textarea
              required
              rows={4}
              className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
          <button type="submit" className="btn-gold rounded-md py-3 text-sm">
            {sent ? "Enquiry Sent ✓" : "Send Enquiry"}
          </button>
        </form>
      </div>
    </>
  );
}
