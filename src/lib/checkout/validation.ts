export const MAX_CUSTOMER_NAME = 100;

export function validCheckoutName(value: unknown): value is string {
  return typeof value === "string" && value.length <= MAX_CUSTOMER_NAME &&
    value.trim().length > 0 && !/[\p{Cc}\u202A-\u202E\u2066-\u2069]/u.test(value);
}

export function normalizeCheckoutPhone(value: unknown) {
  if (typeof value !== "string" || value.length > 40 || !/^\+?[0-9 ()-]+$/.test(value.trim())) return null;
  const digits = value.replace(/[^0-9]/g, "");
  return /^[0-9]{7,20}$/.test(digits) ? (value.trim().startsWith("+") ? "+" + digits : digits) : null;
}
