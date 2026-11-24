import { EMPTY_CART, parseCart, STORAGE_KEY, type CartLine } from "./index";

let lines = EMPTY_CART;
let raw: string | null | undefined;
let inMemory = false;
const listeners = new Set<() => void>();

export function getCartSnapshot() {
  if (inMemory) return lines;
  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (raw !== value) {
      raw = value;
      lines = parseCart(value);
    }
  } catch {
    inMemory = true;
  }
  return lines;
}

function notify() {
  for (const listener of listeners) listener();
}

function onStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY || event.key === null) notify();
}

export function subscribeToCart(listener: () => void) {
  if (!listeners.size) window.addEventListener("storage", onStorage);
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
    if (!listeners.size) window.removeEventListener("storage", onStorage);
  };
}

export function editCart(change: (current: readonly CartLine[]) => readonly CartLine[]) {
  const current = getCartSnapshot();
  const next = change(current);
  if (next === current) return false;

  lines = next;
  if (!inMemory) {
    try {
      raw = JSON.stringify(next);
      window.localStorage.setItem(STORAGE_KEY, raw);
    } catch {
      inMemory = true;
    }
  }
  notify();
  return true;
}
