"use client";

import { useSyncExternalStore } from "react";

// Prices are stored and charged in USD. Other currencies are display only,
// converted at a daily rate. Rates below are fallbacks if the live rate
// cannot be fetched.
export const CURRENCIES: Record<string, { symbol: string; fallback: number }> = {
  USD: { symbol: "$", fallback: 1 },
  AUD: { symbol: "A$", fallback: 1.55 },
  EUR: { symbol: "€", fallback: 0.92 },
  GBP: { symbol: "£", fallback: 0.78 },
};

interface State {
  code: string;
  rates: Record<string, number>;
}

const fallbackRates = Object.fromEntries(
  Object.entries(CURRENCIES).map(([k, v]) => [k, v.fallback])
);

const SERVER_STATE: State = { code: "USD", rates: fallbackRates };
let state: State = SERVER_STATE;
const listeners = new Set<() => void>();
let started = false;

function emit(next: State) {
  state = next;
  listeners.forEach((l) => l());
}

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  let code = "USD";
  let rates = fallbackRates;
  try {
    const saved = localStorage.getItem("xuo-currency");
    if (saved && CURRENCIES[saved]) code = saved;
    const cached = JSON.parse(localStorage.getItem("xuo-rates") ?? "null");
    if (cached?.rates) rates = { ...fallbackRates, ...cached.rates };
    emit({ code, rates });
    if (cached && Date.now() - cached.t < 24 * 3600 * 1000) return;
  } catch {
    emit({ code, rates });
  }
  fetch("https://open.er-api.com/v6/latest/USD")
    .then((r) => r.json())
    .then((d) => {
      const r: Record<string, number> = { USD: 1 };
      for (const k of Object.keys(CURRENCIES)) {
        if (typeof d?.rates?.[k] === "number") r[k] = d.rates[k];
      }
      try {
        localStorage.setItem("xuo-rates", JSON.stringify({ t: Date.now(), rates: r }));
      } catch {}
      emit({ code: state.code, rates: { ...fallbackRates, ...r } });
    })
    .catch(() => {});
}

function subscribe(l: () => void) {
  listeners.add(l);
  start();
  return () => {
    listeners.delete(l);
  };
}

export function useCurrency() {
  return useSyncExternalStore(subscribe, () => state, () => SERVER_STATE);
}

export function setCurrency(code: string) {
  if (!CURRENCIES[code]) return;
  try {
    localStorage.setItem("xuo-currency", code);
  } catch {}
  emit({ ...state, code });
}

export function formatUsd(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}
