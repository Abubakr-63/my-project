import { getTranslations } from "next-intl/server";

export const fieldClass = "mt-1 block min-h-11 w-full rounded-md border border-stone-300 bg-white px-3 py-2 focus-visible:outline-2";

type Names = { name_ru: string; name_tg: string | null; name_en: string | null };

export async function NameFields({ values }: { values?: Names }) {
  const t = await getTranslations("Admin");
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {(["ru", "tg", "en"] as const).map((locale) => {
        const key = `name_${locale}` as const;
        return (
          <label key={locale}>{t("nameLanguage", { language: t(`languages.${locale}`) })}
            <input name={key} defaultValue={values?.[key] ?? ""} required={locale === "ru"} maxLength={160} className={fieldClass} />
          </label>
        );
      })}
    </div>
  );
}

export async function SlugField({ value }: { value?: string }) {
  const t = await getTranslations("Admin");
  return (
    <label className="block">{t("slug")}
      <input name="slug" defaultValue={value ?? ""} required maxLength={100}
        pattern="[a-z0-9]+(?:-[a-z0-9]+)*" className={fieldClass} />
    </label>
  );
}

export async function SortField({ value }: { value?: number }) {
  const t = await getTranslations("Admin");
  return (
    <label className="block">{t("sortOrder")}
      <input type="number" name="sort_order" min={0} max={2147483647} defaultValue={value ?? 0} required className={fieldClass} />
    </label>
  );
}
