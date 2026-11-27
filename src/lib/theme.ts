export const THEME_KEY = "shoeline-theme-v1";
export const SYSTEM_DARK = "(prefers-color-scheme: dark)";
export const THEME_MODES = ["system", "light", "dark"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export function isThemeMode(value: unknown): value is ThemeMode {
  return THEME_MODES.some((mode) => value === mode);
}

export const LOW_DEVICE_MEMORY_GB = 2;
export const LOW_CORE_COUNT = 2;
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

// Fixed source lets a strict CSP allow this script by hash.
export const themeBootstrap = `(()=>{let m="system";try{const v=localStorage.getItem("${THEME_KEY}");if(v==="light"||v==="dark")m=v}catch{}const h=document.documentElement;h.dataset.themeMode=m;h.dataset.theme=m==="system"?(matchMedia("${SYSTEM_DARK}").matches?"dark":"light"):m;const n=navigator;h.dataset.motion=matchMedia("${REDUCED_MOTION}").matches||n.connection?.saveData===true||(typeof n.deviceMemory==="number"&&n.deviceMemory<=${LOW_DEVICE_MEMORY_GB})||(typeof n.hardwareConcurrency==="number"&&n.hardwareConcurrency<=${LOW_CORE_COUNT})?"reduced":"full"})()`;
