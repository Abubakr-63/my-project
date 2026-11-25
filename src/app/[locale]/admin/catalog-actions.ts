"use server";

import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminLoginPath, requireAdmin } from "@/lib/admin/access";
import { isCartId } from "@/lib/cart";
import { routing } from "@/lib/routing";

type CatalogTable = "categories" | "products" | "product_colors";

type DeleteResult =
  | { ok: true }
  | { ok: false; error: "categoryInUse" | "productHasOrders" | "catalogDeleteFailed" };

async function deleteCatalogRow(table: CatalogTable, id: string): Promise<DeleteResult> {
  const locale = await getLocale();
  if (!hasLocale(routing.locales, locale)) redirect(adminLoginPath(routing.defaultLocale));
  const { supabase } = await requireAdmin(locale);
  if (!isCartId(id)) return { ok: false, error: "catalogDeleteFailed" };

  try {
    const { data, error } = await supabase.from(table).delete().eq("id", id).select("id").maybeSingle();
    if (error?.code === "23503") {
      return { ok: false, error: table === "categories" ? "categoryInUse" : "productHasOrders" };
    }
    if (error || !data) return { ok: false, error: "catalogDeleteFailed" };
  } catch {
    return { ok: false, error: "catalogDeleteFailed" };
  }

  revalidatePath("/[locale]/catalog", "page");
  revalidatePath("/[locale]/catalog/[slug]", "page");
  return { ok: true };
}

export async function deleteCategory(id: string) {
  return deleteCatalogRow("categories", id);
}

export async function deleteProduct(id: string) {
  return deleteCatalogRow("products", id);
}

export async function deleteProductColor(id: string) {
  return deleteCatalogRow("product_colors", id);
}
