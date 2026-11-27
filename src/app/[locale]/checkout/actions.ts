"use server";

import { hasLocale } from "next-intl";
import { lineKey, validateCartLines } from "@/lib/cart";
import { loadCartDetails } from "@/lib/cart/load-details";
import type { OrderSummary } from "@/lib/checkout/summary";
import { normalizeCheckoutPhone, validCheckoutName } from "@/lib/checkout/validation";
import { locales } from "@/lib/locales";
import { routing } from "@/lib/routing";
import { createClient } from "@/lib/supabase/server";

type OrderResult =
  | { ok: true; orderNumber: string; summary: OrderSummary }
  | { ok: false; error: "invalid" | "cartChanged" | "minimum" | "failed" };

function mapOrderError(error: { code: string; message: string } | null) {
  if (error?.code !== "22023") return "failed";
  if (error.message === "Order is below the minimum amount") return "minimum";
  if (["Invalid customer name", "Invalid customer phone", "Invalid locale"].includes(error.message)) {
    return "invalid";
  }
  return "cartChanged";
}

export async function submitOrder(locale: string, form: FormData, items: unknown): Promise<OrderResult> {
  if (!(form instanceof FormData) || !hasLocale(routing.locales, locale) || form.getAll("company_site").some((value) => value !== "")) {
    return { ok: false, error: "invalid" };
  }
  const name = form.get("name");
  const customerPhone = normalizeCheckoutPhone(form.get("phone"));
  if (!validCheckoutName(name) || !customerPhone) return { ok: false, error: "invalid" };

  const customerName = name.trim();
  const lines = validateCartLines(items);
  if (!lines) return { ok: false, error: "cartChanged" };

  try {
    const details = await loadCartDetails(lines, "ru");
    const summary: OrderSummary = {
      customerName, customerPhone, currency: details.currency, lines: [], totalPairs: 0, totalAmount: 0,
    };
    let totalCents = 0;
    for (const line of lines) {
      const item = details.items[lineKey(line)];
      if (!item || line.packs < item.minPacks) return { ok: false, error: "cartChanged" };

      const pairs = line.packs * item.pairsPerPack;
      const cents = pairs * Math.round(item.pricePerPair * 100);
      summary.lines.push({
        productName: item.name, colorName: item.color, packs: line.packs, pairs, lineTotal: cents / 100,
      });
      summary.totalPairs += pairs;
      totalCents += cents;
    }
    summary.totalAmount = totalCents / 100;
    if (totalCents < Math.round(details.minimumOrderAmount * 100)) return { ok: false, error: "minimum" };

    const supabase = await createClient({ anonymous: true });
    const { data, error } = await supabase.rpc("create_order", {
      p_name: customerName, p_phone: customerPhone, p_locale: locales[locale].dbLocale,
      p_items: lines.map(({ productId, colorId, packs }) => ({
        product_id: productId, color_id: colorId, packs,
      })),
    }).single();

    if (error || !data) return { ok: false, error: mapOrderError(error) };
    return { ok: true, orderNumber: String(data.order_number), summary };
  } catch {
    return { ok: false, error: "failed" };
  }
}
