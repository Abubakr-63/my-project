import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/admin/access";
import { routing } from "@/lib/routing";

export default async function NewProductPage({ params }: PageProps<"/[locale]/admin/products/new">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const { supabase } = await requireAdmin(locale);
  const t = await getTranslations("Admin");
  const { data, error } = await supabase.from("categories").select("id,name_ru,name_tg,name_en").order("sort_order").order("id");
  if (error) throw new Error("Categories unavailable");

  return (
    <>
      <AdminNav locale={locale} />
      <h1 className="text-3xl font-semibold">{t("newProduct")}</h1>
      <p>{t("draftHint")}</p>
      <ProductForm categories={data} locale={locale} />
    </>
  );
}
