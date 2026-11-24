import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import type { ReactNode } from "react";
import { routing } from "@/lib/routing";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function AdminLayout({ children, params }: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const { Admin } = await getMessages({ locale });

  return (
    <NextIntlClientProvider messages={{ Admin }}>
      <main className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6">{children}</main>
    </NextIntlClientProvider>
  );
}
