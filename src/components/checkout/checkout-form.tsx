"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import { submitOrder } from "@/app/[locale]/checkout/actions";
import { lineKey } from "@/lib/cart";
import { useCartDetails } from "@/components/cart/use-cart-details";
import { useCart } from "@/components/cart/cart-provider";
import { formatPrice, type StoreLocale } from "@/lib/catalog-format";
import { LAST_ORDER_KEY } from "@/lib/checkout/summary";
import { MAX_CUSTOMER_NAME, normalizeCheckoutPhone, validCheckoutName } from "@/lib/checkout/validation";
import { Link } from "@/lib/navigation";

export function CheckoutForm({ locale }: { locale: StoreLocale }) {
  const t = useTranslations("Checkout");
  const { lines, clear } = useCart();
  const router = useRouter();
  const submitting = useRef(false);
  const [pending, setPending] = useState(false);
  const [revision, setRevision] = useState(0);
  const [invalidName, setInvalidName] = useState(false);
  const [invalidPhone, setInvalidPhone] = useState(false);
  const result = useCartDetails(lines, locale, revision);
  const details = result?.details;
  const purchasable = details ? lines.flatMap((line) => {
    const item = details.items[lineKey(line)];
    return item && line.packs >= item.minPacks ? [{ line, item }] : [];
  }) : [];
  const totalPairs = purchasable.reduce((sum, { line, item }) => sum + line.packs * item.pairsPerPack, 0);
  const totalCents = purchasable.reduce((sum, { line, item }) =>
    sum + line.packs * item.pairsPerPack * Math.round(item.pricePerPair * 100), 0);
  const belowMinimum = details && totalCents < Math.round(details.minimumOrderAmount * 100);
  const canSubmit = !!details && lines.length > 0 && purchasable.length === lines.length && !belowMinimum;
  const [error, setError] = useState<"invalid" | "cartChanged" | "minimum" | "failed">();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current || !canSubmit) return;
    const form = new FormData(event.currentTarget);
    const nameError = !validCheckoutName(form.get("name"));
    const phoneError = !normalizeCheckoutPhone(form.get("phone"));
    setInvalidName(nameError);
    setInvalidPhone(phoneError);
    if (nameError || phoneError) return;
    submitting.current = true;
    setPending(true);
    setError(undefined);

    try {
      const result = await submitOrder(locale, form, purchasable.map(({ line }) => line));
      if (!result.ok) {
        setError(result.error);
        if (result.error === "cartChanged" || result.error === "minimum") setRevision((value) => value + 1);
        return;
      }
      try {
        sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify({
          orderNumber: result.orderNumber, summary: result.summary,
        }));
      } catch {
        // The success page can use the order number alone.
      }
      clear();
      router.replace(`/${locale}/checkout/success?order=${encodeURIComponent(result.orderNumber)}`);
    } catch {
      setError("failed");
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  const inputStyle = "mt-1 block min-h-11 w-full rounded-md border border-stone-300 px-3 focus-visible:outline-2";
  return (
    <form onSubmit={onSubmit} noValidate aria-busy={pending} className="space-y-4 rounded-xl border border-stone-200 bg-white p-5">
      <section className="space-y-2 border-b border-stone-200 pb-4" aria-labelledby="checkout-summary">
        <h2 id="checkout-summary" className="font-semibold">{t("summary")}</h2>
        <div aria-live="polite" className="space-y-2">
          {!lines.length && <p>{t("empty")}</p>}
          {lines.length > 0 && !result && <p>{t("loading")}</p>}
          {result && !details && <p>{t("failed")}</p>}
          {details && (
            <>
              <ul className="space-y-1">
                {lines.map((line) => {
                  const key = lineKey(line);
                  const item = details.items[key];
                  return <li key={key}>{item ? t("line", {
                    name: item.name, color: item.color, packs: line.packs,
                    price: formatPrice(line.packs * item.pairsPerPack * item.pricePerPair, details.currency, locale),
                  }) : t("unavailable")}</li>;
                })}
              </ul>
              <p className="font-semibold">{t("total", {
                count: totalPairs, price: formatPrice(totalCents / 100, details.currency, locale),
              })}</p>
              {purchasable.length !== lines.length && <p>{t("cartChanged")}</p>}
              {belowMinimum && <p>{t("minimumAmount", {
                price: formatPrice(details.minimumOrderAmount, details.currency, locale),
              })}</p>}
            </>
          )}
        </div>
        {result && !details && <button type="button" className="min-h-11 underline focus-visible:outline-2"
          onClick={() => setRevision((value) => value + 1)}>{t("retry")}</button>}
      </section>
      <label className="block">{t("name")}
        <input className={inputStyle} name="name" autoComplete="name" required maxLength={MAX_CUSTOMER_NAME}
          aria-invalid={invalidName} aria-describedby={invalidName ? "checkout-name-error" : undefined} />
      </label>
      <p id="checkout-name-error" aria-live="polite">{invalidName && t("nameError")}</p>
      <label className="block">{t("phone")}
        <input className={inputStyle} name="phone" type="tel" autoComplete="tel" required maxLength={40}
          aria-invalid={invalidPhone} aria-describedby={invalidPhone ? "checkout-phone-error" : undefined} />
      </label>
      <p id="checkout-phone-error" aria-live="polite">{invalidPhone && t("phoneError")}</p>
      <input
        name="company_site"
        autoComplete="off"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute -left-[10000px] top-0"
      />
      <p role="alert">{error && t(error)}</p>
      <div className="flex flex-wrap items-center gap-4">
        <button disabled={pending || !canSubmit} className="min-h-11 rounded-md bg-stone-900 px-4 text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50">
          {t(pending ? "sending" : "submit")}
        </button>
        <Link href="/cart" className="inline-flex min-h-11 items-center underline focus-visible:outline-2">{t("back")}</Link>
      </div>
    </form>
  );
}
