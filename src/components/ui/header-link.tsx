"use client";

import type { ComponentProps } from "react";
import { Link, usePathname } from "@/lib/navigation";
import { ui } from "./styles";

export function HeaderLink({ href, className = "", ...props }: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const path = usePathname();
  const active = path === href || (href !== "/" && path.startsWith(href + "/"));

  return <Link {...props} href={href} className={`${ui.ghost} header-item ${className}`}
    aria-current={active ? "page" : undefined} />;
}
