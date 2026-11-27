import { createTranslator } from "next-intl";
import ru from "@/messages/ru.json";
import { locales } from "@/lib/locales";
import type { OrderSummary } from "./summary";

const t = createTranslator({ locale: locales.ru.intlLocale, messages: { WhatsApp: ru.WhatsApp }, namespace: "WhatsApp" });
const MAX_MESSAGE_LINES = 15;
const MAX_LINK_LENGTH = 7000;

export function normalizeWhatsAppNumber(value: string | null | undefined) {
  const digits = value?.replace(/[+ -]/g, "");
  return digits && /^[0-9]{8,15}$/.test(digits) ? digits : null;
}

function wellFormed(value: string) {
  return Array.from(value, (ch) => (/[\uD800-\uDFFF]/u.test(ch) ? "\uFFFD" : ch)).join("");
}

function singleLine(value: string) {
  return wellFormed(value.replace(/[\p{Cc}\p{Cf}\p{Zl}\p{Zp}]+/gu, " ").trim());
}

export function whatsAppLink(phone: string, orderNumber: string, summary: OrderSummary | null) {
  const base = `https://wa.me/${phone}?text=`;
  const heading = t("order", { orderNumber });
  if (!summary) return base + encodeURIComponent(heading);

  const money = new Intl.NumberFormat(locales.ru.intlLocale, { maximumFractionDigits: 2 });
  const header = [
    heading,
    t("name", { name: singleLine(summary.customerName) }),
    t("phone", { phone: singleLine(summary.customerPhone) }),
  ];
  const rows = summary.lines.slice(0, MAX_MESSAGE_LINES).map((line, index) => t("line", {
    index: index + 1, product: singleLine(line.productName), color: singleLine(line.colorName),
    packs: line.packs, pairs: line.pairs, amount: money.format(line.lineTotal), currency: summary.currency,
  }));
  const totals = t("total", {
    pairs: summary.totalPairs, amount: money.format(summary.totalAmount), currency: summary.currency,
  });

  while (true) {
    const remaining = summary.lines.length - rows.length;
    const items = remaining ? [...rows, t("remaining", { count: remaining })] : rows;
    const text = [header.join("\n"), items.join("\n"), totals].join("\n\n");
    const link = base + encodeURIComponent(text);
    if (link.length <= MAX_LINK_LENGTH || rows.length === 0) return link;
    rows.pop();
  }
}
