import { getTranslations } from "next-intl/server";
import { removeColor, saveColor } from "@/app/[locale]/admin/manage-actions";
import { localizedName, type StoreLocale } from "@/lib/catalog-format";
import { productImageSource } from "@/lib/product-images";
import type { Database } from "@/lib/database.types";
import { fieldClass, NameFields, SortField } from "./catalog-fields";
import { CatalogForm } from "./catalog-form";
import { ColorImages } from "./color-images";

type Color = Database["public"]["Tables"]["product_colors"]["Row"];

async function ColorForm({ productId, color }: { productId: string; color?: Color }) {
  const t = await getTranslations("Admin");
  return (
    <CatalogForm action={saveColor.bind(null, productId, color?.id ?? null)}>
      <NameFields values={color} />
      <SortField value={color?.sort_order} />
      <label className="block">{t("imageUrls")}
        <textarea key={color?.image_urls.join("\n")} name="image_urls" rows={3} maxLength={5009} className={fieldClass}
          defaultValue={color?.image_urls.join("\n") ?? ""} />
      </label>
    </CatalogForm>
  );
}

export async function ProductColors({ productId, colors, locale }: {
  productId: string; colors: Color[]; locale: StoreLocale;
}) {
  const t = await getTranslations("Admin");
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">{t("colors")}</h2>
      <details className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
        <summary className="min-h-11 cursor-pointer rounded py-2 font-semibold focus-visible:outline-2">{t("addColor")}</summary>
        <ColorForm productId={productId} />
      </details>
      {colors.map((color) => (
        <details key={color.id} className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
          <summary className="min-h-11 cursor-pointer rounded py-2 font-semibold focus-visible:outline-2">{localizedName(color, locale)}</summary>
          <ColorImages colorId={color.id} colorName={localizedName(color, locale)}
            images={color.image_urls.map((url) => ({ url, preview: productImageSource(url) }))}>
            <ColorForm productId={productId} color={color} />
            <CatalogForm action={removeColor.bind(null, color.id)} label="delete" confirm />
          </ColorImages>
        </details>
      ))}
    </section>
  );
}
