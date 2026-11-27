"use client";

import type { FormEvent, ReactNode } from "react";
import { useRouter } from "next/navigation";

export function CatalogFilterForm({ action, label, children }: {
  action: string;
  label: string;
  children: ReactNode;
}) {
  const router = useRouter();

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    for (const [key, value] of new FormData(event.currentTarget)) {
      if (typeof value === "string" && value && !(key === "sort" && value === "newest")) params.append(key, value);
    }
    const query = params.toString();
    router.push(query ? `${action}?${query}` : action);
  }

  return <form method="get" action={action} onSubmit={submit} aria-label={label} className="relative mb-8">{children}</form>;
}
