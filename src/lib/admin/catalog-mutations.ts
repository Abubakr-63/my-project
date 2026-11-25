import { hasLocale } from "next-intl";
import { getLocale } from "next-intl/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { routing } from "@/lib/routing";
import { adminLoginPath, requireAdmin } from "./access";

type MutationError = "invalidCatalog" | "duplicateSlug" | "colorRequired" | "lastActiveColor" | "catalogSaveFailed";
export type CatalogResult =
  | { ok: true }
  | { ok: false; error: MutationError | "categoryInUse" | "productHasOrders" | "catalogDeleteFailed" };

export async function adminCatalogContext() {
  const locale = await getLocale();
  if (!hasLocale(routing.locales, locale)) redirect(adminLoginPath(routing.defaultLocale));
  return { ...await requireAdmin(locale), locale };
}

export function catalogMutationError(error: { code: string } | null) {
  if (error?.code === "23505") return { ok: false, error: "duplicateSlug" } as const;
  if (error?.code === "SH001") return { ok: false, error: "colorRequired" } as const;
  if (error?.code === "SH002") return { ok: false, error: "lastActiveColor" } as const;
  return { ok: false, error: "catalogSaveFailed" } as const;
}

export function revalidateCatalog() {
  revalidatePath("/[locale]/catalog", "page");
  revalidatePath("/[locale]/catalog/[slug]", "page");
}
