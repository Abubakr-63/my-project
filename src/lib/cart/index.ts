export type CartLine = { productId: string; colorId: string; packs: number };

export const MAX_PACKS_PER_LINE = 10000;
export const MAX_LINES = 100;
export const STORAGE_KEY = "shoeline-cart-v1";
export const EMPTY_CART: readonly CartLine[] = [];

export function isCartId(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(value);
}

export function lineKey({ productId, colorId }: Pick<CartLine, "productId" | "colorId">) {
  return `${productId.toLowerCase()}:${colorId.toLowerCase()}`;
}

function validPacks(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0 && value <= MAX_PACKS_PER_LINE;
}

export function addLine(lines: readonly CartLine[], line: CartLine): readonly CartLine[] {
  if (!validPacks(line.packs) || !isCartId(line.productId) || !isCartId(line.colorId)) return lines;

  const clean = {
    productId: line.productId.toLowerCase(),
    colorId: line.colorId.toLowerCase(),
    packs: line.packs,
  };
  const existing = lines.find((item) => lineKey(item) === lineKey(clean));
  if (!existing) return lines.length < MAX_LINES ? [...lines, clean] : lines;

  return setPacks(lines, clean, Math.min(MAX_PACKS_PER_LINE, existing.packs + clean.packs));
}

export function setPacks(lines: readonly CartLine[], line: CartLine, packs: number): readonly CartLine[] {
  if (!validPacks(packs)) return lines;
  const existing = lines.find((item) => lineKey(item) === lineKey(line));
  return existing && existing.packs !== packs
    ? lines.map((item) => item === existing ? { ...item, packs } : item)
    : lines;
}

export function removeLine(lines: readonly CartLine[], line: CartLine) {
  return lines.filter((item) => lineKey(item) !== lineKey(line));
}

export function clearCart() {
  return EMPTY_CART;
}

export function parseCart(raw: string | null): readonly CartLine[] {
  if (!raw) return EMPTY_CART;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return EMPTY_CART;

    let lines = EMPTY_CART;
    for (const line of parsed) {
      if (!line || typeof line !== "object") continue;
      const { productId, colorId, packs } = line as Record<string, unknown>;
      if (!isCartId(productId) || !isCartId(colorId) || !validPacks(packs)) continue;
      lines = addLine(lines, { productId, colorId, packs });
    }
    return lines;
  } catch {
    return EMPTY_CART;
  }
}

export function validateCartLines(value: unknown): CartLine[] | null {
  if (!Array.isArray(value) || !value.length || value.length > MAX_LINES) return null;

  const lines: CartLine[] = [];
  const colors = new Set<string>();
  for (const entry of value as unknown[]) {
    if (!entry || typeof entry !== "object") return null;
    const { productId, colorId, packs } = entry as Record<string, unknown>;
    if (!isCartId(productId) || !isCartId(colorId) || typeof packs !== "number" ||
      !Number.isInteger(packs) || packs < 1 || packs > MAX_PACKS_PER_LINE) return null;
    const color = colorId.toLowerCase();
    if (colors.has(color)) return null;
    colors.add(color);
    lines.push({ productId: productId.toLowerCase(), colorId: color, packs });
  }
  return lines;
}
