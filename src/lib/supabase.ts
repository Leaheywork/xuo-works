import { createClient } from "@supabase/supabase-js";

// Browser-safe connection to the XUO.WORKS database and sign-in system.
// The URL and publishable key are public by design; data is protected by
// row-level security rules set in Supabase.
const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const rawKey = (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "").trim();

function isValidUrl(u: string) {
  try {
    const parsed = new URL(u);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export const supabaseConfigured = isValidUrl(rawUrl) && rawKey !== "";

// If the settings are missing or wrong, use harmless placeholders so the
// site still builds; the Account page then says accounts aren't connected.
export const supabase = createClient(
  supabaseConfigured ? rawUrl : "https://placeholder.supabase.co",
  supabaseConfigured ? rawKey : "placeholder"
);
