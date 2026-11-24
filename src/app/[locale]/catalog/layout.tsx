import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async function CatalogLayout({ children }: { children: ReactNode }) {
  const { CatalogError } = await getMessages();

  return (
    <NextIntlClientProvider messages={{ CatalogError }}>
      {children}
    </NextIntlClientProvider>
  );
}
