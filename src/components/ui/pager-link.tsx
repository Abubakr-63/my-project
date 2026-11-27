import type { ComponentProps } from "react";
import { Link } from "@/lib/navigation";
import { ArrowBackIcon, ArrowForwardIcon } from "./icons";
import { ui } from "./styles";

export function PagerLink({ direction, children, ...props }: ComponentProps<typeof Link> & {
  direction: "previous" | "next";
}) {
  return (
    <Link {...props} className={ui.outlined}>
      {direction === "previous" && <ArrowBackIcon size={18} />}
      {children}
      {direction === "next" && <ArrowForwardIcon size={18} />}
    </Link>
  );
}
