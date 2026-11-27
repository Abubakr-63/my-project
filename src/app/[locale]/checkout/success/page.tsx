import { ui } from "@/components/ui/styles";
import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { WhatsAppButton } from "@/components/checkout/whatsapp-button";
import { validOrderNumber } from "@/lib/checkout/summary";
import { normalizeWhatsAppNumber } from "@/lib/checkout/whatsapp";
import { Link } from "@/lib/navigation";
import { routing } from "@/lib/routing";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { robots: { index: false } };

async function getShopPhone() {
  try {
    const supabase = await createClient({ anonymous: true });
    const { data } = await supabase.from("settings").select("value").eq("key", "whatsapp_number").maybeSingle();
    return normalizeWhatsAppNumber(data?.value);
  } catch {
    return null;
  }
}

export default async function SuccessPage({ params, searchParams }: PageProps<"/[locale]/checkout/success">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const { order } = await searchParams;
  const t = await getTranslations({ locale, namespace: "OrderSuccess" });

  if (!validOrderNumber(order)) return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-8">
      <h1 className="text-2xl font-semibold">{t("invalid")}</h1>
      <Link href="/catalog" className={ui.link}>{t("catalog")}</Link>
    </main>
  );

  const phone = await getShopPhone();
  return (
    <main className="mx-auto max-w-xl px-4 py-8 sm:py-12">
      <section className="space-y-4 ui-card p-5 sm:p-7">
        <h1 className="text-2xl font-semibold">{t("accepted", { orderNumber: order })}</h1>
        <p>{t("saved")}</p>
        <div className="flex flex-wrap items-center gap-4">
          {phone && <WhatsAppButton key={order} phone={phone} orderNumber={order} label={t("whatsapp")} />}
          <Link href="/catalog" className={ui.link}>{t("catalog")}</Link>
        </div>
      </section>
    </main>
  );
}
