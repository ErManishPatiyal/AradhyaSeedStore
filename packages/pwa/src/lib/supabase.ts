import { createSupabaseClient } from "@aradhya/shared";

/**
 * Singleton Supabase client for the PWA.
 * Uses NEXT_PUBLIC_ env vars (safe with RLS enabled).
 */
export function getSupabaseClient() {
  return createSupabaseClient({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  });
}
