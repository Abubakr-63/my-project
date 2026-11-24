import { hasLocale } from "next-intl";
import { notFound, redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/access";
import { routing } from "@/lib/routing";

export default async function AdminIndex({ params }: PageProps<"/[locale]/admin">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  await requireAdmin(locale);
  redirect(`/${locale}/admin/orders`);
}
