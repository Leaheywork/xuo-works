import { createClient } from "@supabase/supabase-js";

// Browser-safe connection to the XUO.WORKS database and sign-in system.
// The URL and publishable key are public by design; data is protected by
// row-level security rules set in Supabase.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

export const supabaseConfigured = url !== "" && key !== "";

export const supabase = createClient(
  url || "https://placeholder.supabase.co",
  key || "placeholder"
);
