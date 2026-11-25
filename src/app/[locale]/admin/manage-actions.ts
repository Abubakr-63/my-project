"use server";

import { redirect } from "next/navigation";
import { isCartId } from "@/lib/cart";
import { adminCatalogContext, catalogMutationError, revalidateCatalog, type CatalogResult } from "@/lib/admin/catalog-mutations";
import { validateCategory, validateColor, validateProduct, validateSetting } from "@/lib/admin/validation";
import { deleteProductColor } from "./catalog-actions";

const invalid = { ok: false, error: "invalidCatalog" } as const;
const saved = { ok: true } as const;

export async function saveCategory(id: string | null, form: FormData): Promise<CatalogResult> {
  const { supabase, locale } = await adminCatalogContext();
  const values = form instanceof FormData ? validateCategory(form) : null;
  if (!values || (id !== null && !isCartId(id))) return invalid;
  try {
    const table = supabase.from("categories");
    const { data, error } = await (id ? table.update(values).eq("id", id) : table.insert(values))
      .select("id").maybeSingle();
    if (error || !data) return catalogMutationError(error);
  } catch {
    return catalogMutationError(null);
  }
  revalidateCatalog();
  if (!id) redirect(`/${locale}/admin/categories`);
  return saved;
}

export async function saveProduct(id: string | null, form: FormData): Promise<CatalogResult> {
  const { supabase, locale } = await adminCatalogContext();
  const values = form instanceof FormData ? validateProduct(form) : null;
  if (!values || (id !== null && !isCartId(id))) return invalid;
  let productId: string;
  try {
    const table = supabase.from("products");
    const { data, error } = await (id ? table.update(values).eq("id", id) : table.insert({ ...values, is_active: false }))
      .select("id").maybeSingle();
    if (error || !data) return catalogMutationError(error);
    productId = data.id;
  } catch {
    return catalogMutationError(null);
  }
  revalidateCatalog();
  if (!id) redirect(`/${locale}/admin/products/${productId}`);
  return saved;
}

export async function setProductActive(id: string, active: boolean): Promise<CatalogResult> {
  const { supabase } = await adminCatalogContext();
  if (!isCartId(id) || typeof active !== "boolean") return invalid;

  try {
    if (active) {
      const colors = await supabase.from("product_colors").select("id").eq("product_id", id).limit(1);
      if (colors.error) return catalogMutationError(colors.error);
      if (!colors.data.length) return { ok: false, error: "colorRequired" };
    }
    const { data, error } = await supabase.from("products").update({ is_active: active })
      .eq("id", id).select("id").maybeSingle();
    if (error || !data) return catalogMutationError(error);
  } catch {
    return catalogMutationError(null);
  }
  revalidateCatalog();
  return saved;
}

export async function saveColor(productId: string, id: string | null, form: FormData): Promise<CatalogResult> {
  const { supabase } = await adminCatalogContext();
  const values = form instanceof FormData ? validateColor(form, process.env.NEXT_PUBLIC_SUPABASE_URL) : null;
  if (!values || !isCartId(productId) || (id !== null && !isCartId(id))) return invalid;

  try {
    const table = supabase.from("product_colors");
    const { data, error } = await (id
      ? table.update(values).eq("id", id).eq("product_id", productId)
      : table.insert({ ...values, product_id: productId })).select("id").maybeSingle();
    if (error || !data) return catalogMutationError(error);
  } catch {
    return catalogMutationError(null);
  }
  revalidateCatalog();
  return saved;
}

export async function removeColor(id: string): Promise<CatalogResult> {
  const { supabase } = await adminCatalogContext();
  if (!isCartId(id)) return invalid;
  try {
    const row = await supabase.from("product_colors")
      .select("product_id, products(is_active)").eq("id", id).maybeSingle();
    if (row.error || !row.data) return catalogMutationError(row.error);
    if (row.data.products?.is_active) {
      const sibling = await supabase.from("product_colors").select("id")
        .eq("product_id", row.data.product_id).neq("id", id).limit(1);
      if (sibling.error) return catalogMutationError(sibling.error);
      if (!sibling.data.length) return { ok: false, error: "lastActiveColor" };
    }
  } catch {
    return catalogMutationError(null);
  }
  return deleteProductColor(id);
}

export async function saveSetting(key: string, form: FormData): Promise<CatalogResult> {
  const { supabase } = await adminCatalogContext();
  const values = form instanceof FormData ? validateSetting(key, form) : null;
  if (!values) return invalid;
  try {
    const { data, error } = await supabase.from("settings").update({ value: values.value })
      .eq("key", values.key).select("key").maybeSingle();
    if (error || !data) return catalogMutationError(error);
  } catch {
    return catalogMutationError(null);
  }
  revalidateCatalog();
  return saved;
}
