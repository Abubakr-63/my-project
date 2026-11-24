export const LAST_ORDER_KEY = "shoeline-last-order-v1";

type SummaryLine = {
  productName: string;
  colorName: string;
  packs: number;
  pairs: number;
  lineTotal: number;
};

export type OrderSummary = {
  customerName: string;
  customerPhone: string;
  lines: SummaryLine[];
  totalPairs: number;
  totalAmount: number;
  currency: string;
};

export function validOrderNumber(value: unknown): value is string {
  return typeof value === "string" && /^[1-9][0-9]{0,18}$/.test(value)
    && BigInt(value) <= BigInt("9223372036854775807");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object";
}

function nonNegative(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

export function readLastOrder(orderNumber: string): OrderSummary | null {
  try {
    const stored: unknown = JSON.parse(sessionStorage.getItem(LAST_ORDER_KEY) ?? "null");
    if (!isRecord(stored) || stored.orderNumber !== orderNumber || !isRecord(stored.summary)) return null;
    const { customerName, customerPhone, lines, totalPairs, totalAmount, currency } = stored.summary;
    if (typeof customerName !== "string" || typeof customerPhone !== "string" ||
      typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency) ||
      !nonNegative(totalPairs) || !nonNegative(totalAmount) || !Array.isArray(lines) ||
      lines.length < 1 || lines.length > 100) return null;

    const safeLines: SummaryLine[] = [];
    for (const line of lines as unknown[]) {
      if (!isRecord(line) || typeof line.productName !== "string" || typeof line.colorName !== "string" ||
        !nonNegative(line.packs) || !nonNegative(line.pairs) || !nonNegative(line.lineTotal)) return null;
      safeLines.push({
        productName: line.productName, colorName: line.colorName, packs: line.packs,
        pairs: line.pairs, lineTotal: line.lineTotal,
      });
    }
    return { customerName, customerPhone, lines: safeLines, totalPairs, totalAmount, currency };
  } catch {
    return null;
  }
}
