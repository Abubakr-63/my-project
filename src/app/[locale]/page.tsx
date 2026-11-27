import { ArrowForwardIcon, StoreIcon } from "@/components/ui/icons";
import { ui } from "@/components/ui/styles";
import { Link } from "@/lib/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-12">
      <section className="grid gap-8 rounded-m3-xl bg-primary-container p-6 text-on-primary-container sm:grid-cols-[1fr_auto] sm:items-center sm:p-12">
        <div className="space-y-5">
          <h1 className="max-w-2xl text-display-small tracking-tight sm:text-display-medium">{t("Home.title")}</h1>
          <p className="max-w-xl text-body-large">{t("Home.description")}</p>
          <Link href="/catalog" className={ui.primary}>{t("Menu.catalog")}<ArrowForwardIcon size={18} /></Link>
        </div>
        <div aria-hidden="true" className="hidden size-40 place-items-center rounded-m3-xl bg-surface-container-high text-primary sm:grid lg:size-56">
          <StoreIcon size={88} />
        </div>
      </section>
    </main>
  );
}
