"use client";

import { ui } from "@/components/ui/styles";
import { useTranslations } from "next-intl";
import { Link } from "@/lib/navigation";
import { useCart } from "./cart-provider";

export function CartLink() {
  const t = useTranslations("CartLink");
  const { totalLines } = useCart();

  return (
    <Link href="/cart" prefetch={false} aria-label={t("label", { count: totalLines })}
      className={`${ui.ghost} gap-2`}>
      <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h3l3 12h11l3-9H6" />
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
      </svg>
      {totalLines > 0 && <span aria-hidden="true" className="rounded-full bg-accent px-2 text-xs text-on-accent">{totalLines}</span>}
    </Link>
  );
}
