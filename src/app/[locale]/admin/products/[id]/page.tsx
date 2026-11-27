import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { CatalogForm } from "@/components/admin/catalog-form";
import { ProductColors } from "@/components/admin/product-colors";
import { ProductForm } from "@/components/admin/product-form";
import { requireAdmin } from "@/lib/admin/access";
import { isCartId } from "@/lib/cart";
import { routing } from "@/lib/routing";
import { setProductActive } from "../../manage-actions";

export default async function EditProductPage({ params }: PageProps<"/[locale]/admin/products/[id]">) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const { supabase } = await requireAdmin(locale);
  if (!isCartId(id)) notFound();
  const [product, categories, colors] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id,name_ru,name_tg,name_en").order("sort_order").order("id"),
    supabase.from("product_colors").select("*").eq("product_id", id).order("sort_order").order("id"),
  ]);
  if (product.error || categories.error || colors.error) throw new Error("Product unavailable");
  if (!product.data) notFound();
  const t = await getTranslations("Admin");

  return (
    <>
      <AdminNav locale={locale} />
      <h1 className="text-headline-large font-medium">{t("editProduct")}</h1>
      <div className="ui-card p-4">
        <p className="mb-2">{t(product.data.is_active ? "active" : "inactive")}</p>
        <CatalogForm action={setProductActive.bind(null, id, !product.data.is_active)}
          label={product.data.is_active ? "deactivate" : "activate"} />
      </div>
      <ProductForm product={product.data} categories={categories.data} locale={locale} />
      <ProductColors productId={id} colors={colors.data} locale={locale} />
    </>
  );
}
