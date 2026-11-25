import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { NameFields, SlugField, SortField } from "@/components/admin/catalog-fields";
import { CatalogForm } from "@/components/admin/catalog-form";
import { requireAdmin } from "@/lib/admin/access";
import { localizedName } from "@/lib/catalog-format";
import { Link } from "@/lib/navigation";
import { routing } from "@/lib/routing";
import { deleteCategory } from "../catalog-actions";
import { saveCategory } from "../manage-actions";

export default async function CategoriesPage({ params }: PageProps<"/[locale]/admin/categories">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const { supabase } = await requireAdmin(locale);
  const t = await getTranslations("Admin");
  const { data, error } = await supabase.from("categories").select("*").order("sort_order").order("id");
  if (error) throw new Error("Categories unavailable");

  return (
    <>
      <AdminNav locale={locale} />
      <h1 className="text-3xl font-semibold">{t("categories")}</h1>
      <details className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
        <summary className="min-h-11 cursor-pointer rounded py-2 font-semibold focus-visible:outline-2">{t("newCategory")}</summary>
        <CatalogForm action={saveCategory.bind(null, null)}>
          <NameFields /><SlugField /><SortField />
        </CatalogForm>
      </details>
      {!data.length && <p>{t("noCategories")}</p>}
      <ul className="space-y-2">
        {data.map((category) => (
          <li key={category.id} className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-stone-200 bg-white p-4">
            <div>
              <Link prefetch={false} href={`/admin/categories/${category.id}`} className="inline-flex min-h-11 items-center underline focus-visible:outline-2">
                {localizedName(category, locale)}
              </Link>
              <p className="text-sm text-stone-600">{category.slug}</p>
            </div>
            <CatalogForm action={deleteCategory.bind(null, category.id)} label="delete" confirm />
          </li>
        ))}
      </ul>
    </>
  );
}
