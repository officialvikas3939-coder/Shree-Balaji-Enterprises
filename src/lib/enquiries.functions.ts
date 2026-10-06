import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const enquirySchema = z.object({
  kind: z.enum(["contact", "bulk"]),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^[0-9+\-\s]{8,15}$/, "Enter a valid phone number"),
  email: z.string().trim().email().max(200).or(z.literal("")).optional(),
  company: z.string().trim().max(160).optional(),
  subject: z.string().trim().max(200).optional(),
  message: z.string().trim().min(5).max(2000),
});

/** Public enquiry submission (contact form + bulk / dealer form). */
export const submitEnquiry = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => enquirySchema.parse(input))
  .handler(async ({ data }) => {
    const { createPublicServerClient } = await import("@/lib/supabase-public.server");
    const client = createPublicServerClient();
    const { error } = await client.from("enquiries").insert({
      kind: data.kind,
      name: data.name,
      phone: data.phone,
      email: data.email || null,
      company: data.company || null,
      subject: data.subject || null,
      message: data.message,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
