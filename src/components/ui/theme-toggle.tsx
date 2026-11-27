"use client";

import { useEffect, useState } from "react";
import { isThemeMode, SYSTEM_DARK, THEME_KEY, THEME_MODES, type ThemeMode } from "@/lib/theme";
import { ui } from "./styles";

function applyTheme(mode: ThemeMode, prefersDark: boolean) {
  const root = document.documentElement;
  root.dataset.themeMode = mode;
  root.dataset.theme = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
}

export function ThemeToggle({ label, labels }: { label: string; labels: Record<ThemeMode, string> }) {
  const [mode, setMode] = useState<ThemeMode>("system");

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia(SYSTEM_DARK);
    const initial = root.dataset.themeMode;
    if (isThemeMode(initial)) setMode(initial);
    const handleSystemChange = () => {
      if (!root.dataset.themeMode || root.dataset.themeMode === "system") applyTheme("system", media.matches);
    };
    const syncTabs = (event: StorageEvent) => {
      if (event.key !== THEME_KEY && event.key !== null) return;
      const next = isThemeMode(event.newValue) ? event.newValue : "system";
      applyTheme(next, media.matches);
      setMode(next);
    };

    handleSystemChange();
    const frame = window.requestAnimationFrame(() => { root.dataset.themeReady = ""; });
    media.addEventListener("change", handleSystemChange);
    window.addEventListener("storage", syncTabs);
    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener("change", handleSystemChange);
      window.removeEventListener("storage", syncTabs);
    };
  }, []);

  function cycle() {
    const next = THEME_MODES[(THEME_MODES.indexOf(mode) + 1) % THEME_MODES.length];
    applyTheme(next, window.matchMedia(SYSTEM_DARK).matches);
    setMode(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // The selection still applies to the current page.
    }
  }

  return (
    <button type="button" onClick={cycle} aria-label={`${label} · ${labels[mode]}`} className={`${ui.ghost} gap-2`}>
      <svg aria-hidden="true" className="size-5 dark:hidden" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M19 5l-1.5 1.5m-11 11L5 19" />
      </svg>
      <svg aria-hidden="true" className="hidden size-5 dark:block" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M20.5 15.4A8.6 8.6 0 0 1 8.6 3.5a9 9 0 1 0 11.9 11.9Z" />
      </svg>
      <span className="grid">
        {THEME_MODES.map((option) => (
          <span key={option} aria-hidden={option !== mode || undefined}
            className={`col-start-1 row-start-1 ${option === mode ? "" : "invisible"}`}>
            {labels[option]}
          </span>
        ))}
      </span>
    </button>
  );
}
