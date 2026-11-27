"use client";

import { SaveIcon } from "@/components/ui/icons";
import { Message } from "@/components/ui/message";
import { ui } from "@/components/ui/styles";
import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { updateOrderStatus } from "@/app/[locale]/admin/actions";
import { orderStatuses, type OrderStatus } from "@/lib/admin/orders";

export function OrderStatusForm({ id, status }: { id: string; status: OrderStatus }) {
  const t = useTranslations("Admin");
  const [result, action, pending] = useActionState(
    async (_previous: Awaited<ReturnType<typeof updateOrderStatus>> | null, form: FormData) => {
      const value = form.get("status");
      return updateOrderStatus(id, typeof value === "string" ? value : "");
    },
    null,
  );

  return (
    <form action={action} aria-busy={pending} className="space-y-2 border-t border-outline-variant pt-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">{t("status")}
          <select name="status" defaultValue={status} disabled={pending}
            className={ui.select}>
            {orderStatuses.map((value) => <option key={value} value={value}>{t(`statuses.${value}`)}</option>)}
          </select>
        </label>
        <button type="submit" disabled={pending} className={ui.primary}>
          <SaveIcon size={18} />{t(pending ? "saving" : "save")}
        </button>
      </div>
      {!pending && result?.ok && <Message tone="success">{t("saved")}</Message>}
      {result && !result.ok && <p role="alert">{t(result.error)}</p>}
    </form>
  );
}
