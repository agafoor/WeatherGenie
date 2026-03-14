import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  // Use fallback placeholders so createBrowserClient doesn't throw during
  // build-time server-side pre-rendering of client components.
  // Real values are required in .env.local for the app to function.
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key"
  );
}
