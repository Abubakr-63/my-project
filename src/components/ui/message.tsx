import type { ReactNode } from "react";
import { CheckCircleIcon, ErrorIcon, InfoIcon, WarningIcon } from "./icons";

const icons = { success: CheckCircleIcon, error: ErrorIcon, info: InfoIcon, warning: WarningIcon };

export function Message({ tone = "info", children }: {
  tone?: keyof typeof icons;
  children: ReactNode;
}) {
  const Icon = icons[tone];
  return <div role="status" className="ui-message" data-tone={tone}><Icon className="shrink-0" /><span>{children}</span></div>;
}

export function StatusChip({ status, children }: { status: string; children: ReactNode }) {
  const Icon = status === "done" || status === "active" ? CheckCircleIcon : status === "cancelled" ? ErrorIcon : InfoIcon;
  return <span className="ui-chip" data-state={status}><Icon size={16} />{children}</span>;
}

