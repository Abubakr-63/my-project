"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const onClient = () => false;
const onServer = () => true;

export function ThemeScript({ source }: { source: string }) {
  // The browser executes the server-rendered head script during HTML parsing.
  // Locale transitions use ThemeSync and never mount another script element.
  const fromDocument = useSyncExternalStore(subscribe, onClient, onServer);
  return fromDocument ? <script id="theme-bootstrap" dangerouslySetInnerHTML={{ __html: source }} /> : null;
}
