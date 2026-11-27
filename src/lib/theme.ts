export const THEME_KEY = "shoeline-theme-v1";
export const SYSTEM_DARK = "(prefers-color-scheme: dark)";
export const THEME_MODES = ["system", "light", "dark"] as const;
export type ThemeMode = (typeof THEME_MODES)[number];
export const LOW_DEVICE_MEMORY_GB = 2;
export const LOW_CORE_COUNT = 2;
export const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

let sessionMode: ThemeMode = "system";
let useSessionMode = false;
const listeners = new Set<() => void>();

function readStoredMode(key: string, fallback: ThemeMode): ThemeMode {
  try {
    const value = window.localStorage.getItem(key);
    return value === "dark" || value === "light" ? value : "system";
  } catch {
    return fallback;
  }
}

export function readThemeMode() {
  if (!useSessionMode) sessionMode = readStoredMode(THEME_KEY, sessionMode);
  return sessionMode;
}

export function subscribeThemeMode(listener: () => void) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

export function notifyThemeMode() {
  listeners.forEach((listener) => listener());
}

export function saveThemeMode(mode: ThemeMode) {
  sessionMode = mode;
  try {
    window.localStorage.setItem(THEME_KEY, mode);
    useSessionMode = false;
  } catch {
    useSessionMode = true;
  }
  syncThemeMode();
}

function applyThemeMode(mode: ThemeMode, darkQuery?: string) {
  const { dataset } = document.documentElement;
  if (mode !== "system") {
    dataset.themeMode = mode;
    dataset.theme = mode;
  } else if (darkQuery) {
    dataset.themeMode = mode;
    dataset.theme = matchMedia(darkQuery).matches ? "dark" : "light";
  }
}

export function syncThemeMode() {
  applyThemeMode(readThemeMode(), SYSTEM_DARK);
  notifyThemeMode();
}

function applyMotionTier(query: string, maxMemory: number, maxCores: number) {
  const device = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number };
  const reduced = matchMedia(query).matches || device.connection?.saveData === true ||
    (typeof device.deviceMemory === "number" && device.deviceMemory <= maxMemory) ||
    (typeof device.hardwareConcurrency === "number" && device.hardwareConcurrency <= maxCores);
  document.documentElement.dataset.motion = reduced ? "reduced" : "full";
}

export function syncMotionTier() {
  applyMotionTier(REDUCED_MOTION, LOW_DEVICE_MEMORY_GB, LOW_CORE_COUNT);
}

// These self-contained helpers also run before hydration.
export const themeBootstrap = [
  `(${applyThemeMode.toString()})( (${readStoredMode.toString()})(${JSON.stringify(THEME_KEY)},"system") );`,
  `(${applyMotionTier.toString()})(${JSON.stringify(REDUCED_MOTION)},${LOW_DEVICE_MEMORY_GB},${LOW_CORE_COUNT});`,
].join("");
