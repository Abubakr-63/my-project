import type { Metadata } from "next";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { CartProvider } from "@/components/cart/cart-provider";
import { ThemeScript } from "@/components/ui/theme-script";
import { ThemeSync } from "@/components/ui/theme-sync";
import { Header } from "@/components/header";
import { locales } from "@/lib/locales";
import { themeBootstrap } from "@/lib/theme";
import { routing } from "@/lib/routing";
import "../globals.css";

type LocaleParams = { params: Promise<{ locale: string }> };

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LocaleParams): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const t = await getTranslations({ locale, namespace: "Site" });
  return { title: t("name"), description: t("description") };
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleParams & { children: ReactNode }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const { CartLink, Menu } = await getMessages({ locale });

  return (
    <html lang={locales[locale].htmlLang} suppressHydrationWarning>
      <head>
        <ThemeScript source={themeBootstrap} />
      </head>
      <body className="min-h-screen bg-background text-on-surface antialiased">
        <ThemeSync locale={locale} />
        <NextIntlClientProvider messages={{ CartLink, Menu }}>
          <CartProvider>
            <Header locale={locale} />
            {children}
          </CartProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
