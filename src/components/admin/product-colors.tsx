import { getTranslations } from "next-intl/server";
import { removeColor, saveColor } from "@/app/[locale]/admin/manage-actions";
import { localizedName, type StoreLocale } from "@/lib/catalog-format";
import { productImageSource } from "@/lib/product-images";
import type { Database } from "@/lib/database.types";
import { fieldClass, NameFields, SortField } from "./catalog-fields";
import { CatalogForm } from "./catalog-form";
import { ColorEditor } from "./color-editor";

type Color = Database["public"]["Tables"]["product_colors"]["Row"];

async function ColorForm({ productId, color, locale }: { productId: string; color?: Color; locale: StoreLocale }) {
  const t = await getTranslations("Admin");
  return (
    <ColorEditor colorId={color?.id} colorName={color ? localizedName(color, locale) : ""}
      images={color?.image_urls.map((url) => ({ url, preview: productImageSource(url) })) ?? []}
      action={saveColor.bind(null, productId, color?.id ?? null)}
      deleteControl={color && <CatalogForm action={removeColor.bind(null, color.id)} label="delete" confirm />}>
      <NameFields values={color} />
      <SortField value={color?.sort_order} />
      <details className="space-y-2">
        <summary className="min-h-11 cursor-pointer rounded-m3-xs py-2 text-sm font-medium focus-visible:outline-2">
          {t("advancedPhotoOptions")}
        </summary>
        <label className="block">{t("imageUrls")}
          <textarea key={color?.image_urls.join("\n")} name="image_urls" rows={3} maxLength={5009} className={fieldClass}
            defaultValue={color?.image_urls.join("\n") ?? ""} />
        </label>
      </details>
    </ColorEditor>
  );
}

export async function ProductColors({ productId, colors, locale }: {
  productId: string; colors: Color[]; locale: StoreLocale;
}) {
  const t = await getTranslations("Admin");
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{t("colors")}</h2>
      <details className="space-y-3 ui-card p-4">
        <summary className="min-h-11 cursor-pointer rounded-m3-xs py-2 font-semibold focus-visible:outline-2">{t("addColor")}</summary>
        <ColorForm productId={productId} locale={locale} />
      </details>
      {colors.map((color) => (
        <details key={color.id} className="space-y-3 ui-card p-4">
          <summary className="min-h-11 cursor-pointer rounded-m3-xs py-2 font-semibold focus-visible:outline-2">{localizedName(color, locale)}</summary>
          <ColorForm productId={productId} color={color} locale={locale} />
        </details>
      ))}
    </section>
  );
}
