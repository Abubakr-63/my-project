import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import { getSupabaseConfig } from "./config";

export async function createAdminClient() {
  const { url, anonKey } = getSupabaseConfig();
  const store = await cookies();
  return createServerClient<Database>(url, anonKey, {
    cookieOptions: { httpOnly: true, secure: process.env.NODE_ENV === "production" },
    global: { fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }) },
    cookies: {
      getAll: () => store.getAll(),
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) store.set(name, value, options);
        } catch (error) {
          // Server Components cannot write cookies. The admin proxy handles refresh.
          if (!(error instanceof Error) || !error.message.startsWith("Cookies can only be modified")) throw error;
        }
      },
    },
  });
}
