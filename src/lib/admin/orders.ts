import { locales, type StoreLocale } from "@/lib/locales";
import type { Database } from "@/lib/database.types";
import { validOrderNumber } from "@/lib/checkout/summary";

export type OrderStatus = Database["public"]["Enums"]["order_status"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export const orderStatuses = ["new", "in_progress", "done", "cancelled"] as const satisfies readonly OrderStatus[];
export const ORDER_PAGE_SIZE = 20;

export function isOrderStatus(value: unknown): value is OrderStatus {
  return orderStatuses.some((status) => status === value);
}

export function orderFilters(params: Record<string, string | string[] | undefined>) {
  const page = typeof params.page === "string" && /^[1-9][0-9]{0,3}$/.test(params.page) ? Number(params.page) : 1;
  const status: OrderStatus | "all" = isOrderStatus(params.status) ? params.status : "all";
  const query = typeof params.q === "string" ? params.q.trim() : "";
  const digits = query.replace(/[^0-9]/g, "");
  const q = query.length <= 40 && /^\+?[0-9 ()-]+$/.test(query) && digits.length <= 20 && digits ? query : "";

  return {
    page, status, q,
    orderNumber: validOrderNumber(q) ? q : null,
    // Matches contiguous digits after removing formatting from saved phone numbers.
    phonePattern: q ? digits.split("").join("[^0-9]*") : null,
  };
}

export function formatOrderDate(value: string, locale: StoreLocale) {
  return new Intl.DateTimeFormat(locales[locale].intlLocale, {
    dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dushanbe",
  }).format(new Date(value));
}
