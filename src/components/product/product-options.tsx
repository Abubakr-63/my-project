"use client";

import { ArrowForwardIcon, CartIcon, CheckCircleIcon, ImageIcon } from "@/components/ui/icons";
import { ui } from "@/components/ui/styles";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { formatPrice, type StoreLocale } from "@/lib/catalog-format";

import { MAX_PACKS_PER_LINE as maxPacks } from "@/lib/cart";
import { Link } from "@/lib/navigation";
import { useCart } from "@/components/cart/cart-provider";
const buttonStyle = `${ui.secondary} aria-pressed:ring-2 aria-pressed:ring-primary aria-pressed:font-semibold`;

type Color = { id: string; name: string; images: string[] };

export function ProductOptions({
  productId, colors, name, locale, currency, pricePerPair, pairsPerPack, minPacks,
}: {
  productId: string;
  colors: Color[];
  name: string;
  locale: StoreLocale;
  currency: string;
  pricePerPair: number;
  pairsPerPack: number;
  minPacks: number;
}) {
  const t = useTranslations("ProductOptions");
  const { add } = useCart();
  const [feedback, setFeedback] = useState<"added" | "cartLimitReached" | null>(null);
  const [selectedId, setSelectedId] = useState(colors[0]?.id);
  const [imageIndex, setImageIndex] = useState(0);
  const [quantities, setQuantities] = useState<Record<string, string>>({});

  const color = colors.find(({ id }) => id === selectedId) ?? colors[0];
  const image = color?.images[imageIndex];
  const draft = color ? quantities[color.id] ?? String(minPacks) : "";
  const packs = Math.min(maxPacks, Math.max(minPacks, Math.trunc(Number(draft)) || minPacks));
  const totalPairs = packs * pairsPerPack;
  const canChoosePacks = color && minPacks <= maxPacks;

  function setPacks(value: string) {
    setFeedback(null);
    if (color) setQuantities((previous) => ({ ...previous, [color.id]: value }));
  }

  return (
    <section className="grid gap-6 md:grid-cols-2" aria-label={t("options")}>
      <div>
        <div className="relative grid aspect-square place-items-center overflow-hidden rounded-m3-lg bg-surface-container">
          {image ? (
            <Image
              src={image}
              alt={t("photoAlt", { name, color: color.name, number: imageIndex + 1 })}
              fill
              preload={color.id === colors[0]?.id && imageIndex === 0}
              sizes="(min-width: 1280px) 540px, (min-width: 768px) 50vw, 100vw"
              className="object-contain"
            />
          ) : (
            <p className="px-4 text-center text-sm text-on-surface-variant"><ImageIcon size={28} className="mx-auto mb-2" />{t("noImage")}</p>
          )}
        </div>
        {color && color.images.length > 1 && (
          <div role="group" aria-label={t("photos")} className="mt-3 flex flex-wrap gap-2">
            {color.images.map((source, index) => (
              <button
                key={index}
                type="button"
                aria-pressed={imageIndex === index}
                aria-label={t("showPhoto", { number: index + 1 })}
                onClick={() => setImageIndex(index)}
                className={`${buttonStyle} relative size-16 overflow-hidden p-0`}
              >
                <Image src={source} alt="" fill loading="lazy" sizes="64px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-5 ui-card p-4 sm:p-6">
        {colors.length > 0 && (
          <fieldset>
            <legend className="mb-2 font-semibold">{t("color")}</legend>
            <div className="flex flex-wrap gap-2">
              {colors.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  aria-pressed={color?.id === option.id}
                  className={buttonStyle}
                  onClick={() => {
                    if (color?.id === option.id) return;
                    setFeedback(null);
                    setSelectedId(option.id);
                    setImageIndex(0);
                  }}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        {canChoosePacks ? (
          <>
            <label className="block font-semibold">
              {t("packs")}
              <input
                type="number"
                inputMode="numeric"
                min={minPacks}
                max={maxPacks}
                step={1}
                value={draft}
                onChange={(event) => setPacks(event.target.value)}
                onBlur={() => setPacks(String(packs))}
                className={`${ui.input} mt-2 block w-32`}
              />
            </label>
            <div role="status" aria-atomic="true" className="space-y-1 border-t border-outline-variant pt-4">
              <p>{t("totalPairs", { count: totalPairs })}</p>
              <p className="font-semibold">
                {t("totalPrice", { price: formatPrice(totalPairs * pricePerPair, currency, locale) })}
              </p>
            </div>
          </>
        ) : (
          <p className="text-on-surface-variant">{t("unavailable")}</p>
        )}
        <div className="ui-sticky sticky -mx-4 border-t border-outline-variant px-4 pt-3 md:static md:mx-0 md:border-0 md:px-0">
          <button
            type="button"
            disabled={!canChoosePacks}
            className={`${ui.primary} w-full sm:w-auto`}
            onClick={() => {
              if (canChoosePacks) setFeedback(add({ productId, colorId: color.id, packs }) ? "added" : "cartLimitReached");
            }}
          >
            <CartIcon size={18} />{t("addToCart")}
          </button>
          <div role="status" className="mt-2 flex flex-wrap items-center gap-2 text-sm text-on-surface-variant">
            {feedback && <span key={feedback} className="inline-flex items-center gap-2">
              {feedback === "added" && <CheckCircleIcon className="check-pop text-success" />}{t(feedback)}
            </span>}
            {feedback === "added" && (
              <Link href="/cart" prefetch={false} className={ui.link}>
                <ArrowForwardIcon size={18} />{t("goToCart")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
