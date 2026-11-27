"use client";

import type { ReactNode } from "react";
import { AddIcon, MinusIcon } from "./icons";
import { ui } from "./styles";

export function QuantityStepper({ children, decreaseLabel, increaseLabel, atMin, atMax, adjust }: {
  children: ReactNode;
  decreaseLabel: string;
  increaseLabel: string;
  atMin: boolean;
  atMax: boolean;
  adjust: (delta: number) => void;
}) {
  return (
    <div className="flex flex-wrap items-end gap-2">
      <button type="button" className={`${ui.outlined} px-2`} aria-label={decreaseLabel}
        disabled={atMin} onClick={() => adjust(-1)}><MinusIcon /></button>
      {children}
      <button type="button" className={`${ui.outlined} px-2`} aria-label={increaseLabel}
        disabled={atMax} onClick={() => adjust(1)}><AddIcon /></button>
    </div>
  );
}
