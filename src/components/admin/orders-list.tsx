import { ui } from "@/components/ui/styles";
import { getTranslations } from "next-intl/server";
import { formatOrderDate, type Order } from "@/lib/admin/orders";
import { formatPrice, type StoreLocale } from "@/lib/catalog-format";
import { Link } from "@/lib/navigation";

type OrderRow = Pick<Order, "id" | "order_number" | "created_at" | "customer_name" | "total_amount" | "status">;

export async function OrdersList({ orders, currency, locale }: {
  orders: OrderRow[]; currency: string; locale: StoreLocale;
}) {
  const t = await getTranslations({ locale, namespace: "Admin" });
  if (!orders.length) return <p>{t("empty")}</p>;

  const rows = orders.map((order) => ({
    id: order.id,
    number: t("orderNumber", { number: order.order_number }),
    date: formatOrderDate(order.created_at, locale),
    name: order.customer_name,
    total: formatPrice(order.total_amount, currency, locale),
    status: t(`statuses.${order.status}`),
  }));
  return (
    <>
      <ul className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <li key={row.id} className="ui-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Link href={`/admin/orders/${row.id}`} prefetch={false} className="inline-flex min-h-11 items-center rounded font-semibold underline focus-visible:outline-2">{row.number}</Link>
              <span className="rounded-full bg-subtle px-3 py-1 text-sm">{row.status}</span>
            </div>
            <p className="text-sm text-muted">{row.date}</p>
            <p className="mt-2 break-words">{row.name}</p>
            <p className="font-semibold">{row.total}</p>
          </li>
        ))}
      </ul>
      <div className="hidden overflow-x-auto ui-card md:block">
        <table className="w-full text-left">
          <caption className="sr-only">{t("orders")}</caption>
          <thead className="bg-subtle">
            <tr>{(["order", "date", "customer", "total", "status"] as const).map((key) => (
              <th key={key} scope="col" className="px-4 py-3">{t(key)}</th>
            ))}</tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-outline">
                <th scope="row" className="px-4"><Link href={`/admin/orders/${row.id}`} prefetch={false} className={ui.link}>{row.number}</Link></th>
                <td className="px-4 py-2">{row.date}</td>
                <td className="px-4 py-2 break-words">{row.name}</td>
                <td className="px-4 py-2">{row.total}</td>
                <td className="px-4 py-2"><span className="inline-block rounded-full bg-subtle px-3 py-1 text-sm">{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
