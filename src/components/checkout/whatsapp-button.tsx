"use client";

import { useEffect, useState } from "react";
import { readLastOrder, type OrderSummary } from "@/lib/checkout/summary";
import { whatsAppLink } from "@/lib/checkout/whatsapp";

export function WhatsAppButton({ phone, orderNumber, label }: {
  phone: string;
  orderNumber: string;
  label: string;
}) {
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  useEffect(() => setSummary(readLastOrder(orderNumber)), [orderNumber]);

  return (
    <a href={whatsAppLink(phone, orderNumber, summary)} target="_blank" rel="noopener noreferrer"
      className="inline-flex min-h-11 items-center rounded-md bg-green-800 px-4 text-white hover:bg-green-900 focus-visible:outline-2 focus-visible:outline-offset-2">
      {label}
    </a>
  );
}
