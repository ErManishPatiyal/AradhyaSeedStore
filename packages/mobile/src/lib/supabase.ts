import { createSupabaseClient } from "@aradhya/shared";

/**
 * Supabase client for the mobile app.
 * Uses EXPO_PUBLIC_ env vars (inlined at build time by Expo).
 */
export function getSupabaseClient() {
  return createSupabaseClient({
    url: process.env.EXPO_PUBLIC_SUPABASE_URL ?? "",
    anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "",
  });
}
