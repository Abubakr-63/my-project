import { locales, type DatabaseLocale, type StoreLocale } from "./locales";

export type { StoreLocale } from "./locales";

export function localizedField<Field extends "name" | "description">(
  item: Record<`${Field}_${DatabaseLocale}`, string | null>,
  field: Field,
  locale: StoreLocale,
) {
  return item[`${field}_${locales[locale].dbLocale}`]?.trim() || item[`${field}_ru`]?.trim() || null;
}

export function localizedName(
  item: { name_ru: string; name_tg: string | null; name_en: string | null },
  locale: StoreLocale,
) {
  return localizedField(item, "name", locale) ?? item.name_ru;
}

export function formatPrice(amount: number, currency: string, locale: StoreLocale) {
  return new Intl.NumberFormat(locales[locale].intlLocale, {
    style: "currency",
    currency,
    currencyDisplay: "code",
  }).format(amount);
}
