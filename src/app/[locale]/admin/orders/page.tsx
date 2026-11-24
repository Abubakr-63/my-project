import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { OrdersList } from "@/components/admin/orders-list";
import { requireAdmin } from "@/lib/admin/access";
import { orderFilters, ORDER_PAGE_SIZE, orderStatuses } from "@/lib/admin/orders";
import { loadCatalogCurrency } from "@/lib/catalog";
import { Link } from "@/lib/navigation";
import { routing } from "@/lib/routing";

export default async function AdminOrdersPage({ params, searchParams }: PageProps<"/[locale]/admin/orders">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const { supabase } = await requireAdmin(locale);
  const filter = orderFilters(await searchParams);
  const offset = (filter.page - 1) * ORDER_PAGE_SIZE;
  let query = supabase.from("orders")
    .select("id, order_number, created_at, customer_name, total_amount, status", { count: "exact" })
    .order("created_at", { ascending: false }).order("order_number", { ascending: false });

  if (filter.status !== "all") query = query.eq("status", filter.status);
  if (filter.phonePattern) {
    const phone = `customer_phone.match.${filter.phonePattern}`;
    query = filter.orderNumber
      ? query.or(`order_number.eq.${filter.orderNumber},${phone}`)
      : query.filter("customer_phone", "match", filter.phonePattern);
  }

  const [t, currency, result] = await Promise.all([
    getTranslations({ locale, namespace: "Admin" }),
    loadCatalogCurrency(supabase),
    query.range(offset, offset + ORDER_PAGE_SIZE - 1),
  ]);
  if (result.error && result.error.code !== "PGRST103") throw new Error("Admin orders unavailable");

  const pages = Math.max(1, Math.ceil((result.count ?? 0) / ORDER_PAGE_SIZE));
  const pageLink = (page: number) => ({
    pathname: "/admin/orders", query: { page, status: filter.status, q: filter.q },
  });
  const control = "min-h-11 rounded-md border border-stone-300 bg-white px-3 focus-visible:outline-2";

  return (
    <>
      <AdminNav locale={locale} />
      <h1 className="text-3xl font-semibold">{t("orders")}</h1>
      <form method="get" action={`/${locale}/admin/orders`} className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-0 flex-1 basis-56 flex-col gap-1">{t("search")}
          <input name="q" type="search" maxLength={40} defaultValue={filter.q} className={control} />
        </label>
        <label className="flex flex-col gap-1">{t("status")}
          <select name="status" defaultValue={filter.status} className={control}>
            <option value="all">{t("all")}</option>
            {orderStatuses.map((status) => <option key={status} value={status}>{t(`statuses.${status}`)}</option>)}
          </select>
        </label>
        <button type="submit" className={control}>{t("apply")}</button>
      </form>
      <OrdersList orders={result.data ?? []} currency={currency} locale={locale} />
      {(pages > 1 || filter.page > 1) && (
        <nav aria-label={t("pagination")} className="flex flex-wrap items-center gap-3">
          {filter.page > 1 && <Link href={pageLink(filter.page > pages ? 1 : filter.page - 1)} prefetch={false}
            className={`inline-flex items-center ${control}`}>{t("previous")}</Link>}
          {filter.page <= pages && <span>{t("page", { page: filter.page, pages })}</span>}
          {filter.page < pages && <Link href={pageLink(filter.page + 1)} prefetch={false}
            className={`inline-flex items-center ${control}`}>{t("next")}</Link>}
        </nav>
      )}
    </>
  );
}
