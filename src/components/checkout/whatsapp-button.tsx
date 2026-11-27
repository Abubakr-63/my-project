"use client";

import { SendIcon } from "@/components/ui/icons";
import { ui } from "@/components/ui/styles";
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
      className={ui.success}>
      <SendIcon size={18} />{label}
    </a>
  );
}
