"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent } from "react";
import { readThemeMode, saveThemeMode, subscribeThemeMode, THEME_MODES, type ThemeMode } from "@/lib/theme";
import { CheckIcon, ChevronDownIcon, MoonIcon, SunIcon, SystemIcon } from "./icons";
import { ui } from "./styles";

const icons = { system: SystemIcon, light: SunIcon, dark: MoonIcon };

const readServerMode = () => null;

export function ThemeToggle({ label, labels }: { label: string; labels: Record<ThemeMode, string> }) {
  const mode = useSyncExternalStore(subscribeThemeMode, readThemeMode, readServerMode);
  const [active, setActive] = useState<number | null>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (active === null) return;
    menu.current?.querySelectorAll("button")[active]?.focus();
    function dismiss(event: PointerEvent) {
      if (event.target instanceof Node && !wrapper.current?.contains(event.target)) setActive(null);
    }
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [active]);

  function choose(next: ThemeMode, keyboard: boolean) {
    saveThemeMode(next);
    if (keyboard) button.current?.focus();
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

  const CurrentIcon = mode ? icons[mode] : null;
  return (
    <div className="relative" ref={wrapper} onBlur={(event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) setActive(null);
    }}>
      <button ref={button} type="button" className={`${ui.ghost} shrink-0 gap-0.5 px-1`}
        aria-label={mode ? `${label} · ${labels[mode]}` : label} aria-haspopup="menu" aria-expanded={active !== null}
        aria-controls={active === null ? undefined : menuId}
        onClick={() => setActive(active === null ? THEME_MODES.indexOf(readThemeMode()) : null)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setActive(event.key === "ArrowDown" ? 0 : THEME_MODES.length - 1);
          }
        }}>
        {CurrentIcon ? <CurrentIcon key={mode} size={18} className="theme-icon" /> : <span className="size-[18px]" />}<ChevronDownIcon size={12} />
      </button>
      {active !== null && (
        <div ref={menu} id={menuId} role="menu" aria-label={label} onKeyDown={onMenuKey}
          className="ui-menu absolute end-0 top-full z-50 mt-2 min-w-44 rounded-m3-lg bg-surface-container-high p-2">
          {THEME_MODES.map((option, index) => {
            const ModeIcon = icons[option];
            return (
              <button type="button" key={option} role="menuitemradio" aria-checked={option === mode}
                tabIndex={index === active ? 0 : -1} className={`${ui.ghost} w-full justify-start gap-3`}
                onClick={(event) => choose(option, event.detail === 0)}>
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
