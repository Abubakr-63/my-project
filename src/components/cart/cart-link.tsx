"use client";

import { CartIcon } from "@/components/ui/icons";
import { HeaderLink } from "@/components/ui/header-link";
import { useTranslations } from "next-intl";
import { useCart } from "./cart-provider";

export function CartLink() {
  const t = useTranslations("CartLink");
  const menu = useTranslations("Menu");
  const { totalLines, lines } = useCart();
  const cartSize = lines.reduce((sum, line) => sum + line.packs, 0);

  return (
    <HeaderLink href="/cart" prefetch={false} aria-label={t("label", { count: totalLines })}
      className="relative">
      <CartIcon key={cartSize} className={cartSize > 0 ? "cart-bump" : undefined} />
      <span className="hidden sm:inline">{menu("cart")}</span>
      {totalLines > 0 && <span aria-hidden="true" className="absolute end-0 top-0 min-w-5 rounded-m3-full bg-error-container px-1 text-center text-label-small text-on-error-container">{totalLines}</span>}
    </HeaderLink>
  );
}
