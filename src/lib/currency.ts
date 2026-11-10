"use client";

import { useSyncExternalStore } from "react";

// Prices are stored and charged in AUD. Other currencies are display only,
// converted at a daily rate. Rates below are fallbacks (per 1 AUD) if the
// live rate cannot be fetched.
export const CURRENCIES: Record<string, { symbol: string; fallback: number }> = {
  AUD: { symbol: "A$", fallback: 1 },
  USD: { symbol: "US$", fallback: 0.65 },
  EUR: { symbol: "€", fallback: 0.6 },
  GBP: { symbol: "£", fallback: 0.5 },
};

interface State {
  code: string;
  rates: Record<string, number>;
}

const fallbackRates = Object.fromEntries(
  Object.entries(CURRENCIES).map(([k, v]) => [k, v.fallback])
);

const SERVER_STATE: State = { code: "AUD", rates: fallbackRates };
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
  let code = "AUD";
  let rates = fallbackRates;
  try {
    const saved = localStorage.getItem("xuo-currency-aud");
    if (saved && CURRENCIES[saved]) code = saved;
    const cached = JSON.parse(localStorage.getItem("xuo-rates-aud") ?? "null");
    if (cached?.rates) rates = { ...fallbackRates, ...cached.rates };
    emit({ code, rates });
    if (cached && Date.now() - cached.t < 24 * 3600 * 1000) return;
  } catch {
    emit({ code, rates });
  }
  fetch("https://open.er-api.com/v6/latest/AUD")
    .then((r) => r.json())
    .then((d) => {
      const r: Record<string, number> = { AUD: 1 };
      for (const k of Object.keys(CURRENCIES)) {
        if (typeof d?.rates?.[k] === "number") r[k] = d.rates[k];
      }
      try {
        localStorage.setItem("xuo-rates-aud", JSON.stringify({ t: Date.now(), rates: r }));
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
    localStorage.setItem("xuo-currency-aud", code);
  } catch {}
  emit({ ...state, code });
}

export function formatAud(n: number) {
  return `A$${n.toLocaleString("en-AU")}`;
}
