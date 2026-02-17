"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getSession } from "@aradhya/shared";
import { getSupabaseClient } from "@/lib/supabase";

const PUBLIC_PATHS = ["/login"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = getSupabaseClient();

  useEffect(() => {
    let mounted = true;

    getSession(supabase)
      .then((session) => {
        if (mounted) setAuthenticated(Boolean(session));
      })
      .finally(() => {
        if (mounted) setReady(true);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(Boolean(session));
      setReady(true);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!ready) return;

    const isPublic = PUBLIC_PATHS.includes(pathname);

    if (!authenticated && !isPublic) {
      router.replace("/login");
      return;
    }

    if (authenticated && pathname === "/login") {
      router.replace("/");
    }
  }, [ready, authenticated, pathname, router]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-green-700">
        Loading...
      </div>
    );
  }

  if (!authenticated && !PUBLIC_PATHS.includes(pathname)) {
    return null;
  }

  return <>{children}</>;
}
