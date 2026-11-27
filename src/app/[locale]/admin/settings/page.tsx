import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { fieldClass } from "@/components/admin/catalog-fields";
import { CatalogForm } from "@/components/admin/catalog-form";
import { requireAdmin } from "@/lib/admin/access";
import { settingKeys } from "@/lib/admin/validation";
import { routing } from "@/lib/routing";
import { saveSetting } from "../manage-actions";

export default async function SettingsPage({ params }: PageProps<"/[locale]/admin/settings">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const { supabase } = await requireAdmin(locale);
  const { data, error } = await supabase.from("settings").select("key,value").in("key", settingKeys);
  if (error) throw new Error("Settings unavailable");
  const t = await getTranslations("Admin");

  return (
    <>
      <AdminNav locale={locale} />
      <h1 className="text-headline-large font-medium">{t("settings")}</h1>
      <div className="grid max-w-xl gap-3">
        {settingKeys.map((key) => (
          <section key={key} className="ui-card-outlined p-4">
            <CatalogForm action={saveSetting.bind(null, key)}>
              <label className="block">{t(`settingLabels.${key}`)}
                <input name="value" type={key === "whatsapp_number" ? "tel" : "text"}
                  inputMode={key === "min_order_amount" ? "decimal" : undefined} maxLength={40}
                  required={key !== "whatsapp_number"}
                  defaultValue={data.find((entry) => entry.key === key)?.value ?? ""} className={fieldClass} />
              </label>
            </CatalogForm>
          </section>
        ))}
      </div>
    </>
  );
}
