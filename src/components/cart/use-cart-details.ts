"use client";

import { useEffect, useEffectEvent, useState } from "react";
import type { CartLine } from "@/lib/cart";
import type { CartDetails } from "@/lib/cart/details";
import type { StoreLocale } from "@/lib/catalog-format";

export function useCartDetails(lines: readonly CartLine[], locale: StoreLocale, revision: number) {
  const ids = lines.map(({ productId, colorId }) => `${productId}:${colorId}`).join(",");
  const key = `${locale}:${revision}:${ids}`;
  const getBody = useEffectEvent(() => JSON.stringify({ locale, items: lines }));
  const [result, setResult] = useState<{ key: string; details: CartDetails | null }>();

  useEffect(() => {
    if (!ids) return;
    const body = getBody();
    const abort = new AbortController();
    fetch("/api/cart", {
      method: "POST", headers: { "Content-Type": "application/json" }, body, signal: abort.signal,
    }).then(async (response) => {
      if (!response.ok) throw new Error("Cart lookup failed");
      const details: CartDetails = await response.json();
      if (!abort.signal.aborted) setResult({ key, details });
    }).catch(() => {
      if (!abort.signal.aborted) setResult({ key, details: null });
    });

    return () => abort.abort();
  }, [ids, key]);

  return result?.key === key ? result : undefined;
}
