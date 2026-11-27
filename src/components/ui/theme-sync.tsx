"use client";

import { useLayoutEffect } from "react";
import { REDUCED_MOTION, SYSTEM_DARK, THEME_KEY, syncMotionTier, syncThemeMode } from "@/lib/theme";

export function ThemeSync({ locale }: { locale: string }) {
  useLayoutEffect(() => {
    const theme = matchMedia(SYSTEM_DARK);
    const motion = matchMedia(REDUCED_MOTION);
    const connection = (navigator as Navigator & { connection?: EventTarget }).connection;
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_KEY || event.key === null) syncThemeMode();
    };

    syncThemeMode();
    syncMotionTier();
    theme.addEventListener("change", syncThemeMode);
    motion.addEventListener("change", syncMotionTier);
    connection?.addEventListener?.("change", syncMotionTier);
    window.addEventListener("storage", onStorage);
    return () => {
      theme.removeEventListener("change", syncThemeMode);
      motion.removeEventListener("change", syncMotionTier);
      connection?.removeEventListener?.("change", syncMotionTier);
      window.removeEventListener("storage", onStorage);
    };
  }, [locale]);

  return null;
}
