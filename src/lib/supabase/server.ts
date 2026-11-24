import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/lib/database.types";
import { getSupabaseConfig } from "./config";

export async function createClient({ anonymous = false } = {}) {
  const { url, anonKey } = getSupabaseConfig();
  if (anonymous) {
    return createServerClient<Database>(url, anonKey, {
      cookies: { getAll: () => [], setAll: () => {} },
    });
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch (error) {
          // Server Components can read cookies. Auth refresh needs a writable response.
          if (
            !(error instanceof Error) ||
            !error.message.startsWith("Cookies can only be modified")
          ) {
            throw error;
          }
        }
      },
    },
  });
}
