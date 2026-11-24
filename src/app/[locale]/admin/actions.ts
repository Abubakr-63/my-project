"use server";

import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminLoginPath, getAdminAccess, requireAdmin } from "@/lib/admin/access";
import { isOrderStatus } from "@/lib/admin/orders";
import { isCartId } from "@/lib/cart";
import { routing } from "@/lib/routing";
import { createAdminClient } from "@/lib/supabase/admin-server";

export async function signIn(locale: string, form: FormData): Promise<{ ok: false; error: "credentials" }> {
  if (!hasLocale(routing.locales, locale)) return { ok: false, error: "credentials" };

  if (!(form instanceof FormData)) return { ok: false, error: "credentials" };
  const email = form.get("email");
  const password = form.get("password");
  if (typeof email !== "string" || typeof password !== "string" || !email.trim() ||
    email.length > 254 || !password || password.length > 1024) return { ok: false, error: "credentials" };

  let allowed: boolean;
  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) return { ok: false, error: "credentials" };
    const access = await getAdminAccess(supabase);
    allowed = !!access.user && access.allowed;
  } catch {
    return { ok: false, error: "credentials" };
  }

  redirect(allowed ? `/${locale}/admin/orders` : adminLoginPath(locale));
}

export async function signOut(locale: string) {
  if (!hasLocale(routing.locales, locale)) redirect(adminLoginPath(routing.defaultLocale));
  let failed = false;
  try {
    const client = await createAdminClient();
    const { error } = await client.auth.signOut({ scope: "local" });
    failed = !!error;
  } catch {
    failed = true;
  }
  redirect(adminLoginPath(locale) + (failed ? "?error=signout" : ""));
}

export async function updateOrderStatus(orderId: string, newStatus: string):
  Promise<{ ok: true } | { ok: false; error: "invalidStatus" | "saveError" }> {
  const locale = await getLocale();
  if (!hasLocale(routing.locales, locale)) redirect(adminLoginPath(routing.defaultLocale));
  const { supabase } = await requireAdmin(locale);
  if (!isCartId(orderId) || !isOrderStatus(newStatus)) return { ok: false, error: "invalidStatus" };

  try {
    const { data, error } = await supabase.from("orders")
      .update({ status: newStatus }).eq("id", orderId).select("id").maybeSingle();
    if (error || !data) return { ok: false, error: "saveError" };
  } catch {
    return { ok: false, error: "saveError" };
  }
  revalidatePath("/[locale]/admin/orders", "page");
  revalidatePath("/[locale]/admin/orders/[id]", "page");
  return { ok: true };
}
