import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FeaturedProducts } from "@/components/home/featured-products";
import { TourPhone } from "@/components/home/tour-phone";
import { ArrowForwardIcon, CategoryIcon, InventoryIcon, PhoneIcon, ReceiptIcon, SendIcon } from "@/components/ui/icons";
import { ui } from "@/components/ui/styles";
import { formatPrice, localizedName } from "@/lib/catalog-format";
import { loadHome } from "@/lib/home";
import { locales, type StoreLocale } from "@/lib/locales";
import { Link } from "@/lib/navigation";
import { routing } from "@/lib/routing";

const steps = [
  { key: "choose", Icon: CategoryIcon },
  { key: "packs", Icon: InventoryIcon },
  { key: "order", Icon: ReceiptIcon },
  { key: "contact", Icon: PhoneIcon },
] as const;

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale });
  const base = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const urlFor = (code: StoreLocale) => new URL(`/${code}`, base).href;
  const languages = Object.fromEntries(routing.locales.map((code) => [locales[code].hreflang, urlFor(code)]));
  return {
    title: `${t("Home.title")} | ${t("Site.name")}`,
    description: t("Home.description"),
    alternates: {
      canonical: urlFor(locale),
      languages: { ...languages, "x-default": urlFor(routing.defaultLocale) },
    },
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  await connection();
  const [t, { featured, categories, minimumOrder, phone }] = await Promise.all([
    getTranslations("Home"), loadHome(),
  ]);

  const catalogButton = (
    <Link href="/catalog" className={ui.primary} prefetch={false}>
      {t("openCatalog")}<ArrowForwardIcon size={18} />
    </Link>
  );

  return (
    <main className="home-tour mx-auto max-w-6xl space-y-12 px-4 py-6 sm:space-y-16 sm:px-6 sm:py-10">
      <section className="home-hero grid items-center gap-8 overflow-hidden rounded-m3-xl bg-primary-container p-5 text-on-primary-container sm:p-10 md:grid-cols-[minmax(0,1fr)_minmax(0,0.65fr)]">
        <div className="space-y-5">
          <h1 className="max-w-xl text-display-small tracking-tight sm:text-display-medium lg:text-display-large">{t("title")}</h1>
          <p className="max-w-xl text-body-large">{t("description")}</p>
          <div className="flex flex-wrap items-center gap-2">
            {catalogButton}
            <a href="#how" className={ui.secondary}>{t("howTitle")}</a>
          </div>
        </div>
        <TourPhone />
      </section>

      <section id="how" className="scroll-mt-24" aria-labelledby="how-title">
        <h2 id="how-title" className="mb-4 text-headline-medium">{t("howTitle")}</h2>
        <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ key, Icon }, index) => (
            <li key={key} className="home-step ui-card space-y-3 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="grid size-11 place-items-center rounded-m3-md bg-primary-container text-on-primary-container"><Icon size={22} /></span>
                <span aria-hidden="true" className="text-label-large text-on-surface-variant">{index + 1}</span>
              </div>
              <h3 className="text-title-medium">{t(`steps.${key}.title`)}</h3>
              <p className="text-body-medium text-on-surface-variant">{t(`steps.${key}.text`)}</p>
            </li>
          ))}
        </ol>
      </section>

      <FeaturedProducts products={featured} locale={locale} />

      {categories.length > 0 && (
        <section aria-labelledby="categories-title">
          <h2 id="categories-title" className="mb-4 text-headline-medium">{t("categoriesTitle")}</h2>
          <ul className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={{ pathname: "/catalog", query: { category: category.slug } }} className={ui.secondary} prefetch={false}>
                  {localizedName(category, locale)}<ArrowForwardIcon size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="ui-card grid gap-4 p-5 sm:grid-cols-[1fr_2fr] sm:p-8" aria-labelledby="terms-title">
        <h2 id="terms-title" className="text-headline-medium">{t("termsTitle")}</h2>
        <ul className="list-disc space-y-2 ps-5 text-body-large marker:text-primary">
          <li>{t("termsPacks")}</li>
          <li>{t("termsColor")}</li>
          {minimumOrder && (
            <li>{t("termsMinimum", { amount: formatPrice(minimumOrder.amount, minimumOrder.currency, locale) })}</li>
          )}
        </ul>
      </section>

      <section className="rounded-m3-xl bg-secondary-container p-5 text-on-secondary-container sm:p-8" aria-labelledby="final-title">
        <h2 id="final-title" className="mb-4 text-headline-medium">{t("finalTitle")}</h2>
        <div className="flex flex-wrap gap-2">
          {catalogButton}
          {phone && (
            <a href={`https://wa.me/${phone}`} target="_blank" rel="noopener noreferrer" className={`${ui.outlined} border-primary`}>
              <SendIcon size={18} />{t("whatsapp")}
            </a>
          )}
        </div>
      </section>
    </main>
  );
}
