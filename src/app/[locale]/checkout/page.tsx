import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { routing } from "@/lib/routing";

export const metadata: Metadata = { robots: { index: false } };

export default async function CheckoutPage({ params }: PageProps<"/[locale]/checkout">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const [t, { Checkout }] = await Promise.all([
    getTranslations({ locale, namespace: "Checkout" }), getMessages({ locale }),
  ]);

  return (
    <main className="mx-auto max-w-xl space-y-5 px-4 py-8">
      <h1 className="text-headline-large font-medium">{t("title")}</h1>
      <NextIntlClientProvider messages={{ Checkout }}>
        <CheckoutForm locale={locale} />
      </NextIntlClientProvider>
    </main>
  );
}
