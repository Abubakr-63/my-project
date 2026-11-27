"use client";

import { CartIcon } from "@/components/ui/icons";
import { ui } from "@/components/ui/styles";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { useCart } from "./cart-provider";

export function CartLink() {
  const t = useTranslations("CartLink");
  const { totalLines, lines } = useCart();
  const cartSize = lines.reduce((sum, line) => sum + line.packs, 0);

  return (
    <Link href="/cart" prefetch={false} aria-label={t("label", { count: totalLines })}
      className={`${ui.ghost} relative`}>
      <CartIcon key={cartSize} className={cartSize > 0 ? "cart-bump" : undefined} />
      {totalLines > 0 && <span aria-hidden="true" className="absolute end-0 top-0 min-w-5 rounded-m3-full bg-error-container px-1 text-center text-label-small text-on-error-container">{totalLines}</span>}
    </Link>
  );
}
