export const THEME_KEY = "shoeline-theme-v1";
export const SYSTEM_DARK = "(prefers-color-scheme: dark)";
export const THEME_MODES = ["system", "light", "dark"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];

export function isThemeMode(value: unknown): value is ThemeMode {
  return THEME_MODES.some((mode) => value === mode);
}

// Fixed source lets a strict CSP allow this script by hash.
export const themeBootstrap = `(()=>{let m="system";try{const v=localStorage.getItem("${THEME_KEY}");if(v==="light"||v==="dark")m=v}catch{}const h=document.documentElement;h.dataset.themeMode=m;h.dataset.theme=m==="system"?(matchMedia("${SYSTEM_DARK}").matches?"dark":"light"):m})()`;
