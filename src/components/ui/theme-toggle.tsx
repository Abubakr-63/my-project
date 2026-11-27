"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { isThemeMode, LOW_CORE_COUNT, LOW_DEVICE_MEMORY_GB, REDUCED_MOTION, SYSTEM_DARK, THEME_KEY, THEME_MODES, type ThemeMode } from "@/lib/theme";
import { CheckIcon, ChevronDownIcon, MoonIcon, SunIcon, SystemIcon } from "./icons";
import { ui } from "./styles";

const icons = { system: SystemIcon, light: SunIcon, dark: MoonIcon };

function applyTheme(mode: ThemeMode, prefersDark: boolean) {
  const root = document.documentElement;
  root.dataset.themeMode = mode;
  root.dataset.theme = mode === "system" ? (prefersDark ? "dark" : "light") : mode;
}

export function ThemeToggle({ label, labels }: { label: string; labels: Record<ThemeMode, string> }) {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [active, setActive] = useState<number | null>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia(SYSTEM_DARK);
    const motion = window.matchMedia(REDUCED_MOTION);
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number });
    const initial = root.dataset.themeMode;
    if (isThemeMode(initial)) setMode(initial);

    const handleSystemChange = () => {
      if (!root.dataset.themeMode || root.dataset.themeMode === "system") applyTheme("system", media.matches);
    };
    const handleMotionChange = () => {
      const reduced = motion.matches || connection.connection?.saveData ||
        (typeof connection.deviceMemory === "number" && connection.deviceMemory <= LOW_DEVICE_MEMORY_GB) ||
        (typeof navigator.hardwareConcurrency === "number" && navigator.hardwareConcurrency <= LOW_CORE_COUNT);
      root.dataset.motion = reduced ? "reduced" : "full";
    };
    const syncTabs = (event: StorageEvent) => {
      if (event.key !== THEME_KEY && event.key !== null) return;
      const next = isThemeMode(event.newValue) ? event.newValue : "system";
      applyTheme(next, media.matches);
      setMode(next);
    };

    handleSystemChange();
    handleMotionChange();
    media.addEventListener("change", handleSystemChange);
    motion.addEventListener("change", handleMotionChange);
    window.addEventListener("storage", syncTabs);
    return () => {
      media.removeEventListener("change", handleSystemChange);
      motion.removeEventListener("change", handleMotionChange);
      window.removeEventListener("storage", syncTabs);
    };
  }, []);

  useEffect(() => {
    if (active === null) return;
    menu.current?.querySelectorAll("button")[active]?.focus();
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !wrapper.current?.contains(event.target)) setActive(null);
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [active]);

  function choose(next: ThemeMode) {
    applyTheme(next, window.matchMedia(SYSTEM_DARK).matches);
    setMode(next);
    try {
      window.localStorage.setItem(THEME_KEY, next);
    } catch {
      // The selected mode still applies for this document.
    }
    button.current?.focus();
    setActive(null);
  }

  function onMenuKey(event: KeyboardEvent<HTMLDivElement>) {
    if (active === null) return;
    switch (event.key) {
      case "ArrowDown": setActive((active + 1) % THEME_MODES.length); break;
      case "ArrowUp": setActive((active + THEME_MODES.length - 1) % THEME_MODES.length); break;
      case "Home": setActive(0); break;
      case "End": setActive(THEME_MODES.length - 1); break;
      case "Escape": setActive(null); button.current?.focus(); break;
      default: return;
    }
    event.preventDefault();
  }

  const CurrentIcon = icons[mode];
  return (
    <div className="relative" ref={wrapper} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setActive(null);
    }}>
      <button ref={button} type="button" className={`${ui.ghost} gap-1 px-2`}
        aria-label={`${label} · ${labels[mode]}`} aria-haspopup="menu" aria-expanded={active !== null}
        aria-controls={active === null ? undefined : menuId}
        onClick={() => setActive(active === null ? THEME_MODES.indexOf(mode) : null)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setActive(event.key === "ArrowDown" ? 0 : THEME_MODES.length - 1);
          }
        }}>
        <CurrentIcon key={mode} className="theme-icon" /><ChevronDownIcon size={14} />
      </button>
      {active !== null && (
        <div ref={menu} id={menuId} role="menu" aria-label={label} onKeyDown={onMenuKey}
          className="ui-menu absolute end-0 top-full z-50 mt-2 min-w-44 rounded-m3-lg bg-surface-container-high p-2">
          {THEME_MODES.map((option, index) => {
            const ModeIcon = icons[option];
            return (
              <button type="button" key={option} role="menuitemradio" aria-checked={option === mode}
                tabIndex={index === active ? 0 : -1} className={`${ui.ghost} w-full justify-start gap-3`}
                onClick={() => choose(option)}>
                <ModeIcon /><span className="flex-1 text-start">{labels[option]}</span>
                {option === mode && <CheckIcon size={18} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
