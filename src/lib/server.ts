import { createClient } from "@supabase/supabase-js";

// Server-only helpers. These use secret keys and must never be imported by
// browser code.

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const anon = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim();
const service = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").trim();
const stripeKey = (process.env.STRIPE_SECRET_KEY ?? "").trim();

export const serverConfigured = !!(url && anon && service && stripeKey);

export function adminClient() {
  return createClient(url, service, { auth: { persistSession: false } });
}

// Works out who is calling, from the sign-in token the browser sends.
export async function userFromRequest(req: Request) {
  const token = (req.headers.get("authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const { data } = await createClient(url, anon, {
    auth: { persistSession: false },
  }).auth.getUser(token);
  return data.user ?? null;
}

// Minimal Stripe REST client (no extra package needed).
export async function stripe<T = Record<string, unknown>>(
  path: string,
  params: Record<string, string> = {},
  method: "POST" | "GET" = "POST"
): Promise<T> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(
    `https://api.stripe.com/v1${path}${method === "GET" && qs ? `?${qs}` : ""}`,
    {
      method,
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        ...(method === "POST"
          ? { "Content-Type": "application/x-www-form-urlencoded" }
          : {}),
      },
      body: method === "POST" ? qs : undefined,
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json?.error?.message ?? "Stripe error");
  return json as T;
}
