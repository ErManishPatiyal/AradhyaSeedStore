import type { Session } from "@supabase/supabase-js";
import type { TypedSupabaseClient } from "../supabase/client";

export async function signInWithPassword(
  client: TypedSupabaseClient,
  email: string,
  password: string
): Promise<Session> {
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error) throw error;
  if (!data.session) throw new Error("Sign in succeeded but no session was returned");

  return data.session;
}

export async function signOut(client: TypedSupabaseClient): Promise<void> {
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

export async function getSession(client: TypedSupabaseClient): Promise<Session | null> {
  const { data, error } = await client.auth.getSession();
  if (error) throw error;
  return data.session;
}
