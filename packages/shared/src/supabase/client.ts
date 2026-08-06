import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database";
import { validateSupabaseConfig, type SupabaseConfig } from "./config";

export type TypedSupabaseClient = SupabaseClient<Database>;

/**
 * Factory for a typed Supabase client.
 * Call from PWA or mobile with platform-specific env vars.
 */
export function createSupabaseClient(config: SupabaseConfig): TypedSupabaseClient {
  validateSupabaseConfig(config);
  return createClient<Database>(config.url, config.anonKey);
}

export { validateSupabaseConfig };
export type { SupabaseConfig };
