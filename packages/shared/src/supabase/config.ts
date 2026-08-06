import type { Database } from "./database";

export type { Database };

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Validates Supabase config before client creation.
 * Throws early so UI layers fail fast on missing env vars.
 */
export function validateSupabaseConfig(config: SupabaseConfig): void {
  if (!config.url || !config.anonKey) {
    throw new Error(
      "Missing Supabase configuration. Set SUPABASE_URL and SUPABASE_ANON_KEY (or platform-specific NEXT_PUBLIC_/EXPO_PUBLIC_ prefixes)."
    );
  }
}
