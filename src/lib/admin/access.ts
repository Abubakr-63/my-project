import { redirect } from "next/navigation";
import type { StoreLocale } from "@/lib/catalog-format";
import { createAdminClient } from "@/lib/supabase/admin-server";

export function adminLoginPath(locale: StoreLocale) {
  return `/${locale}/admin/login`;
}

export async function getAdminAccess(supabase?: Awaited<ReturnType<typeof createAdminClient>>) {
  const client = supabase ?? await createAdminClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user) return { client, user: null, allowed: false } as const;

  const membership = await client.rpc("is_admin");
  return { client, user: data.user, allowed: !membership.error && membership.data === true } as const;
}

export async function requireAdmin(locale: StoreLocale) {
  const access = await getAdminAccess();
  if (!access.user || !access.allowed) redirect(adminLoginPath(locale));
  return { supabase: access.client, user: access.user };
}
