export const maxProductSearchLength = 80;

export function readProductSearch(input: unknown) {
  const value = typeof input === "string" ? input.trim() : "";
  return value.length <= maxProductSearchLength && /^[\p{L}\p{M}\p{N} -]+$/u.test(value) ? value : "";
}
