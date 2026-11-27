import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { NameFields, SlugField, SortField } from "@/components/admin/catalog-fields";
import { CatalogForm } from "@/components/admin/catalog-form";
import { requireAdmin } from "@/lib/admin/access";
import { isCartId } from "@/lib/cart";
import { routing } from "@/lib/routing";
import { saveCategory } from "../../manage-actions";

export default async function EditCategoryPage({ params }: PageProps<"/[locale]/admin/categories/[id]">) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const { supabase } = await requireAdmin(locale);
  if (!isCartId(id)) notFound();
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error("Category unavailable");
  if (!data) notFound();
  const t = await getTranslations("Admin");
  return (
    <>
      <AdminNav locale={locale} />
      <h1 className="text-headline-large font-medium">{t("editCategory")}</h1>
      <CatalogForm action={saveCategory.bind(null, id)}>
        <NameFields values={data} /><SlugField value={data.slug} /><SortField value={data.sort_order} />
      </CatalogForm>
    </>
  );
}
