import { getTranslations } from "next-intl/server";
import { saveProduct } from "@/app/[locale]/admin/manage-actions";
import { seasons } from "@/lib/catalog";
import { localizedName, type StoreLocale } from "@/lib/catalog-format";
import type { Database } from "@/lib/database.types";
import { fieldClass, NameFields, SlugField } from "./catalog-fields";
import { CatalogForm } from "./catalog-form";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Category = Pick<Database["public"]["Tables"]["categories"]["Row"], "id" | "name_ru" | "name_tg" | "name_en">;

export async function ProductForm({ product, categories, locale }: {
  product?: Product; categories: Category[]; locale: StoreLocale;
}) {
  const t = await getTranslations("Admin");
  const catalog = await getTranslations("Catalog");
  return (
    <CatalogForm action={saveProduct.bind(null, product?.id ?? null)}>
      <NameFields values={product} />
      <SlugField value={product?.slug} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label>{t("categories")}
          <select name="category_id" defaultValue={product?.category_id ?? ""} required className={fieldClass}>
            <option value="" disabled>{t("chooseCategory")}</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{localizedName(category, locale)}</option>)}
          </select>
        </label>
        <label>{t("season")}
          <select name="season" defaultValue={product?.season ?? "all"} className={fieldClass}>
            {seasons.map((season) => <option key={season} value={season}>{catalog(`seasons.${season}`)}</option>)}
          </select>
        </label>
        <label>{t("unitPrice")}
          <input type="number" name="price_per_pair" min={0} max={9999999999.99} step="0.01" required
            defaultValue={product?.price_per_pair} className={fieldClass} />
        </label>
        <label>{t("pairsPerPack")}
          <input type="number" name="pairs_per_pack" min={1} max={2147483647} required
            defaultValue={product?.pairs_per_pack} className={fieldClass} />
        </label>
        <label>{t("minPacks")}
          <input type="number" name="min_packs" min={1} max={10000} required defaultValue={product?.min_packs ?? 1} className={fieldClass} />
        </label>
        <label>{t("sizeRange")}
          <input name="size_range" maxLength={80} required defaultValue={product?.size_range ?? ""} className={fieldClass} />
        </label>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {(["ru", "tg", "en"] as const).map((language) => {
          const key = `description_${language}` as const;
          return <label key={key}>{t("descriptionLanguage", { language: t(`languages.${language}`) })}
            <textarea name={key} maxLength={5000} rows={4} defaultValue={product?.[key] ?? ""} className={fieldClass} />
          </label>;
        })}
      </div>
    </CatalogForm>
  );
}
