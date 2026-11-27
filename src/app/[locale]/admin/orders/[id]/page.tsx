import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { OrderStatusForm } from "@/components/admin/order-status-form";
import { requireAdmin } from "@/lib/admin/access";
import { formatOrderDate } from "@/lib/admin/orders";
import { loadCatalogCurrency } from "@/lib/catalog";
import { formatPrice } from "@/lib/catalog-format";
import { isCartId } from "@/lib/cart";
import { routing } from "@/lib/routing";

export default async function AdminOrderPage({ params }: PageProps<"/[locale]/admin/orders/[id]">) {
  const { locale, id } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const { supabase } = await requireAdmin(locale);
  if (!isCartId(id)) notFound();

  const result = await supabase.from("orders").select(`
    id, order_number, created_at, customer_name, customer_phone, locale, status, total_pairs, total_amount,
    order_items(id, product_name, color_name, packs, pairs_per_pack, price_per_pair, line_total)
  `).eq("id", id).order("id", { referencedTable: "order_items" }).maybeSingle();

  if (result.error) throw new Error("Admin order unavailable");
  if (!result.data) notFound();

  const order = result.data;
  const [t, currency] = await Promise.all([
    getTranslations({ locale, namespace: "Admin" }), loadCatalogCurrency(supabase),
  ]);
  const digits = order.customer_phone.replace(/[^0-9]/g, "");
  const telephone = (order.customer_phone.trimStart().startsWith("+") ? "+" : "") + digits;
  const price = (value: number) => formatPrice(value, currency, locale);
  const contact = "inline-flex min-h-11 items-center rounded underline underline-offset-4 focus-visible:outline-2";

  return (
    <>
      <AdminNav locale={locale} />
      <h1 className="text-3xl font-semibold">{t("orderNumber", { number: order.order_number })}</h1>
      <dl className="grid gap-x-6 gap-y-3 ui-card p-4 sm:grid-cols-2">
        <div><dt className="font-semibold">{t("date")}</dt><dd><time dateTime={order.created_at}>{formatOrderDate(order.created_at, locale)}</time></dd></div>
        <div><dt className="font-semibold">{t("customer")}</dt><dd>{order.customer_name}</dd></div>
        <div>
          <dt className="font-semibold">{t("phone")}</dt>
          <dd className="flex flex-wrap gap-x-4">
            {digits ? <a href={`tel:${telephone}`} className={contact}>{order.customer_phone}</a> : order.customer_phone}
            {digits && <a href={`https://wa.me/${digits}`} target="_blank" rel="noopener noreferrer" className={contact}>{t("whatsapp")}</a>}
          </dd>
        </div>
        <div><dt className="font-semibold">{t("locale")}</dt><dd>{t(`languages.${order.locale}`)}</dd></div>
        <div><dt className="font-semibold">{t("status")}</dt><dd>{t(`statuses.${order.status}`)}</dd></div>
        <div><dt className="font-semibold">{t("totalPairs")}</dt><dd>{order.total_pairs}</dd></div>
        <div><dt className="font-semibold">{t("total")}</dt><dd>{price(order.total_amount)}</dd></div>
      </dl>
      <OrderStatusForm id={id} status={order.status} />
      <div className="overflow-x-auto ui-card">
        <table className="w-full text-left text-sm">
          <caption className="p-3 text-left font-semibold">{t("items")}</caption>
          <thead className="bg-subtle"><tr>
            {(["product", "color", "packs", "pairsPerPack", "unitPrice", "lineTotal"] as const).map((key) => (
              <th key={key} scope="col" className="px-3 py-2">{t(key)}</th>
            ))}
          </tr></thead>
          <tbody>{order.order_items.map((item) => (
            <tr key={item.id} className="border-t border-outline">
              <th scope="row" className="px-3 py-2">{item.product_name}</th>
              <td className="px-3 py-2">{item.color_name}</td>
              <td className="px-3 py-2">{item.packs}</td>
              <td className="px-3 py-2">{item.pairs_per_pack}</td>
              <td className="whitespace-nowrap px-3 py-2">{price(item.price_per_pair)}</td>
              <td className="whitespace-nowrap px-3 py-2">{price(item.line_total)}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </>
  );
}
