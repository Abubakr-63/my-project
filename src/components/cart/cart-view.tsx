"use client";

import { ui } from "@/components/ui/styles";
import { useTranslations } from "next-intl";
import { useEffect, useState, useSyncExternalStore } from "react";
import { lineKey, MAX_PACKS_PER_LINE } from "@/lib/cart";
import { formatPrice, type StoreLocale } from "@/lib/catalog-format";
import { Link } from "@/lib/navigation";
import { cartButton, CartLineRow } from "./cart-line";
import { useCart } from "./cart-provider";

import { useCartDetails } from "./use-cart-details";
const subscribe = () => () => {};
const mounted = () => true;
const serverSnapshot = () => false;

export function CartView({ locale }: { locale: StoreLocale }) {
  const t = useTranslations("Cart");
  const ready = useSyncExternalStore(subscribe, mounted, serverSnapshot);
  const { lines, setPacks, clear } = useCart();
  const [retry, setRetry] = useState(0);
  const [confirmClear, setConfirmClear] = useState(false);
  const [adjusted, setAdjusted] = useState<Record<string, number>>({});
  const current = useCartDetails(lines, locale, retry);
  const details = current?.details;

  useEffect(() => {
    if (!details) return;
    const updates: Record<string, number> = {};
    for (const line of lines) {
      const id = lineKey(line);
      const item = details.items[id];
      if (item && item.minPacks <= MAX_PACKS_PER_LINE && line.packs < item.minPacks) {
        if (setPacks(line, item.minPacks)) updates[id] = item.minPacks;
      }
    }
    if (Object.keys(updates).length) setAdjusted((previous) => ({ ...previous, ...updates }));
  }, [details, lines, setPacks]);

  if (!ready) return <p role="status">{t("loading")}</p>;
  if (!lines.length) return (
    <div className="space-y-3 ui-card p-5">
      <p>{t("empty")}</p>
      <Link href="/catalog" className={cartButton}>{t("browse")}</Link>
    </div>
  );

  const validatedLines = details ? lines.flatMap((line) => {
    const item = details.items[lineKey(line)];
    return item && item.minPacks <= MAX_PACKS_PER_LINE
      ? [{ ...line, packs: Math.max(line.packs, item.minPacks), item }]
      : [];
  }) : [];
  const totalPairs = validatedLines.reduce((sum, line) => sum + line.packs * line.item.pairsPerPack, 0);
  const totalCents = validatedLines.reduce((sum, line) => (
    sum + line.packs * line.item.pairsPerPack * Math.round(line.item.pricePerPair * 100)
  ), 0);


  return (
    <div className="space-y-5">
      {confirmClear ? (
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t("confirmClear")}>
          <p>{t("confirmClear")}</p>
          <button type="button" className={ui.danger} onClick={() => {
            clear();
            setConfirmClear(false);
            setAdjusted({});
          }}>{t("clearYes")}</button>
          <button type="button" className={cartButton} onClick={() => setConfirmClear(false)}>{t("cancel")}</button>
        </div>
      ) : <button type="button" className={cartButton} onClick={() => setConfirmClear(true)}>{t("clear")}</button>}

      {!current && <p role="status">{t("loading")}</p>}
      {current && !details && (
        <div className="space-y-2">
          <p role="alert">{t("error")}</p>
          <button type="button" className={cartButton} onClick={() => setRetry((value) => value + 1)}>{t("retry")}</button>
        </div>
      )}
      {details && (
        <>
          <ul className="grid gap-3">
            {lines.map((line) => {
              const id = lineKey(line);
              const item = details.items[id];
              return <CartLineRow key={id} line={line} item={item} currency={details.currency}
                locale={locale} adjusted={adjusted[id] === item?.minPacks && adjusted[id] !== undefined} />;
            })}
          </ul>
          <section className="ui-card ui-sticky sticky space-y-2 p-3 shadow-md md:static md:p-5 md:shadow-none">
            <h2 className="font-semibold">{t("summary")}</h2>
            <div role="status" aria-atomic="true" className="space-y-1">
              <p>{t("totalPairs", { count: totalPairs })}</p>
              <p className="font-semibold">{t("totalAmount", { price: formatPrice(totalCents / 100, details.currency, locale) })}</p>
              {totalCents < Math.round(details.minimumOrderAmount * 100) && (
                <p className="text-warning">{t("minimumAmount", { price: formatPrice(details.minimumOrderAmount, details.currency, locale) })}</p>
              )}
            </div>
            {validatedLines.length === lines.length && validatedLines.every((line, index) => line.packs === lines[index].packs) && totalCents >= Math.round(details.minimumOrderAmount * 100)
              ? <Link href="/checkout" prefetch={false} className={`${ui.primary} w-full sm:w-auto`}>{t("checkout")}</Link>
              : <button type="button" className={`${ui.primary} w-full sm:w-auto`} disabled>{t("checkout")}</button>}
          </section>
        </>
      )}
    </div>
  );
}
