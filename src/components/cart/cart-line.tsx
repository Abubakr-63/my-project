"use client";

import { DeleteIcon, ImageIcon } from "@/components/ui/icons";
import { QuantityStepper } from "@/components/ui/stepper";
import { ui } from "@/components/ui/styles";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { MAX_PACKS_PER_LINE, type CartLine } from "@/lib/cart";
import type { CartCatalogLine } from "@/lib/cart/details";
import { formatPrice, type StoreLocale } from "@/lib/catalog-format";
import { Link } from "@/lib/navigation";
import { useCart } from "./cart-provider";

export const cartButton = ui.secondary;

function PacksStepper({ packs, minimum, onChange }: {
  packs: number;
  minimum: number;
  onChange: (packs: number) => void;
}) {
  const t = useTranslations("Cart");
  const [draft, setDraft] = useState<string | null>(null);

  function commit(value: number) {
    const next = Math.max(minimum, Math.min(MAX_PACKS_PER_LINE, Math.trunc(value) || minimum));
    onChange(next);
    setDraft(null);
  }

  return (
    <QuantityStepper decreaseLabel={t("decrease")} increaseLabel={t("increase")}
      atMin={packs <= minimum} atMax={packs >= MAX_PACKS_PER_LINE} adjust={(delta) => commit(packs + delta)}>
      <label className="text-sm">
        {t("packs")}
        <input type="number" inputMode="numeric" min={minimum} max={MAX_PACKS_PER_LINE} step={1}
          value={draft ?? packs} onChange={(event) => {
            const value = event.target.value;
            const number = Number(value);
            setDraft(value);
            if (Number.isInteger(number) && number >= minimum && number <= MAX_PACKS_PER_LINE) onChange(number);
          }}
          onBlur={() => { if (draft !== null) commit(Number(draft)); }}
          onKeyDown={(event) => { if (event.key === "Enter") event.currentTarget.blur(); }}
          className={`${ui.input} block w-24`} />
      </label>
    </QuantityStepper>
  );
}

export function CartLineRow({ line, item, currency, locale, adjusted }: {
  line: CartLine;
  item?: CartCatalogLine;
  currency: string;
  locale: StoreLocale;
  adjusted: boolean;
}) {
  const t = useTranslations("Cart");
  const { remove, setPacks } = useCart();
  const available = item && item.minPacks <= MAX_PACKS_PER_LINE;
  const packs = available ? Math.max(item.minPacks, line.packs) : line.packs;
  const price = (amount: number) => formatPrice(amount, currency, locale);

  return (
    <li className="ui-card p-4">
      {available ? (
        <div className="flex flex-wrap gap-4">
          <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-m3-md bg-surface-container text-center text-xs text-on-surface-variant">
            {item.image ? <Image src={item.image} alt={t("imageAlt", { name: item.name, color: item.color })}
              fill loading="lazy" sizes="96px" className="object-cover" /> : <span><ImageIcon size={20} className="mx-auto mb-1" />{t("noImage")}</span>}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <Link href={`/catalog/${encodeURIComponent(item.slug)}`} className="rounded-m3-xs font-semibold underline-offset-4 hover:underline focus-visible:outline-2">{item.name}</Link>
            <p>{item.color}</p>
            <p className="text-sm text-on-surface-variant">{t("pairsPerPack", { count: item.pairsPerPack })}</p>
            <p className="text-sm text-on-surface-variant">{t("unitPrices", {
              pair: price(item.pricePerPair), pack: price(item.pricePerPair * item.pairsPerPack),
            })}</p>
          </div>
        </div>
      ) : <p>{t("unavailable")}</p>}
      {available && (
        <div className="mt-4 space-y-2">
          {(adjusted || line.packs < item.minPacks) && (
            <p role="status" className="text-sm text-tertiary">{t("raisedMinimum", { count: item.minPacks })}</p>
          )}
          <PacksStepper packs={packs} minimum={item.minPacks} onChange={(quantity) => setPacks(line, quantity)} />
          <p className="font-semibold">{t("lineTotal", {
            count: packs * item.pairsPerPack,
            price: price(packs * item.pairsPerPack * item.pricePerPair),
          })}</p>
        </div>
      )}
      <button type="button" className={`${ui.danger} mt-3`} onClick={() => remove(line)}><DeleteIcon size={18} />{t("remove")}</button>
    </li>
  );
}
