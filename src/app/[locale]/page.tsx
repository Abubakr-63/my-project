import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");

  return (
    <main className="mx-auto max-w-5xl px-5 py-16 sm:py-24">
      <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-6xl">
        {t("title")}
      </h1>
      <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
        {t("description")}
      </p>
    </main>
  );
}
